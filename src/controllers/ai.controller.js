'use strict';

const aiService = require('../services/aiService');

/**
 * POST /api/ai/summarize/:messageId
 */
async function summarize(req, res, next) {
  try {
    const result = await aiService.summarizeEmail(
      req.user._id.toString(),
      req.params.messageId
    );
    return res.status(200).json({
      success: true,
      data: {
        summary: result.summary,
        provider: result.provider,
        messageId: req.params.messageId,
      },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/ai/reply/:messageId
 */
async function generateReply(req, res, next) {
  try {
    const { instructions } = req.body;
    const result = await aiService.generateReplyDraft(
      req.user._id.toString(),
      req.params.messageId,
      instructions || ''
    );
    return res.status(200).json({
      success: true,
      data: {
        draft: result.draft,
        provider: result.provider,
        messageId: req.params.messageId,
      },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/ai/generate
 * Generates a new email (subject + body) from a plain-language description.
 */
async function generateCompose(req, res, next) {
  try {
    const { description } = req.body;
    const result = await aiService.generateEmail(
      req.user._id.toString(),
      description || ''
    );
    return res.status(200).json({
      success: true,
      data: {
        email: result.email,
        provider: result.provider,
      },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/ai/classify/:messageId
 */
async function classify(req, res, next) {
  try {
    const result = await aiService.classifyEmail(req.user._id.toString(), req.params.messageId);
    return res.status(200).json({
      success: true,
      data: { category: result.category, reason: result.reason, provider: result.provider, messageId: req.params.messageId },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/ai/prioritize/:messageId
 */
async function prioritize(req, res, next) {
  try {
    const result = await aiService.prioritizeEmail(req.user._id.toString(), req.params.messageId);
    return res.status(200).json({
      success: true,
      data: { priority: result.priority, reason: result.reason, provider: result.provider, messageId: req.params.messageId },
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/ai/extract-actions/:messageId
 */
async function extractActions(req, res, next) {
  try {
    const result = await aiService.extractActionItems(req.user._id.toString(), req.params.messageId);
    return res.status(200).json({
      success: true,
      data: { actions: result.actions, provider: result.provider, messageId: req.params.messageId },
    });
  } catch (err) { next(err); }
}

module.exports = { summarize, generateReply, generateCompose, classify, prioritize, extractActions };

