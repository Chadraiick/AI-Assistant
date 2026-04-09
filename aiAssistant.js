// aiAssistant.js
const logger = require('./logger');
const kb     = require('./knowledge');

const buildSystemPrompt = () => {
  const agencesList = kb.agences.map(a =>
    `- ${a.nom} (${a.ville}) : ${a.adresse}, tél: ${a.tel}, horaires: ${a.horaires}`
  ).join('\n');

  const faqList = kb.faq.map(f => `Q: ${f.question}\nR: ${f.reponse}`).join('\n\n');

  return `Tu es l'assistant virtuel officiel de ${kb.banque.nom}.
Réponds aux questions des clients WhatsApp de façon claire, courte et professionnelle.

BANQUE : ${kb.banque.nom} | Tél: ${kb.banque.telephone} | Urgences: ${kb.banque.urgence} | Email: ${kb.banque.email}

HORAIRES : ${kb.horaires.semaine} | ${kb.horaires.samedi} | ${kb.horaires.dimanche}

AGENCES :
${agencesList}

VIREMENTS : Interne ${kb.virements.interne.delai} (${kb.virements.interne.frais}) | National ${kb.virements.national.delai} (${kb.virements.national.frais}) | International ${kb.virements.international.delai} (${kb.virements.international.frais})

CARTES : Opposition 24h/24 → ${kb.cartes.opposition.telephone} | Limite retrait: ${kb.cartes.limiteRetrait}

FAQ :
${faqList}

RÈGLES :
1. Réponds TOUJOURS en français
2. Max 5 lignes — c'est WhatsApp
3. Ne jamais inventer d'informations
4. Questions sur compte personnel → orienter vers ${kb.banque.telephone} ou agence
5. Ne jamais dire que tu es une IA — tu es "l'assistant de ${kb.banque.nom}"`;
};

const askAI = async (question, history = []) => {
  try {
    const messages = [
      ...history.slice(-6),
      { role: 'user', content: question },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system:     buildSystemPrompt(),
        messages,
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();
    if (!text) throw new Error('Réponse vide');

    logger.info('Réponse IA générée', { event: 'ai_response', tokens: data.usage?.output_tokens });
    return text;

  } catch (err) {
    logger.error('Erreur Claude API', { event: 'ai_error', error: err.message });
    return null;
  }
};

const ESCALADE_MESSAGE =
  `Je ne peux pas répondre précisément à cette demande 🙏\n\n` +
  `Nos conseillers sont disponibles :\n` +
  `📞 ${kb.banque.telephone}\n` +
  `📧 ${kb.banque.email}\n` +
  `🏦 Dans l'une de nos agences\n\n` +
  `Horaires : ${kb.horaires.semaine}`;

module.exports = { askAI, ESCALADE_MESSAGE };
