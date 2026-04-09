// stateManager.js
const logger = require('./logger');

const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
const sessions = new Map();

const createEmptySession = () => ({
  state: 'idle',
  data: { type: null, description: null, name: null, account: null, contact: null },
  lastActivity: Date.now(),
  submitted: false,
  lastTicketId: null,
});

const getSession = (phone) => {
  if (!sessions.has(phone)) {
    sessions.set(phone, createEmptySession());
    return sessions.get(phone);
  }
  const session = sessions.get(phone);
  if (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS) {
    logger.sessionTimeout(phone);
    const fresh = createEmptySession();
    sessions.set(phone, fresh);
    return { ...fresh, timedOut: true };
  }
  return session;
};

const setState = (phone, newState, dataUpdate = {}) => {
  const session = sessions.get(phone) || createEmptySession();
  const oldState = session.state;
  session.state = newState;
  session.data = { ...session.data, ...dataUpdate };
  session.lastActivity = Date.now();
  sessions.set(phone, session);
  if (oldState !== newState) logger.stateTransition(phone, oldState, newState);
};

const resetSession = (phone) => {
  sessions.set(phone, createEmptySession());
  logger.stateTransition(phone, 'any', 'idle');
};

const markSubmitted = (phone, ticketId) => {
  const session = sessions.get(phone);
  if (session) {
    session.submitted = true;
    session.lastTicketId = ticketId;
    session.lastActivity = Date.now();
    sessions.set(phone, session);
  }
};

const getActiveSessionCount = () => sessions.size;

module.exports = { getSession, setState, resetSession, markSubmitted, getActiveSessionCount };
