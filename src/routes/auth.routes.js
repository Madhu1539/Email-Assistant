'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { registrationLimiter, loginLimiter } = require('../middleware/rateLimiter');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  registrationLimiter,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required.')
      .isLength({ min: 1, max: 100 }).withMessage('Name must be 1–100 characters.'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Must be a valid email address.')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password')
      .notEmpty().withMessage('Password is required.')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('passwordConfirmation')
      .notEmpty().withMessage('Password confirmation is required.')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match.');
        }
        return true;
      }),
  ],
  validate,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Must be a valid email address.')
      .normalizeEmail({ gmail_remove_dots: false }),
    body('password')
      .notEmpty().withMessage('Password is required.'),
  ],
  validate,
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

module.exports = router;
