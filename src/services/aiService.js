'use strict';

const aiIntegration   = require('../integrations/aiIntegration');
const emailService    = require('./emailService');
const activityService = require('./activityService');
const AISession       = require('../models/AISession');
const { createError } = require('../middleware/errorHandler');
const logger          = require('../utils/logger');

/**
 * Extracts the best text content from an email for AI processing.
 * Strips HTML tags from bodyHtml and prefers bodyText when available.
 */
function extractEmailText(email) {
  let text = '';

  if (email.bodyText) {
    text = email.bodyText;
  } else if (email.bodyHtml) {
    // Basic HTML → plain text stripping for AI input
    text = email.bodyHtml
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  if (!text) throw createError('AI_NO_CONTENT', 'Email has no readable content to process.');

  return `From: ${email.from}\nSubject: ${email.subject}\n\n${text}`;
}

/**
 * Records an AISession document (non-fatal).
 */
async function recordAISession(data) {
  try {
    await AISession.create(data);
  } catch (err) {
    logger.warn('Failed to record AI session', { message: err.message });
  }
}

/**
 * Summarizes an email using AI.
 * @param {string} userId
 * @param {string} messageId
 * @returns {Promise<{ summary: string, provider: string }>}
 */
async function summarizeEmail(userId, messageId) {
  const email = await emailService.getEmail(userId, messageId);
  const emailText = extractEmailText(email);

  let result;
  try {
    result = await aiIntegration.summarizeEmail(emailText);
  } catch (err) {
    await recordAISession({
      owner: userId, operation: 'summarize', emailId: messageId,
      threadId: email.threadId, provider: 'openrouter', status: 'failure', errorCode: err.code,
    });
    await activityService.recordActivity({
      userId, type: 'ai_summarize', status: 'failure', emailId: messageId,
    });
    throw err;
  }

  await recordAISession({
    owner: userId, operation: 'summarize', emailId: messageId,
    threadId: email.threadId, provider: result.provider, status: 'success',
  });
  await activityService.recordActivity({
    userId, type: 'ai_summarize', status: 'success', emailId: messageId,
  });

  return result;
}

/**
 * Generates a reply draft using AI.
 * @param {string} userId
 * @param {string} messageId
 * @param {string} [instructions] - Optional user guidance for reply tone/content
 * @returns {Promise<{ draft: string, provider: string }>}
 */
async function generateReplyDraft(userId, messageId, instructions = '') {
  // Validate instructions length
  if (instructions && instructions.length > 500) {
    throw createError('VALIDATION_ERROR', 'Instructions must not exceed 500 characters.');
  }

  const email = await emailService.getEmail(userId, messageId);
  const emailText = extractEmailText(email);

  let result;
  try {
    result = await aiIntegration.generateReplyDraft(emailText, instructions);
  } catch (err) {
    await recordAISession({
      owner: userId, operation: 'generate_reply', emailId: messageId,
      threadId: email.threadId, provider: 'openrouter', status: 'failure', errorCode: err.code,
    });
    await activityService.recordActivity({
      userId, type: 'ai_reply', status: 'failure', emailId: messageId,
    });
    throw err;
  }

  await recordAISession({
    owner: userId, operation: 'generate_reply', emailId: messageId,
    threadId: email.threadId, provider: result.provider, status: 'success',
  });
  await activityService.recordActivity({
    userId, type: 'ai_reply', status: 'success', emailId: messageId,
  });

  return result;
}

/**
 * Generates a complete email from a plain-language description.
 * Used by the compose page.
 * @param {string} userId
 * @param {string} description
 * @returns {Promise<{ email: { subject, body }, provider }>}
 */
async function generateEmail(userId, description) {
  if (!description || description.trim().length < 5) {
    throw createError('VALIDATION_ERROR', 'Please provide a description of what you want to write.');
  }
  if (description.length > 1000) {
    throw createError('VALIDATION_ERROR', 'Description must not exceed 1000 characters.');
  }

  let result;
  try {
    result = await aiIntegration.generateEmail(description.trim());
  } catch (err) {
    await activityService.recordActivity({
      userId, type: 'ai_compose', status: 'failure',
    });
    throw err;
  }

  await activityService.recordActivity({
    userId, type: 'ai_compose', status: 'success',
  });

  return result;
}

/**
 * Classifies an email into a category (Work, Finance, Travel, etc.).
 * @param {string} userId
 * @param {string} messageId
 * @returns {Promise<{ category, reason, provider }>}
 */
async function classifyEmail(userId, messageId) {
  const email = await emailService.getEmail(userId, messageId);
  const emailText = extractEmailText(email);

  let result;
  try {
    result = await aiIntegration.classifyEmail(emailText);
  } catch (err) {
    await activityService.recordActivity({ userId, type: 'ai_classify', status: 'failure', emailId: messageId });
    throw err;
  }

  await activityService.recordActivity({ userId, type: 'ai_classify', status: 'success', emailId: messageId });
  return result;
}

/**
 * Assigns a priority level (High / Normal / Low) to an email.
 * @param {string} userId
 * @param {string} messageId
 * @returns {Promise<{ priority, reason, provider }>}
 */
async function prioritizeEmail(userId, messageId) {
  const email = await emailService.getEmail(userId, messageId);
  const emailText = extractEmailText(email);

  let result;
  try {
    result = await aiIntegration.prioritizeEmail(emailText);
  } catch (err) {
    await activityService.recordActivity({ userId, type: 'ai_prioritize', status: 'failure', emailId: messageId });
    throw err;
  }

  await activityService.recordActivity({ userId, type: 'ai_prioritize', status: 'success', emailId: messageId });
  return result;
}

/**
 * Extracts action items and deadlines from an email.
 * @param {string} userId
 * @param {string} messageId
 * @returns {Promise<{ actions: Array<{task, deadline, urgency}>, provider }>}
 */
async function extractActionItems(userId, messageId) {
  const email = await emailService.getEmail(userId, messageId);
  const emailText = extractEmailText(email);

  let result;
  try {
    result = await aiIntegration.extractActionItems(emailText);
  } catch (err) {
    await activityService.recordActivity({ userId, type: 'ai_extract_actions', status: 'failure', emailId: messageId });
    throw err;
  }

  await activityService.recordActivity({ userId, type: 'ai_extract_actions', status: 'success', emailId: messageId });
  return result;
}

module.exports = { summarizeEmail, generateReplyDraft, generateEmail, classifyEmail, prioritizeEmail, extractActionItems };

