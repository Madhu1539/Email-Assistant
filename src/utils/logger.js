'use strict';

const { NODE_ENV } = require('../config/env');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = NODE_ENV === 'production' ? 'info' : 'debug';

// Sensitive keys that must never appear in logs
const SENSITIVE_KEYS = new Set([
  'password',
  'passwordConfirmation',
  'token',
  'accessToken',
  'refreshToken',
  'encryptedAccessToken',
  'encryptedRefreshToken',
  'jwt',
  'secret',
  'apiKey',
  'api_key',
  'OPENROUTER_API_KEY',
  'GEMINI_API_KEY',
  'TOKEN_ENCRYPTION_KEY',
  'JWT_SECRET',
  'authorization',
]);

function redactSensitive(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const result = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactSensitive(obj[key]);
    }
  }
  return result;
}

function formatMessage(level, message, meta) {
  const ts = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(redactSensitive(meta))}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[CURRENT_LEVEL];
}

const logger = {
  error: (message, meta) => {
    if (shouldLog('error')) console.error(formatMessage('error', message, meta));
  },
  warn: (message, meta) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  info: (message, meta) => {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  debug: (message, meta) => {
    if (shouldLog('debug')) console.log(formatMessage('debug', message, meta));
  },
};

module.exports = logger;
