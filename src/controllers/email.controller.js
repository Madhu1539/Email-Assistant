'use strict';

const emailService = require('../services/emailService');

/**
 * Email Controller
 * Thin layer: parse request → call service → format response.
 * No business logic here.
 */

// GET /api/emails
async function listInbox(req, res, next) {
  try {
    const { pageToken, maxResults } = req.query;
    const result = await emailService.listInbox(req.user._id.toString(), { pageToken, maxResults });
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

// GET /api/emails/search
async function searchEmails(req, res, next) {
  try {
    const { q, pageToken, maxResults } = req.query;
    const result = await emailService.searchEmails(req.user._id.toString(), { q, pageToken, maxResults });
    return res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
}

// GET /api/emails/:id
async function getEmail(req, res, next) {
  try {
    const email = await emailService.getEmail(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, data: email });
  } catch (err) { next(err); }
}

// GET /api/emails/:id/thread
async function getThread(req, res, next) {
  try {
    const thread = await emailService.getThread(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, data: thread });
  } catch (err) { next(err); }
}

// POST /api/emails/:id/read
async function markRead(req, res, next) {
  try {
    await emailService.markRead(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (err) { next(err); }
}

// POST /api/emails/:id/unread
async function markUnread(req, res, next) {
  try {
    await emailService.markUnread(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Marked as unread.' });
  } catch (err) { next(err); }
}

// POST /api/emails/:id/star
async function starEmail(req, res, next) {
  try {
    await emailService.starEmail(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Starred.' });
  } catch (err) { next(err); }
}

// POST /api/emails/:id/unstar
async function unstarEmail(req, res, next) {
  try {
    await emailService.unstarEmail(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Unstarred.' });
  } catch (err) { next(err); }
}

// POST /api/emails/:id/archive
async function archiveEmail(req, res, next) {
  try {
    await emailService.archiveEmail(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Archived.' });
  } catch (err) { next(err); }
}

// DELETE /api/emails/:id
async function deleteEmail(req, res, next) {
  try {
    await emailService.deleteEmail(req.user._id.toString(), req.params.id);
    return res.status(200).json({ success: true, message: 'Moved to Trash.' });
  } catch (err) { next(err); }
}

module.exports = {
  listInbox, searchEmails, getEmail, getThread,
  markRead, markUnread, starEmail, unstarEmail, archiveEmail, deleteEmail,
};
