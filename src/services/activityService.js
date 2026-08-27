'use strict';

const EmailActivity = require('../models/EmailActivity');
const logger = require('../utils/logger');

/**
 * Records an application activity event.
 * Never logs or stores sensitive data.
 *
 * @param {object} params
 * @param {string}  params.userId
 * @param {string}  params.type        - Activity type enum value
 * @param {string}  [params.status]    - 'success' | 'failure'
 * @param {string}  [params.emailId]   - Gmail message ID
 * @param {string}  [params.threadId]  - Gmail thread ID
 * @param {string}  [params.message]   - Human-readable description (safe, non-sensitive)
 * @param {object}  [params.metadata]  - Safe additional context
 */
async function recordActivity({
  userId,
  type,
  status = 'success',
  emailId = null,
  threadId = null,
  message = '',
  metadata = {},
}) {
  try {
    await EmailActivity.create({
      owner: userId,
      type,
      status,
      emailId,
      threadId,
      message: message.slice(0, 500), // Enforce max length
      metadata,
    });
  } catch (err) {
    // Activity recording failures must never crash the main operation
    logger.warn('Failed to record activity', { type, message: err.message });
  }
}

/**
 * Retrieves paginated activity for a user.
 *
 * @param {string} userId
 * @param {number} page  - 1-indexed
 * @param {number} limit - Default 20, max 50
 * @returns {Promise<{ items, total, page, totalPages }>}
 */
async function getUserActivity(userId, page = 1, limit = 20) {
  const safePage  = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    EmailActivity.find({ owner: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    EmailActivity.countDocuments({ owner: userId }),
  ]);

  return {
    items,
    total,
    page: safePage,
    totalPages: Math.ceil(total / safeLimit),
  };
}

module.exports = { recordActivity, getUserActivity };
