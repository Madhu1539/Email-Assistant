'use strict';

const rateLimit = require('express-rate-limit');
const { createError } = require('./errorHandler');

function rateLimitErrorHandler(req, res) {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: {},
    },
  });
}

// Registration: 5 attempts per hour per IP
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

// Login: 10 attempts per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

// OAuth endpoints: 20 per 15 minutes per IP
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

// AI endpoints: 10 per minute per IP (will be scoped per-user in Phase 5)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

// Email send: 20 per hour per IP
const sendEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

// General API: 200 per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitErrorHandler,
});

module.exports = {
  registrationLimiter,
  loginLimiter,
  oauthLimiter,
  aiLimiter,
  sendEmailLimiter,
  generalLimiter,
};
