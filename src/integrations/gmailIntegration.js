'use strict';

const { google } = require('googleapis');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Gmail Integration Module
 *
 * All direct Gmail API calls live here.
 * Services call into this module; nothing above this layer touches the Gmail API directly.
 *
 * RULE: Never call this from controllers or React components.
 */

// Maximum number of results allowed from backend (BR-016)
const MAX_RESULTS = 50;
const DEFAULT_RESULTS = 20;

/**
 * Returns a Gmail API client using the provided authenticated OAuth2 client.
 */
function getGmailClient(auth) {
  return google.gmail({ version: 'v1', auth });
}

/**
 * Extracts header value from Gmail message headers array.
 */
function getHeader(headers = [], name) {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

/**
 * Decodes base64url-encoded Gmail message part body.
 */
function decodeBase64(data) {
  if (!data) return '';
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

/**
 * Recursively extracts text/html and text/plain parts from a MIME message.
 */
function extractParts(payload) {
  let html = '';
  let text = '';
  const attachments = [];

  function walk(part) {
    if (!part) return;

    if (part.parts && part.parts.length > 0) {
      part.parts.forEach(walk);
      return;
    }

    const mime = part.mimeType || '';
    const body = part.body || {};

    if (mime === 'text/html' && body.data) {
      html = decodeBase64(body.data);
    } else if (mime === 'text/plain' && body.data) {
      text = decodeBase64(body.data);
    } else if (body.attachmentId) {
      attachments.push({
        filename: part.filename || 'attachment',
        mimeType: mime,
        size: body.size || 0,
        attachmentId: body.attachmentId,
      });
    }
  }

  walk(payload);
  return { html, text, attachments };
}

/**
 * Formats a raw Gmail message object into our API shape.
 */
function formatMessage(msg) {
  const headers = msg.payload?.headers || [];
  const { html, text, attachments } = extractParts(msg.payload || {});

  return {
    messageId: msg.id,
    threadId: msg.threadId,
    from: getHeader(headers, 'From'),
    to: getHeader(headers, 'To'),
    cc: getHeader(headers, 'Cc'),
    bcc: getHeader(headers, 'Bcc'),
    subject: getHeader(headers, 'Subject') || '(no subject)',
    date: getHeader(headers, 'Date'),
    snippet: msg.snippet || '',
    bodyHtml: html,
    bodyText: text,
    attachments: attachments.map(({ filename, mimeType, size }) => ({ filename, mimeType, size })),
    isRead: !(msg.labelIds || []).includes('UNREAD'),
    isStarred: (msg.labelIds || []).includes('STARRED'),
    labelIds: msg.labelIds || [],
    inReplyTo: getHeader(headers, 'In-Reply-To'),
    references: getHeader(headers, 'References'),
    messageIdHeader: getHeader(headers, 'Message-ID'),
  };
}

/**
 * Formats a message for the email list (summary only, no body).
 */
function formatMessageSummary(msg, fullMsg) {
  const headers = (fullMsg || msg).payload?.headers || [];
  return {
    messageId: msg.id,
    threadId: msg.threadId,
    from: getHeader(headers, 'From'),
    subject: getHeader(headers, 'Subject') || '(no subject)',
    snippet: msg.snippet || (fullMsg ? fullMsg.snippet : ''),
    date: getHeader(headers, 'Date'),
    isRead: !(msg.labelIds || []).includes('UNREAD'),
    isStarred: (msg.labelIds || []).includes('STARRED'),
  };
}

// ── API Methods ───────────────────────────────────────────────────────────────

/**
 * Fetches paginated inbox messages.
 */
async function listInboxMessages(auth, { pageToken, maxResults } = {}) {
  const gmail = getGmailClient(auth);
  const safeMax = Math.min(MAX_RESULTS, Math.max(1, parseInt(maxResults, 10) || DEFAULT_RESULTS));

  try {
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: safeMax,
      ...(pageToken && { pageToken }),
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return { items: [], nextPageToken: null, hasMore: false };
    }

    // Fetch each message's metadata in parallel (format=metadata is lighter)
    const fullMessages = await Promise.all(
      messages.map((m) =>
        gmail.users.messages.get({
          userId: 'me',
          id: m.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        }).then((r) => r.data)
      )
    );

    const items = fullMessages.map((msg) => formatMessageSummary(msg, msg));
    const nextPageToken = listRes.data.nextPageToken || null;

    return { items, nextPageToken, hasMore: !!nextPageToken };
  } catch (err) {
    logger.error('Gmail listInboxMessages error', { message: err.message, code: err.code });
    if (err.code === 429) throw createError('GMAIL_RATE_LIMIT', 'Gmail rate limit reached. Please try again shortly.');
    throw createError('GMAIL_API_ERROR', 'Failed to fetch emails from Gmail.');
  }
}

/**
 * Fetches a single Gmail message by messageId.
 */
async function getMessage(auth, messageId) {
  const gmail = getGmailClient(auth);
  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    return formatMessage(res.data);
  } catch (err) {
    if (err.code === 404) throw createError('RESOURCE_NOT_FOUND', 'Email not found.');
    if (err.code === 429) throw createError('GMAIL_RATE_LIMIT', 'Gmail rate limit reached.');
    logger.error('Gmail getMessage error', { messageId, message: err.message });
    throw createError('GMAIL_API_ERROR', 'Failed to fetch email.');
  }
}

/**
 * Fetches an entire Gmail thread by threadId.
 */
async function getThread(auth, threadId) {
  const gmail = getGmailClient(auth);
  try {
    const res = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full',
    });
    const messages = (res.data.messages || []).map(formatMessage);
    // Sort chronologically (oldest first)
    messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    return { threadId, messages };
  } catch (err) {
    if (err.code === 404) throw createError('RESOURCE_NOT_FOUND', 'Thread not found.');
    if (err.code === 429) throw createError('GMAIL_RATE_LIMIT', 'Gmail rate limit reached.');
    logger.error('Gmail getThread error', { threadId, message: err.message });
    throw createError('GMAIL_API_ERROR', 'Failed to fetch thread.');
  }
}

/**
 * Searches Gmail messages.
 */
async function searchMessages(auth, { q, pageToken, maxResults } = {}) {
  const gmail = getGmailClient(auth);
  const safeMax = Math.min(MAX_RESULTS, Math.max(1, parseInt(maxResults, 10) || DEFAULT_RESULTS));

  try {
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      q,
      maxResults: safeMax,
      ...(pageToken && { pageToken }),
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return { items: [], nextPageToken: null, hasMore: false };
    }

    const fullMessages = await Promise.all(
      messages.map((m) =>
        gmail.users.messages.get({
          userId: 'me',
          id: m.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        }).then((r) => r.data)
      )
    );

    const items = fullMessages.map((msg) => formatMessageSummary(msg, msg));
    const nextPageToken = listRes.data.nextPageToken || null;

    return { items, nextPageToken, hasMore: !!nextPageToken };
  } catch (err) {
    if (err.code === 429) throw createError('GMAIL_RATE_LIMIT', 'Gmail rate limit reached.');
    logger.error('Gmail searchMessages error', { message: err.message });
    throw createError('GMAIL_API_ERROR', 'Search failed. Please try again.');
  }
}

/**
 * Modifies Gmail labels on a message.
 * @param {object} auth
 * @param {string} messageId
 * @param {string[]} addLabels
 * @param {string[]} removeLabels
 */
async function modifyLabels(auth, messageId, addLabels = [], removeLabels = []) {
  const gmail = getGmailClient(auth);
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: addLabels,
        removeLabelIds: removeLabels,
      },
    });
  } catch (err) {
    if (err.code === 404) throw createError('RESOURCE_NOT_FOUND', 'Email not found.');
    if (err.code === 429) throw createError('GMAIL_RATE_LIMIT', 'Gmail rate limit reached.');
    logger.error('Gmail modifyLabels error', { messageId, message: err.message });
    throw createError('GMAIL_API_ERROR', 'Failed to update email.');
  }
}

/**
 * Moves a Gmail message to Trash (DELETE action per SSOT).
 */
async function trashMessage(auth, messageId) {
  const gmail = getGmailClient(auth);
  try {
    await gmail.users.messages.trash({ userId: 'me', id: messageId });
  } catch (err) {
    if (err.code === 404) throw createError('RESOURCE_NOT_FOUND', 'Email not found.');
    logger.error('Gmail trashMessage error', { messageId, message: err.message });
    throw createError('GMAIL_API_ERROR', 'Failed to delete email.');
  }
}

/**
 * Sends a Gmail message.
 * @param {object} auth
 * @param {string} rawMessage - Base64url-encoded MIME message
 * @param {string} [threadId] - Optional threadId for replies
 * @returns {Promise<{ messageId: string }>}
 */
async function sendMessage(auth, rawMessage, threadId) {
  const gmail = getGmailClient(auth);
  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
        ...(threadId && { threadId }),
      },
    });
    return { messageId: res.data.id };
  } catch (err) {
    logger.error('Gmail sendMessage error', { message: err.message });
    throw createError('EMAIL_SEND_FAILED', 'Failed to send email. Please try again.');
  }
}

module.exports = {
  listInboxMessages,
  getMessage,
  getThread,
  searchMessages,
  modifyLabels,
  trashMessage,
  sendMessage,
  formatMessage,
};
