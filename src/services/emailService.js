'use strict';

const gmailService   = require('./gmailService');
const gmailIntegration = require('../integrations/gmailIntegration');
const activityService  = require('./activityService');
const { createError }  = require('../middleware/errorHandler');

/**
 * Email Service
 *
 * Orchestrates email operations.
 * All Gmail API calls go through gmailIntegration.
 * Never called directly from controllers without passing through here.
 */

/**
 * Returns authenticated Gmail client for a user.
 * Throws if Gmail not connected or auth expired.
 */
async function getClient(userId) {
  return gmailService.getAuthenticatedClient(userId);
}

async function listInbox(userId, { pageToken, maxResults } = {}) {
  const auth = await getClient(userId);
  return gmailIntegration.listInboxMessages(auth, { pageToken, maxResults });
}

async function getEmail(userId, messageId) {
  const auth = await getClient(userId);
  return gmailIntegration.getMessage(auth, messageId);
}

async function getThread(userId, messageId) {
  const auth = await getClient(userId);
  // First get the message to find its threadId
  const msg = await gmailIntegration.getMessage(auth, messageId);
  return gmailIntegration.getThread(auth, msg.threadId);
}

async function searchEmails(userId, { q, pageToken, maxResults } = {}) {
  if (!q || !q.trim()) {
    throw createError('VALIDATION_ERROR', 'Search query is required.');
  }
  const trimmed = q.trim();
  if (trimmed.length > 500) {
    throw createError('VALIDATION_ERROR', 'Search query must not exceed 500 characters.');
  }
  const auth = await getClient(userId);
  return gmailIntegration.searchMessages(auth, { q: trimmed, pageToken, maxResults });
}

async function markRead(userId, messageId) {
  const auth = await getClient(userId);
  await gmailIntegration.modifyLabels(auth, messageId, [], ['UNREAD']);
  await activityService.recordActivity({ userId, type: 'email_read', emailId: messageId });
}

async function markUnread(userId, messageId) {
  const auth = await getClient(userId);
  await gmailIntegration.modifyLabels(auth, messageId, ['UNREAD'], []);
  await activityService.recordActivity({ userId, type: 'email_unread', emailId: messageId });
}

async function starEmail(userId, messageId) {
  const auth = await getClient(userId);
  await gmailIntegration.modifyLabels(auth, messageId, ['STARRED'], []);
  await activityService.recordActivity({ userId, type: 'email_starred', emailId: messageId });
}

async function unstarEmail(userId, messageId) {
  const auth = await getClient(userId);
  await gmailIntegration.modifyLabels(auth, messageId, [], ['STARRED']);
  await activityService.recordActivity({ userId, type: 'email_unstarred', emailId: messageId });
}

async function archiveEmail(userId, messageId) {
  const auth = await getClient(userId);
  // Archive = remove INBOX label (BR-008: email remains in All Mail)
  await gmailIntegration.modifyLabels(auth, messageId, [], ['INBOX']);
  await activityService.recordActivity({ userId, type: 'email_archived', emailId: messageId, message: 'Email archived.' });
}

async function deleteEmail(userId, messageId) {
  const auth = await getClient(userId);
  // Delete = move to Trash (BR-021: not permanent deletion)
  await gmailIntegration.trashMessage(auth, messageId);
  await activityService.recordActivity({ userId, type: 'email_deleted', emailId: messageId, message: 'Email moved to Trash.' });
}

module.exports = {
  listInbox,
  getEmail,
  getThread,
  searchEmails,
  markRead,
  markUnread,
  starEmail,
  unstarEmail,
  archiveEmail,
  deleteEmail,
};
