// server.js
require('dotenv').config();

const express       = require('express');
const twilio        = require('twilio');
const logger        = require('./logger');
const kb            = require('./knowledge');
const { detectIntent }                              = require('./intentDetector');
const { getSession, setState, resetSession }        = require('./stateManager');
const { getActiveSessionCount }                     = require('./stateManager');
const { handleReclamationFlow, startReclamationFlow } = require('./reclamationFlow');
const { getTicketCount }                            = require('./ticketGenerator');
const { askAI, ESCALADE_MESSAGE }                   = require('./aiAssistant');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ─── Historique de conversation ───────────────────────────────
const conversationHistory = new Map();
const addToHistory = (phone, role, content) => {
  if (!conversationHistory.has(phone)) conversationHistory.set(phone, []);
  const h = conversationHistory.get(phone);
  h.push({ role, content });
  if (h.length > 10) h.splice(0, h.length - 10);
};
const getHistory = (phone) => conversationHistory.get(phone) || [];

// ─── Réponses depuis knowledge.js ─────────────────────────────
const INTENT_RESPONSES = {
  horaires:
    `⏰ *Horaires ${kb.banque.nom} :*\n\n• ${kb.horaires.semaine}\n• ${kb.horaires.samedi}\n• ${kb.horaires.dimanche}\n\n💬 Ce chat est disponible *${kb.horaires.chatDisponible}*`,

  creation_compte:
    `🆕 *Ouvrir un compte :*\n\n*Documents requis :*\n` +
    kb.ouvertureCompte.documentsRequis.map(d => `• ${d}`).join('\n') +
    `\n\n*Dépôt minimum :* ${kb.ouvertureCompte.depotMinimum}\n*Délai :* ${kb.ouvertureCompte.delaiOuverture}`,

  cartes:
    `💳 *Services carte :*\n\n🚨 *Carte perdue/volée :*\n• Appelez le *${kb.cartes.opposition.telephone}* (${kb.cartes.opposition.disponible})\n\n• Limite retrait : ${kb.cartes.limiteRetrait}\n• Limite paiement : ${kb.cartes.limitePaiement}`,

  localisation:
    `📍 *Nos agences :*\n\n` +
    kb.agences.map(a => `🏦 *${a.nom}* — ${a.ville}\n   📌 ${a.adresse}\n   📞 ${a.tel}`).join('\n\n'),

  virement:
    `💸 *Virements :*\n\n• Interne : ${kb.virements.interne.delai} — ${kb.virements.interne.frais}\n• National : ${kb.virements.national.delai} — ${kb.virements.national.frais}\n• International : ${kb.virements.international.delai} — ${kb.virements.international.frais}`,

  solde:
    `📊 *Consulter votre solde :*\n\n• Via l'application mobile *${kb.banque.appMobile}*\n• En composant le *120#* sur votre téléphone\n• En agence`,

  appli:
    `📱 *Application mobile :*\n\n• Téléchargez *${kb.banque.appMobile}*\n• Activation en agence avec votre CNI\n• Support : ${kb.banque.telephone}`,

  salutation: kb.messages.bienvenue,
};

// ─── TwiML builder ────────────────────────────────────────────
const buildTwiML = (message) => {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return twiml.toString();
};

// ─── Validation signature Twilio ──────────────────────────────
const validateTwilio = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.warn('Signature Twilio non vérifiée (mode dev)');
    return next();
  }
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers['x-twilio-signature'];
  const url       = process.env.WEBHOOK_URL;

  if (!authToken || !signature || !url) return res.status(403).send('Forbidden');
  if (!twilio.validateRequest(authToken, signature, url, req.body))
    return res.status(403).send('Invalid signature');

  next();
};

// ─── Webhook principal ────────────────────────────────────────
app.post('/webhook', validateTwilio, async (req, res) => {
  let responseMessage = '';
  const sender  = req.body.From;
  const message = req.body.Body;

  try {
    if (!message || !sender) return res.status(400).send('Bad Request');

    logger.incomingMessage(sender, message, 'pending');
    addToHistory(sender, 'user', message);

    // 1. Session
    const session = getSession(sender);
    if (session.timedOut) {
      conversationHistory.delete(sender);
      responseMessage = kb.messages.timeout;
      res.type('text/xml');
      return res.send(buildTwiML(responseMessage));
    }

    // 2. Intention
    const { intent, confidence } = detectIntent(message);
    logger.intentDetected(sender, intent, confidence);

    // 3. Interruption si nouveau sujet
    const FLOW_STATES = ['choosing_reclamation_type', 'describing_problem',
      'entering_name', 'entering_account', 'entering_contact', 'confirmation'];
    const isInFlow = FLOW_STATES.includes(session.state);

    if (!isInFlow && intent && session.state !== 'idle') resetSession(sender);

    // 4. Routing
    if (isInFlow) {
      responseMessage = await handleReclamationFlow(sender, message, session);

    } else if (intent === 'reclamation') {
      responseMessage = startReclamationFlow(sender);

    } else if (intent && INTENT_RESPONSES[intent]) {
      responseMessage = INTENT_RESPONSES[intent];
      setState(sender, 'idle');

    } else {
      // Fallback IA
      logger.fallback(sender, message);
      if (process.env.ANTHROPIC_API_KEY) {
        const aiReply = await askAI(message, getHistory(sender).slice(0, -1));
        responseMessage = aiReply || ESCALADE_MESSAGE;
      } else {
        responseMessage = kb.messages.fallback;
      }
    }

  } catch (err) {
    logger.error('Erreur webhook', { error: err.message, stack: err.stack });
    responseMessage = kb.messages.erreurInterne;
  }

  addToHistory(sender, 'assistant', responseMessage);
  res.type('text/xml');
  res.send(buildTwiML(responseMessage));
});

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    stats: { activeSessions: getActiveSessionCount(), totalTickets: getTicketCount() },
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => res.json({ name: 'WhatsApp Bot Twilio', status: 'running' }));

// ─── Erreurs globales ─────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Erreur Express', { error: err.message });
  res.type('text/xml').status(500)
    .send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Service indisponible.</Message></Response>`);
});

app.listen(PORT, () => logger.info(`Serveur démarré sur le port ${PORT}`));

process.on('SIGTERM', () => process.exit(0));
process.on('uncaughtException', (err) => { logger.error('Exception non capturée', { error: err.message }); process.exit(1); });

module.exports = app;
