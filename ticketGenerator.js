// ticketGenerator.js
const logger = require('./logger');

const ticketStore = new Map();

const generateTicketId = () => {
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `TCK-${random}`;
};

const generateTicket = (data) => {
  let id;
  do { id = generateTicketId(); } while (ticketStore.has(id));

  const ticket = {
    id, type: data.type, name: data.name, account: data.account,
    contact: data.contact, description: data.description,
    phone: data.phone, createdAt: new Date().toISOString(), status: 'ouvert',
  };

  ticketStore.set(id, ticket);
  logger.ticketGenerated(data.phone, id, data.type);
  return ticket;
};

const getTicket      = (id) => ticketStore.get(id) || null;
const getAllTickets   = ()   => Array.from(ticketStore.values());
const getTicketCount = ()   => ticketStore.size;

module.exports = { generateTicket, getTicket, getAllTickets, getTicketCount };
