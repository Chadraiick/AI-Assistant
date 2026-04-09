// knowledge.js — Base de connaissances de la banque
module.exports = {
  banque: {
    nom:       'Banque Sahel Finance',
    telephone: '+226 25 30 00 00',
    urgence:   '+226 25 30 00 01',
    email:     'contact@sahel-finance.bf',
    site:      'www.sahel-finance.bf',
    appMobile: 'Sahel Finance App (App Store et Play Store)',
  },
  horaires: {
    semaine:        'Lundi – Vendredi : 08h00 – 17h00',
    samedi:         'Samedi : 08h00 – 13h00',
    dimanche:       'Dimanche : Fermé',
    feries:         'Jours fériés : Fermé',
    chatDisponible: '24h/24 – 7j/7',
  },
  agences: [
    { nom: 'Siège Social',          ville: 'Ouagadougou',    adresse: 'Avenue Kwame Nkrumah, Secteur 4',       tel: '+226 25 30 00 00', horaires: 'Lun-Ven 08h-17h / Sam 08h-13h' },
    { nom: 'Agence Ouaga 2000',     ville: 'Ouagadougou',    adresse: 'Rue des Roses, Secteur 53, Ouaga 2000', tel: '+226 25 30 00 10', horaires: 'Lun-Ven 08h-17h / Sam 08h-13h' },
    { nom: 'Agence Bobo-Dioulasso', ville: 'Bobo-Dioulasso', adresse: 'Avenue de la République, Secteur 1',    tel: '+226 20 97 00 00', horaires: 'Lun-Ven 08h-17h' },
    { nom: 'Agence Koudougou',      ville: 'Koudougou',      adresse: 'Rue du Commerce, Centre-ville',         tel: '+226 25 44 00 00', horaires: 'Lun-Ven 08h-17h' },
  ],
  ouvertureCompte: {
    documentsRequis: [
      "Pièce d'identité valide (CNI, passeport ou permis)",
      'Justificatif de domicile de moins de 3 mois',
      'Numéro de téléphone valide',
      'Photo d'identité récente (2 exemplaires)',
    ],
    depotMinimum:   '10 000 FCFA',
    delaiOuverture: '24 à 48 heures ouvrées',
    typesComptes:   ['Compte courant', 'Compte épargne', 'Compte professionnel', 'Compte jeune (gratuit)'],
    processus:      'Rendez-vous en agence ou via le site web.',
  },
  cartes: {
    typesDisponibles:  ['Visa Classic', 'Visa Gold', 'Mastercard Standard', 'Carte prépayée'],
    opposition:        { disponible: '24h/24 – 7j/7', telephone: '+226 25 30 00 01', delai: 'Blocage immédiat' },
    renouvellement:    { delai: '5 à 7 jours ouvrés', frais: '2 500 FCFA' },
    limiteRetrait:     '500 000 FCFA / jour',
    limitePaiement:    '1 000 000 FCFA / jour',
    modificationLimite:'Via l'application mobile ou en agence',
  },
  virements: {
    interne:       { delai: 'Immédiat',            frais: 'Gratuit' },
    national:      { delai: '24 heures ouvrées',   frais: '0,5% du montant (min. 500 FCFA)' },
    international: { delai: '2 à 5 jours ouvrés',  frais: '1,5% du montant (min. 2 500 FCFA)' },
  },
  faq: [
    { question: 'Comment consulter mon solde ?',        reponse: 'Via l'application mobile ou en composant le *120# sur votre téléphone.' },
    { question: 'Comment obtenir un relevé de compte ?', reponse: 'Gratuit sur l'app mobile. En agence : 500 FCFA pour les 3 derniers mois.' },
    { question: 'Que faire en cas de perte de carte ?',  reponse: `Appelez immédiatement le +226 25 30 00 01 (disponible 24h/24).` },
    { question: 'Comment activer l'application mobile ?', reponse: 'Téléchargez "Sahel Finance App", puis activez-la en agence avec votre CNI.' },
    { question: 'Quels sont les frais de tenue de compte ?', reponse: 'Compte courant : 500 FCFA/mois. Compte épargne et jeune : gratuit.' },
  ],
  messages: {
    bienvenue:     `Bonjour ! 👋 Je suis l'assistant de *Sahel Finance*.\n\nComment puis-je vous aider ?\n\n1️⃣ Ouvrir un compte\n2️⃣ Horaires d'ouverture\n3️⃣ Services carte bancaire\n4️⃣ Localiser une agence\n5️⃣ Faire une réclamation`,
    fallback:      `Je ne suis pas sûr de comprendre 🤔\n\nVoulez-vous :\n\n1️⃣ Créer un compte\n2️⃣ Voir les horaires\n3️⃣ Carte bancaire\n4️⃣ Trouver une agence\n5️⃣ Faire une réclamation\n\nOu appelez-nous au *+226 25 30 00 00*`,
    timeout:       `Votre session a expiré ⏰\n\nBonjour ! Je suis l'assistant de *Sahel Finance*. Tapez *bonjour* pour recommencer.`,
    erreurInterne: `Une erreur est survenue 😔\nVeuillez réessayer ou appelez le *+226 25 30 00 00*`,
  },
  reclamation: {
    delaiTraitement: '48 heures ouvrées',
    contact:         'reclamations@sahel-finance.bf',
    typeLabels:      { '1': '⚠️ Plainte', '2': '📝 Réclamation', '3': '💸 Erreur Virement' },
  },
};
