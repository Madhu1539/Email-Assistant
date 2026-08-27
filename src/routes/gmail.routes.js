'use strict';

const { Router } = require('express');
const gmailController = require('../controllers/gmail.controller');
const { authenticate } = require('../middleware/authenticate');
const { oauthLimiter } = require('../middleware/rateLimiter');

const router = Router();

// GET /api/gmail/oauth/start — Redirect user to Google consent
router.get('/oauth/start', authenticate, oauthLimiter, gmailController.startOAuth);

// GET /api/gmail/oauth/callback — Google redirects here after consent
// Note: We still require the JWT cookie here (SameSite=Lax allows it for redirects)
router.get('/oauth/callback', authenticate, oauthLimiter, gmailController.handleCallback);

// GET /api/gmail/status — Get Gmail connection status
router.get('/status', authenticate, gmailController.getStatus);

// POST /api/gmail/disconnect — Disconnect Gmail account
router.post('/disconnect', authenticate, gmailController.disconnect);

module.exports = router;
