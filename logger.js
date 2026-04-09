// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, colorize, printf } = format;

const maskPhone = (phone) => {
  if (!phone) return 'unknown';
  const clean = phone.replace(/\D/g, '');
  return `***${clean.slice(-4)}`;
};

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${timestamp} [${level}] ${message} ${metaStr}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), devFormat)
  ),
  transports: [new transports.Console()],
});

logger.incomingMessage = (phone, message, state) =>
  logger.info('Message entrant', { event: 'incoming_message', phone: maskPhone(phone), message: message?.substring(0, 100), state });

logger.intentDetected = (phone, intent, confidence) =>
  logger.info('Intention détectée', { event: 'intent_detected', phone: maskPhone(phone), intent, confidence });

logger.stateTransition = (phone, fromState, toState) =>
  logger.info('Transition état', { event: 'state_transition', phone: maskPhone(phone), from: fromState, to: toState });

logger.ticketGenerated = (phone, ticketId, type) =>
  logger.info('Ticket généré', { event: 'ticket_generated', phone: maskPhone(phone), ticketId, type });

logger.fallback = (phone, message) =>
  logger.warn('Fallback déclenché', { event: 'fallback', phone: maskPhone(phone), message: message?.substring(0, 100) });

logger.sessionTimeout = (phone) =>
  logger.warn('Session expirée', { event: 'session_timeout', phone: maskPhone(phone) });

logger.duplicateSubmission = (phone, ticketId) =>
  logger.warn('Double soumission bloquée', { event: 'duplicate_submission', phone: maskPhone(phone), ticketId });

module.exports = logger;
