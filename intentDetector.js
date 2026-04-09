// intentDetector.js
const Fuse = require('fuse.js');
const corpusData = require('./corpus');

const buildCorpus = () => {
  const entries = [];
  for (const [intent, phrases] of Object.entries(corpusData)) {
    for (const phrase of phrases) {
      entries.push({ phrase: phrase.toLowerCase(), intent });
    }
  }
  return entries;
};

const fuse = new Fuse(buildCorpus(), {
  threshold: 0.45,
  includeScore: true,
  keys: ['phrase'],
  ignoreLocation: true,
  minMatchCharLength: 3,
  distance: 200,
});

const regexPatterns = [
  { pattern: /\b(retrait|retirer|distributeur|dab|guichet\s*auto|sortir\s*argent|cash|billet|limite\s*retrait|plafond\s*retrait)\b/i, intent: 'retrait',         confidence: 0.92 },
  { pattern: /\b(virement|virer|transférer|transfert|envoyer\s*argent|mobile\s*money|délai\s*virement|frais\s*virement)\b/i,        intent: 'virement',        confidence: 0.92 },
  { pattern: /\b(réclam|plainte|contester|débité\s*par\s*erreur|argent\s*dispar|transaction\s*inconnue|fraude|signaler\s*problème|mécontent)\b/i, intent: 'reclamation', confidence: 0.93 },
  { pattern: /\b(solde|relevé|historique|transactions|mouvements|extrait|combien\s*j.?ai|voir\s*mon\s*compte)\b/i,                  intent: 'solde',           confidence: 0.90 },
  { pattern: /\b(carte\s*(perdu|volé|bloqué|expiré|avalé)|opposition|bloquer\s*carte|code\s*pin|renouveler?\s*carte|activer\s*carte)\b/i, intent: 'cartes',    confidence: 0.92 },
  { pattern: /\b(ouvr\w*\s*(un\s*)?compte|créer?\s*(un\s*)?compte|nouveau\s*compte|devenir\s*client|inscription|dépôt\s*minimum)\b/i, intent: 'creation_compte', confidence: 0.92 },
  { pattern: /\b(horaire|heure[s]?\s*(d.?ouverture|fermeture)|ouvert\s*(samedi|dimanche|aujourd.?hui)|fermé|planning)\b/i,          intent: 'horaires',        confidence: 0.90 },
  { pattern: /\b(adresse|agence\s*(proche|bobo|koudougou|ouaga)|succursale|localis|situé|où\s*(êtes|se\s*trouve))\b/i,              intent: 'localisation',    confidence: 0.88 },
  { pattern: /\b(application|appli|mot\s*de\s*passe\s*appli|service\s*en\s*ligne|banque\s*en\s*ligne)\b/i,                          intent: 'appli',           confidence: 0.88 },
  { pattern: /^(bonjour|bonsoir|salut|allo|hello|salam|hi|aide|help|menu|start|1)[\s!?.]*$/i,                                        intent: 'salutation',      confidence: 0.97 },
];

const normalizeMessage = (msg) =>
  msg.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, ' ').replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();

const detectIntent = (message) => {
  if (!message?.trim()) return { intent: null, confidence: 0 };

  for (const { pattern, intent, confidence } of regexPatterns) {
    if (pattern.test(message)) return { intent, confidence };
  }

  const normalized = normalizeMessage(message);
  for (const { pattern, intent, confidence } of regexPatterns) {
    if (pattern.test(normalized)) return { intent, confidence: confidence * 0.95 };
  }

  const results = fuse.search(normalized);
  if (!results.length) return { intent: null, confidence: 0 };

  const confidence = 1 - (results[0].score || 0);
  if (confidence < 0.55) return { intent: null, confidence };

  return { intent: results[0].item.intent, confidence: Math.round(confidence * 100) / 100 };
};

module.exports = { detectIntent };
