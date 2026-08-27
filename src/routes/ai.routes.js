'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const aiController  = require('../controllers/ai.controller');
const { authenticate }  = require('../middleware/authenticate');
const { requireGmail }  = require('../middleware/requireGmail');
const { validate }      = require('../middleware/validate');
const { aiLimiter }     = require('../middleware/rateLimiter');

const router = Router();

const protect = [authenticate, requireGmail, aiLimiter];

// POST /api/ai/summarize/:messageId
router.post(
  '/summarize/:messageId',
  protect,
  aiController.summarize
);

// POST /api/ai/reply/:messageId
router.post(
  '/reply/:messageId',
  protect,
  [
    body('instructions')
      .optional()
      .isString()
      .isLength({ max: 500 }).withMessage('Instructions must not exceed 500 characters.'),
  ],
  validate,
  aiController.generateReply
);

// POST /api/ai/generate  — compose from description (no Gmail required)
router.post(
  '/generate',
  authenticate,
  aiLimiter,
  [
    body('description')
      .notEmpty().withMessage('Description is required.')
      .isString()
      .isLength({ min: 5, max: 1000 }).withMessage('Description must be 5–1000 characters.'),
  ],
  validate,
  aiController.generateCompose
);

// POST /api/ai/classify/:messageId
router.post('/classify/:messageId', protect, aiController.classify);

// POST /api/ai/prioritize/:messageId
router.post('/prioritize/:messageId', protect, aiController.prioritize);

// POST /api/ai/extract-actions/:messageId
router.post('/extract-actions/:messageId', protect, aiController.extractActions);

module.exports = router;
