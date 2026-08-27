'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Call this AFTER defining your validation chain rules on a route.
 * Returns 400 VALIDATION_ERROR with field-level details if validation fails.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = {};
    errors.array().forEach((err) => {
      if (!details[err.path]) {
        details[err.path] = err.msg;
      }
    });
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details,
      },
    });
  }
  next();
}

module.exports = { validate };
