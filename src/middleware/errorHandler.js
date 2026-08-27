'use strict';

const { NODE_ENV } = require('../config/env');
const logger = require('../utils/logger');

// Mapping of known error codes to HTTP status codes
const ERROR_STATUS_MAP = {
  VALIDATION_ERROR: 400,
  AUTH_REQUIRED: 401,
  AUTH_INVALID: 401,
  AUTH_EXPIRED: 401,
  GMAIL_AUTH_EXPIRED: 401,
  OAUTH_ERROR: 400,
  OAUTH_STATE_INVALID: 400,
  INVALID_EMAIL: 400,
  DUPLICATE_ACCOUNT: 409,
  GMAIL_NOT_CONNECTED: 403,
  RESOURCE_NOT_FOUND: 404,
  GMAIL_RATE_LIMIT: 429,
  RATE_LIMITED: 429,
  EMAIL_SEND_FAILED: 503,
  AI_PROVIDER_UNAVAILABLE: 503,
  GMAIL_API_ERROR: 502,
  AI_TIMEOUT: 504,
  AI_GENERATION_FAILED: 500,
  INTERNAL_ERROR: 500,
};

/**
 * Creates a structured application error.
 * @param {string} code - One of the standard error codes
 * @param {string} message - Human-readable message (safe to show users)
 * @param {object} [details] - Optional field-level details (validation errors, etc.)
 */
function createError(code, message, details = {}) {
  const err = new Error(message);
  err.code = code;
  err.details = details;
  err.isOperational = true;
  return err;
}

/**
 * Global Express error handler middleware.
 * Must be registered LAST in app.js after all routes.
 */
function errorHandler(err, req, res, _next) {
  // Operational errors: known, safe to relay to client
  if (err.isOperational) {
    const status = ERROR_STATUS_MAP[err.code] || 500;
    return res.status(status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || {},
      },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = {};
    Object.keys(err.errors).forEach((field) => {
      details[field] = err.errors[field].message;
    });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        details,
      },
    });
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ACCOUNT',
        message: 'An account with this email already exists.',
        details: {},
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_EXPIRED',
        message: 'Session expired. Please log in again.',
        details: {},
      },
    });
  }

  // Unknown / programming errors — log full details server-side, return safe response
  logger.error('Unhandled error', {
    message: err.message,
    stack: NODE_ENV !== 'production' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: {},
    },
  });
}

module.exports = { errorHandler, createError };
