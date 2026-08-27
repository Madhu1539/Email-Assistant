'use strict';

const emailService    = require('./emailService');
const activityService = require('./activityService');
const gmailIntegration = require('../integrations/gmailIntegration');
const gmailService    = require('./gmailService');

/**
 * Builds a RFC 5322 MIME message and base64url-encodes it.
 * Handles both new messages and replies (with proper In-Reply-To/References headers).
 *
 * @param {object} params
 * @param {string}   params.to           - Comma-separated recipients
 * @param {string}   [params.cc]         - CC recipients
 * @param {string}   [params.bcc]        - BCC recipients
 * @param {string}   params.subject      - Subject line
 * @param {string}   params.body         - Plain-text body
 * @param {string}   [params.inReplyTo]  - Message-ID header of original email
 * @param {string}   [params.references] - References header chain
 * @param {string}   [params.from]       - Sender address (e.g. "Jane <jane@gmail.com>")
 * @returns {string} Base64url-encoded raw MIME message
 */
function buildRawEmail({ to, cc, bcc, subject, body, inReplyTo, references, from }) {
  const headers = [
    `From: ${from || 'me'}`,
    `To: ${to}`,
    cc  ? `Cc: ${cc}`  : null,
    bcc ? `Bcc: ${bcc}` : null,
    `Subject: ${subject || '(no subject)'}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    inReplyTo  ? `In-Reply-To: ${inReplyTo}`  : null,
    references ? `References: ${references}`  : null,
  ].filter(Boolean);

  const message = headers.join('\r\n') + '\r\n\r\n' + body;

  // Base64url encode (Gmail API requires URL-safe base64)
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends a new email.
 * @param {string} userId
 * @param {{ to, cc, bcc, subject, body }} params
 */
async function sendNewEmail(userId, { to, cc, bcc, subject, body }) {
  const auth = await gmailService.getAuthenticatedClient(userId);

  // Get sender's Gmail address to set the From header
  const { google } = require('googleapis');
  const gmail = google.gmail({ version: 'v1', auth });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  const fromAddress = profile.data.emailAddress;

  const raw = buildRawEmail({
    to: Array.isArray(to) ? to.join(', ') : to,
    cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : null,
    bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : null,
    subject,
    body,
    from: fromAddress,
  });

  const result = await gmailIntegration.sendMessage(auth, raw);

  await activityService.recordActivity({
    userId,
    type: 'email_sent',
    emailId: result.messageId,
    message: `Email sent to: ${to}`,
  });

  return result;
}

/**
 * Replies to an existing email thread.
 * @param {string} userId
 * @param {string} messageId - The message being replied to
 * @param {{ to, body }} params
 */
async function replyToEmail(userId, messageId, { to, body }) {
  const auth  = await gmailService.getAuthenticatedClient(userId);
  const email = await emailService.getEmail(userId, messageId);

  // Build reply subject (prefix Re: if not already present)
  const replySubject = email.subject.startsWith('Re:')
    ? email.subject
    : `Re: ${email.subject}`;

  // Use sender's From header or their Gmail address
  const { google } = require('googleapis');
  const gmail = google.gmail({ version: 'v1', auth });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  const fromAddress = profile.data.emailAddress;

  const raw = buildRawEmail({
    to: to || email.from,
    subject: replySubject,
    body,
    from: fromAddress,
    inReplyTo: email.messageIdHeader,
    references: [email.references, email.messageIdHeader].filter(Boolean).join(' '),
  });

  const result = await gmailIntegration.sendMessage(auth, raw, email.threadId);

  await activityService.recordActivity({
    userId,
    type: 'email_replied',
    emailId: messageId,
    threadId: email.threadId,
    message: `Reply sent to: ${to || email.from}`,
  });

  return result;
}

module.exports = { sendNewEmail, replyToEmail };
