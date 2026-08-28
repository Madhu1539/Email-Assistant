'use strict';

const { Router } = require('express');
const gmailController = require('../controllers/gmail.controller');
const { authenticate } = require('../middleware/authenticate');
const { oauthLimiter } = require('../middleware/rateLimiter');

const router = Router();

// GET /api/gmail/oauth/start — Redirect user to Google consent
router.get('/oauth/start', authenticate, oauthLimiter, gmailController.startOAuth);

// GET /api/gmail/oauth/callback — Google redirects here after consent
// User identity is securely validated via the cryptographically signed OAuth state token
router.get('/oauth/callback', oauthLimiter, gmailController.handleCallback);

// GET /api/gmail/status — Get Gmail connection status
router.get('/status', authenticate, gmailController.getStatus);

// POST /api/gmail/disconnect — Disconnect Gmail account
router.post('/disconnect', authenticate, gmailController.disconnect);

module.exports = router;
