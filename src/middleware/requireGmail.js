'use strict';

const { getGmailStatus } = require('../services/gmailService');
const { createError } = require('./errorHandler');

/**
 * Middleware: ensures the authenticated user has Gmail connected.
 * Must be used AFTER the `authenticate` middleware.
 *
 * On failure returns 403 GMAIL_NOT_CONNECTED.
 */
async function requireGmail(req, res, next) {
  try {
    const { isConnected } = await getGmailStatus(req.user._id.toString());
    if (!isConnected) {
      return next(
        createError(
          'GMAIL_NOT_CONNECTED',
          'Gmail is not connected. Please connect your Gmail account in Integrations.'
        )
      );
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireGmail };
