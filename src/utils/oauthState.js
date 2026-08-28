'use strict';

const crypto = require('crypto');

// OAuth state store — keyed by state string, value = { userId, expiresAt }
// NOTE (A-012): This in-memory store is suitable for single-instance MVP only.
// For multi-instance/serverless deployments, replace with Redis or MongoDB storage.
const stateStore = new Map();

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes (BR-006)
const STATE_BYTES  = 32;              // 32 bytes = 256-bit entropy (BR-005)

// Periodic cleanup of expired states (every 5 minutes)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of stateStore.entries()) {
    if (val.expiresAt < now) stateStore.delete(key);
  }
}, 5 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Generates a cryptographically secure state string and stores it server-side.
 * @param {string} userId - The authenticated user's MongoDB ObjectId string
 * @returns {string} The state string to include in the OAuth redirect
 */
function generateOAuthState(userId) {
  const state = crypto.randomBytes(STATE_BYTES).toString('hex');
  stateStore.set(state, {
    userId,
    expiresAt: Date.now() + STATE_TTL_MS,
  });
  return state;
}

/**
 * Validates an OAuth state string returned from Google.
 * Deletes the state entry after validation (single-use).
 *
 * @param {string} state - State string from Google callback
 * @returns {{ userId: string }} The userId associated with this state
 * @throws Error if state is missing, expired, or not found
 */
function validateOAuthState(state) {
  if (!state) {
    const err = new Error('OAuth state is missing.');
    err.code = 'OAUTH_STATE_INVALID';
    err.isOperational = true;
    throw err;
  }

  const entry = stateStore.get(state);

  if (!entry) {
    const err = new Error('OAuth state is invalid or has already been used.');
    err.code = 'OAUTH_STATE_INVALID';
    err.isOperational = true;
    throw err;
  }

  if (Date.now() > entry.expiresAt) {
    stateStore.delete(state);
    const err = new Error('OAuth state has expired. Please try connecting again.');
    err.code = 'OAUTH_STATE_INVALID';
    err.isOperational = true;
    throw err;
  }

  // Consume the state (single-use)
  stateStore.delete(state);

  return { userId: entry.userId };
}

module.exports = { generateOAuthState, validateOAuthState };
