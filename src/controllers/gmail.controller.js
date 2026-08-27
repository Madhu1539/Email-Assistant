'use strict';

const gmailService = require('../services/gmailService');
const { CLIENT_URL } = require('../config/env');
const logger = require('../utils/logger');

/**
 * GET /api/gmail/oauth/start
 * Generates OAuth state and redirects user to Google consent screen.
 */
async function startOAuth(req, res, next) {
  try {
    const userId = req.user._id.toString();
    const authUrl = gmailService.startOAuthFlow(userId);
    res.redirect(authUrl);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/gmail/oauth/callback
 * Handles the Google OAuth callback, exchanges code for tokens.
 */
async function handleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;

    // Google may pass an error param if user denied consent
    if (error) {
      logger.warn('OAuth denied by user', { error });
      return res.redirect(`${CLIENT_URL}/integrations?error=OAUTH_DENIED`);
    }

    if (!code) {
      return res.redirect(`${CLIENT_URL}/integrations?error=OAUTH_ERROR`);
    }

    await gmailService.handleOAuthCallback(code, state);
    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    const code = err.code || 'OAUTH_ERROR';
    logger.warn('OAuth callback error', { code, message: err.message });
    res.redirect(`${CLIENT_URL}/integrations?error=${code}`);
  }
}

/**
 * GET /api/gmail/status
 * Returns the Gmail connection status for the authenticated user.
 */
async function getStatus(req, res, next) {
  try {
    const status = await gmailService.getGmailStatus(req.user._id.toString());
    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/gmail/disconnect
 * Disconnects Gmail, revokes token (best-effort), clears stored tokens.
 */
async function disconnect(req, res, next) {
  try {
    await gmailService.disconnectGmail(req.user._id.toString());
    return res.status(200).json({
      success: true,
      data: {},
      message: 'Gmail disconnected successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { startOAuth, handleCallback, getStatus, disconnect };
