'use strict';

const axios  = require('axios');
const { AI_CONFIG, PROMPTS } = require('../config/ai');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Max characters of email content sent to AI — prevents token overflow
const MAX_EMAIL_CHARS = 6000;

// Max tokens per task — raised from 500 to prevent cut-off summaries/drafts
const MAX_TOKENS_SUMMARY = 1024;
const MAX_TOKENS_REPLY   = 1500;

/**
 * Truncates email content for AI input, appending a note if truncated.
 */
function truncateForAI(text, max = MAX_EMAIL_CHARS) {
  if (!text || text.length <= max) return text || '';
  return text.slice(0, max) + '\n\n[Content truncated for brevity]';
}

/**
 * Calls OpenRouter API.
 * @param {{ system, user }} prompt
 * @param {string} model
 * @returns {Promise<string>} AI response text
 */
async function callOpenRouter(prompt, model, maxTokens = MAX_TOKENS_SUMMARY) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.startsWith('REPLACE_WITH')) {
    throw new Error('OPENROUTER_API_KEY not configured.');
  }

  const response = await axios.post(
    `${AI_CONFIG.openrouter.baseUrl}/chat/completions`,
    {
      model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user',   content: prompt.user },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'Intelligent Email Assistant',
      },
      timeout: AI_CONFIG.openrouter.timeout,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter.');
  return text.trim();
}

/**
 * Calls Google Gemini API as fallback.
 * @param {{ system, user }} prompt
 * @returns {Promise<string>} AI response text
 */
async function callGemini(prompt, maxTokens = MAX_TOKENS_SUMMARY) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('REPLACE_WITH')) {
    throw new Error('GEMINI_API_KEY not configured.');
  }

  const { model, baseUrl, timeout } = AI_CONFIG.gemini;
  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(
    url,
    {
      contents: [
        { role: 'user', parts: [{ text: `${prompt.system}\n\n${prompt.user}` }] },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: maxTokens,
      },
    },
    { timeout }
  );

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini.');
  return text.trim();
}

/**
 * Calls the AI with automatic fallback.
 * Tries OpenRouter first; if it fails, tries Gemini.
 *
 * @param {{ system, user }} prompt
 * @param {string} model - OpenRouter model name
 * @returns {Promise<{ text: string, provider: string }>}
 */
async function callAI(prompt, model, maxTokens = MAX_TOKENS_SUMMARY) {
  // Try primary: Gemini (reliable free tier, updated to gemini-2.5-flash)
  try {
    const text = await callGemini(prompt, maxTokens);
    return { text, provider: 'gemini' };
  } catch (primaryErr) {
    logger.warn('Gemini failed, trying OpenRouter fallback', {
      message: primaryErr.message,
      code: primaryErr.response?.status,
    });
  }

  // Try fallback: OpenRouter
  try {
    const text = await callOpenRouter(prompt, model, maxTokens);
    return { text, provider: 'openrouter' };
  } catch (fallbackErr) {
    logger.error('Both AI providers failed', { message: fallbackErr.message });
    throw createError(
      'AI_UNAVAILABLE',
      'AI service is currently unavailable. Please try again later.'
    );
  }
}

/**
 * Generates an email summary.
 * @param {string} emailText - Plain text content of the email
 * @returns {Promise<{ summary: string, provider: string }>}
 */
async function summarizeEmail(emailText) {
  const truncated = truncateForAI(emailText);
  const prompt = PROMPTS.summarize(truncated);
  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.summarizeModel, MAX_TOKENS_SUMMARY);
  return { summary: text, provider };
}

/**
 * Generates a reply draft.
 * @param {string} emailText       - Original email content
 * @param {string} [instructions]  - Optional user instructions for reply tone
 * @returns {Promise<{ draft: string, provider: string }>}
 */
async function generateReplyDraft(emailText, instructions = '') {
  const truncated = truncateForAI(emailText);
  const prompt = PROMPTS.reply(truncated, instructions);
  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.replyModel, MAX_TOKENS_REPLY);
  return { draft: text, provider };
}

/**
 * Generates a complete email from a user description.
 * Used by the compose page to draft a new email from scratch.
 * @param {string} description - User's description of what the email should say
 * @returns {Promise<{ email: { subject: string, body: string }, provider: string }>}
 */
async function generateEmail(description) {
  const prompt = {
    system: [
      'You are a professional email writing assistant. Your task is to write a complete email based on the user description below.',
      '',
      'Rules:',
      '- Write a complete, professional, ready-to-send email.',
      '- Choose an appropriate tone based on the context (formal/informal).',
      '- Keep it clear and concise unless detail is required.',
      '- Do not invent facts, names, or commitments not mentioned in the description.',
      '- Respond ONLY with a JSON object in this exact format, no extra text:',
      '  {"subject": "...", "body": "..."}',
      '- The body must be plain text only, no markdown.',
    ].join('\n'),
    user: `Write an email based on this description:\n\n${description}`,
  };

  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.replyModel, MAX_TOKENS_REPLY);

  // Parse JSON from AI response
  let parsed;
  try {
    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // If AI didn't return valid JSON, treat entire text as body
    parsed = { subject: '', body: text.trim() };
  }

  return {
    email: {
      subject: (parsed.subject || '').trim(),
      body: (parsed.body || '').trim(),
    },
    provider,
  };
}

/**
 * Parses a JSON response from AI, stripping markdown code fences if present.
 * Returns the parsed object, or null on failure.
 */
function parseJsonResponse(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Classifies an email into a category.
 * @param {string} emailText
 * @returns {Promise<{ category: string, reason: string, provider: string }>}
 */
async function classifyEmail(emailText) {
  const truncated = truncateForAI(emailText);
  const prompt = PROMPTS.classify(truncated);
  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.summarizeModel, MAX_TOKENS_SUMMARY);

  const parsed = parseJsonResponse(text);
  const VALID_CATEGORIES = ['Work', 'Finance', 'Travel', 'Promotions', 'Social', 'Updates', 'Personal', 'Other'];
  const category = VALID_CATEGORIES.includes(parsed?.category) ? parsed.category : 'Other';
  const reason = (parsed?.reason || '').trim();

  return { category, reason, provider };
}

/**
 * Assigns a priority level to an email.
 * @param {string} emailText
 * @returns {Promise<{ priority: string, reason: string, provider: string }>}
 */
async function prioritizeEmail(emailText) {
  const truncated = truncateForAI(emailText);
  const prompt = PROMPTS.prioritize(truncated);
  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.summarizeModel, MAX_TOKENS_SUMMARY);

  const parsed = parseJsonResponse(text);
  const VALID_PRIORITIES = ['High', 'Normal', 'Low'];
  const priority = VALID_PRIORITIES.includes(parsed?.priority) ? parsed.priority : 'Normal';
  const reason = (parsed?.reason || '').trim();

  return { priority, reason, provider };
}

/**
 * Extracts action items and deadlines from an email.
 * @param {string} emailText
 * @returns {Promise<{ actions: Array<{task, deadline, urgency}>, provider: string }>}
 */
async function extractActionItems(emailText) {
  const truncated = truncateForAI(emailText);
  const prompt = PROMPTS.extractActions(truncated);
  const { text, provider } = await callAI(prompt, AI_CONFIG.openrouter.replyModel, MAX_TOKENS_REPLY);

  const parsed = parseJsonResponse(text);
  const VALID_URGENCIES = ['high', 'normal', 'low'];

  const actions = Array.isArray(parsed?.actions)
    ? parsed.actions
        .filter((a) => a && typeof a.task === 'string' && a.task.trim())
        .map((a) => ({
          task: a.task.trim(),
          deadline: a.deadline || null,
          urgency: VALID_URGENCIES.includes(a.urgency) ? a.urgency : 'normal',
        }))
    : [];

  return { actions, provider };
}

module.exports = { summarizeEmail, generateReplyDraft, generateEmail, classifyEmail, prioritizeEmail, extractActionItems };

