'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/env');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const JWT_EXPIRES_IN = '24h';

/**
 * Generates a signed JWT containing only the user's ID.
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} Signed JWT
 */
function generateToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Registers a new user.
 * @param {{ name, email, password }} data
 * @returns {Promise<User>}
 * @throws Operational error on duplicate email or validation failure
 */
async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw createError('DUPLICATE_ACCOUNT', 'An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password, // Pre-save hook hashes it
  });

  logger.info('User registered', { userId: user._id });

  // Return user without password (toJSON transformer handles this)
  return user.toJSON();
}

/**
 * Logs in a user with email/password.
 * Returns user object and signed JWT.
 * Generic error message prevents user enumeration.
 *
 * @param {{ email, password }} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Must explicitly select password (it's select:false on schema)
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw createError('AUTH_INVALID', 'Invalid credentials.');
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    throw createError('AUTH_INVALID', 'Invalid credentials.');
  }

  // Update last login timestamp
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  const token = generateToken(user._id.toString());

  logger.info('User logged in', { userId: user._id });

  // Strip password before returning
  const userObj = user.toJSON();

  return { user: userObj, token };
}

/**
 * Returns the public profile of a user by ID.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getUserById(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw createError('AUTH_REQUIRED', 'Authentication required.');
  }
  return user.toJSON();
}

module.exports = { registerUser, loginUser, getUserById, generateToken };
