// validator.js
const isValidReclamationType = (input) => ['1', '2', '3'].includes(input?.trim());

const reclamationTypeLabel = (choice) => {
  const map = { '1': '⚠️ Plainte', '2': '📝 Réclamation', '3': '💸 Erreur Virement' };
  return map[choice?.trim()] || 'Inconnu';
};

const isValidDescription  = (input) => input?.trim().length >= 10;
const isValidName         = (input) => /^[a-zA-ZÀ-ÿ\s]{2,50}$/.test(input?.trim() || '');
const isValidAccount      = (input) => /^\d{5,20}$/.test(input?.trim() || '');
const isValidEmail        = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input?.trim() || '');
const isValidPhone        = (input) => /^(\+?[\d\s\-]{8,15})$/.test(input?.trim() || '');
const isValidContact      = (input) => isValidEmail(input) || isValidPhone(input);
const isConfirmationMessage = (input) => input?.trim().toLowerCase() === 'envoyer';

module.exports = {
  isValidReclamationType, reclamationTypeLabel, isValidDescription,
  isValidName, isValidAccount, isValidContact, isConfirmationMessage,
};
