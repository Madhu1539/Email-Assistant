'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { createError } = require('./errorHandler');
const User = require('../models/User');

/**
 * Authenticate middleware.
 * Reads the JWT from the HttpOnly cookie, verifies it,
 * loads the user from DB, and attaches req.user.
 * Returns 401 on any failure (no user enumeration).
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return next(createError('AUTH_REQUIRED', 'Authentication required.'));
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(createError('AUTH_EXPIRED', 'Session expired. Please log in again.'));
    }

    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      return next(createError('AUTH_REQUIRED', 'Authentication required.'));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
