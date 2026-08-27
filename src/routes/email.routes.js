'use strict';

const { Router } = require('express');
const { body, query } = require('express-validator');
const emailController = require('../controllers/email.controller');
const sendController  = require('../controllers/send.controller');
const { authenticate }     = require('../middleware/authenticate');
const { requireGmail }     = require('../middleware/requireGmail');
const { validate }         = require('../middleware/validate');
const { sendEmailLimiter } = require('../middleware/rateLimiter');

const router = Router();

// All email routes require auth + Gmail connection
const protect = [authenticate, requireGmail];

// ── GET /api/emails ────────────────────────────────────────────────────────
router.get('/', protect, emailController.listInbox);

// ── GET /api/emails/search  ───────────────────────────────────────────────
// IMPORTANT: /search must be registered BEFORE /:id to avoid Express matching
// "search" as a dynamic :id param
router.get(
  '/search',
  protect,
  [
    query('q')
      .trim()
      .notEmpty().withMessage('Search query is required.')
      .isLength({ max: 500 }).withMessage('Query must not exceed 500 characters.'),
  ],
  validate,
  emailController.searchEmails
);

// ── GET /api/emails/:id ────────────────────────────────────────────────────
router.get('/:id', protect, emailController.getEmail);

// ── GET /api/emails/:id/thread ────────────────────────────────────────────
router.get('/:id/thread', protect, emailController.getThread);

// ── Email Actions ─────────────────────────────────────────────────────────
router.post('/:id/read',    protect, emailController.markRead);
router.post('/:id/unread',  protect, emailController.markUnread);
router.post('/:id/star',    protect, emailController.starEmail);
router.post('/:id/unstar',  protect, emailController.unstarEmail);
router.post('/:id/archive', protect, emailController.archiveEmail);

// ── DELETE /api/emails/:id ────────────────────────────────────────────────
router.delete('/:id', protect, emailController.deleteEmail);

// ── POST /api/emails/send ────────────────────────────────────────────────
router.post(
  '/send',
  protect,
  sendEmailLimiter,
  [
    body('to')
      .notEmpty().withMessage('At least one recipient is required.'),
    body('body')
      .notEmpty().withMessage('Email body is required.'),
    body('subject')
      .optional()
      .isLength({ max: 998 }).withMessage('Subject must not exceed 998 characters.'),
  ],
  validate,
  sendController.sendEmail
);

// ── POST /api/emails/:id/reply ────────────────────────────────────────────
router.post(
  '/:id/reply',
  protect,
  sendEmailLimiter,
  [
    body('body')
      .notEmpty().withMessage('Reply body is required.'),
  ],
  validate,
  sendController.replyEmail
);

module.exports = router;
