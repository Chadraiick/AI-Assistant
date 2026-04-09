// reclamationFlow.js
const { isValidReclamationType, reclamationTypeLabel, isValidDescription,
        isValidName, isValidAccount, isValidContact, isConfirmationMessage } = require('./validator');
const { setState, markSubmitted, getSession, resetSession } = require('./stateManager');
const { generateTicket } = require('./ticketGenerator');
const logger = require('./logger');

const MESSAGES = {
  chooseType:          `Quelle est la nature de votre demande ?\n\n1️⃣ Plainte\n2️⃣ Réclamation\n3️⃣ Erreur Virement\n\nRépondez avec 1, 2 ou 3.`,
  invalidType:         `Choix invalide. Répondez avec 1, 2 ou 3.\n\n1️⃣ Plainte\n2️⃣ Réclamation\n3️⃣ Erreur Virement`,
  describeProbleme:    `Veuillez décrire brièvement votre problème :\n_(minimum 10 caractères)_`,
  invalidDescription:  `Description trop courte. Minimum 10 caractères.`,
  enterName:           `Votre nom et prénom :\n_(lettres et espaces uniquement)_`,
  invalidName:         `Nom invalide. Lettres et espaces uniquement (ex: Mohamed Ali).`,
  enterAccount:        `Votre numéro de compte ou identifiant client :\n_(chiffres uniquement)_`,
  invalidAccount:      `Numéro invalide. Chiffres uniquement (5 à 20 chiffres).`,
  enterContact:        `Votre email ou numéro de téléphone :`,
  invalidContact:      `Contact invalide. Ex: nom@email.com ou +22670000000`,
  alreadySubmitted:    (id) => `Votre réclamation a déjà été enregistrée ✅\nTicket : *${id}*`,
  confirmationSuccess: (t)  => `Réclamation enregistrée ✅\n\n🎟️ Ticket : *${t.id}*\n\nNotre équipe vous répondra sous 48h.`,
};

const buildSummary = (data) =>
  `📄 *Récapitulatif :*\n\n` +
  `• Type : ${data.type}\n• Nom : ${data.name}\n` +
  `• Compte : ${data.account}\n• Contact : ${data.contact}\n` +
  `• Description : ${data.description}\n\n` +
  `Tapez *envoyer* pour soumettre ou *annuler* pour recommencer.`;

const handleReclamationFlow = async (phone, message, session) => {
  const { state, data } = session;
  const input = message.trim();

  if (input.toLowerCase() === 'annuler') {
    resetSession(phone);
    return `Flow annulé. Tapez *bonjour* pour recommencer.`;
  }

  if (state === 'choosing_reclamation_type') {
    if (!isValidReclamationType(input)) return MESSAGES.invalidType;
    setState(phone, 'describing_problem', { type: reclamationTypeLabel(input) });
    return MESSAGES.describeProbleme;
  }

  if (state === 'describing_problem') {
    if (!isValidDescription(input)) return MESSAGES.invalidDescription;
    setState(phone, 'entering_name', { description: input });
    return MESSAGES.enterName;
  }

  if (state === 'entering_name') {
    if (!isValidName(input)) return MESSAGES.invalidName;
    setState(phone, 'entering_account', { name: input });
    return MESSAGES.enterAccount;
  }

  if (state === 'entering_account') {
    if (!isValidAccount(input)) return MESSAGES.invalidAccount;
    setState(phone, 'entering_contact', { account: input });
    return MESSAGES.enterContact;
  }

  if (state === 'entering_contact') {
    if (!isValidContact(input)) return MESSAGES.invalidContact;
    setState(phone, 'confirmation', { contact: input });
    const updated = getSession(phone);
    return buildSummary(updated.data);
  }

  if (state === 'confirmation') {
    if (session.submitted && session.lastTicketId)
      return MESSAGES.alreadySubmitted(session.lastTicketId);

    if (!isConfirmationMessage(input))
      return `Tapez *envoyer* pour soumettre ou *annuler* pour recommencer.\n\n${buildSummary(data)}`;

    const ticket = generateTicket({ ...data, phone });
    markSubmitted(phone, ticket.id);
    setTimeout(() => resetSession(phone), 2000);
    return MESSAGES.confirmationSuccess(ticket);
  }

  return `Tapez *annuler* pour recommencer.`;
};

const startReclamationFlow = (phone) => {
  setState(phone, 'choosing_reclamation_type');
  return MESSAGES.chooseType;
};

module.exports = { handleReclamationFlow, startReclamationFlow };
