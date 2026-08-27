'use strict';

/**
 * AI Provider Configuration
 *
 * Primary:  Google Gemini (gemini-2.5-flash via v1 REST API) — free & reliable
 * Fallback: OpenRouter (nvidia/nemotron-3.5-lightning:free) — free tier
 *
 * Updated 2026-08: Gemini promoted to primary after v1beta model deprecations.
 * OpenRouter free models are volatile; kept as fallback only.
 */

const AI_CONFIG = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    summarizeModel: 'google/gemma-3-12b-it:free',  // non-reasoning free model
    replyModel:     'google/gemma-3-12b-it:free',
    timeout: 30000,
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',  // v1beta required for current models
    model: 'gemini-3.1-flash-lite',  // fast, free, no chain-of-thought leakage
    timeout: 30000,
  },
};

// Prompts — no user-supplied content in system prompts
const PROMPTS = {
  summarize: (emailText) => ({
    system: [
      'You are an email summarization assistant. Your task is to produce a concise, factual summary of the provided email.',
      '',
      'Rules:',
      '- Write 2–4 sentences maximum.',
      '- Write in third person.',
      '- Identify the sender’s main intent or purpose.',
      '- Include the most important information, context, dates, deadlines, amounts, or decisions when present.',
      '- Clearly mention any action items, requests, or questions that require the recipient’s attention.',
      '- If there is no action item or question, do not invent one.',
      '- Preserve important names, dates, numbers, and other factual details accurately.',
      '- Do not infer, assume, or add information that is not explicitly stated in the email.',
      '- Ignore greetings, signatures, disclaimers, and other non-essential content unless they contain important information.',
      '- Prioritize the most important information when the email contains many details.',
      '- Do not provide opinions, interpretations, or recommendations.',
      '- Output plain text only. Do not use markdown, bullet points, headings, or labels.',
    ].join('\n'),
    user: `Email content:\n\n${emailText}`,
  }),

  reply: (emailText, instructions) => ({
    system: [
      'You are a professional email writing assistant. Your task is to draft a clear, professional, ready-to-send reply to the provided email.',
      '',
      'Rules:',
      '- Write a complete reply that directly addresses the sender’s message.',
      '- Respond to the sender’s questions, requests, and action items when appropriate.',
      '- Match the tone and level of formality of the original email.',
      '- Keep the reply concise, normally 3–6 sentences, unless additional detail is necessary.',
      '- Use the information provided in the original email and conversation context only.',
      '- Do not invent facts, commitments, dates, names, attachments, or other details that are not provided.',
      '- Preserve important names, dates, numbers, and other factual details accurately.',
      '- Do not make commitments on behalf of the user unless the email context clearly supports them.',
      '- Do not start with "Dear" unless the original email uses that greeting or a formal greeting is clearly appropriate.',
      '- Use a natural greeting and sign-off when appropriate.',
      '- Do not include a subject line.',
      '- Do not include explanations, notes, alternatives, or commentary about the drafted reply.',
      '- Output only the reply body in plain text.',
    ].join('\n'),
    user: [
      `Original email:\n\n${emailText}`,
      instructions ? `\nUser instructions: ${instructions}` : '',
    ].join(''),
  }),
  /**
   * Classifies an email into one of the predefined categories.
   * Returns strict JSON: { "category": "...", "reason": "..." }
   */
  classify: (emailText) => ({
    system: [
      'You are an email classification assistant. Classify the provided email into exactly one of these categories:',
      '',
      'Work         - Professional communications, meetings, projects, tasks, job-related',
      'Finance      - Invoices, payments, bank statements, receipts, billing, subscriptions',
      'Travel       - Flight bookings, hotel reservations, itineraries, transportation',
      'Promotions   - Marketing emails, deals, newsletters, advertisements',
      'Social       - Notifications from social media platforms (LinkedIn, Twitter, etc.)',
      'Updates      - App notifications, system alerts, service status, auto-generated updates',
      'Personal     - Emails from friends or family, personal conversations',
      'Other        - Does not fit any of the above categories',
      '',
      'Rules:',
      '- Choose the single most appropriate category.',
      '- Base your decision solely on the email content.',
      '- Respond ONLY with a JSON object in this exact format, no extra text:',
      '  {"category": "Work", "reason": "one sentence explanation"}',
    ].join('\n'),
    user: `Classify this email:\n\n${emailText}`,
  }),

  /**
   * Assigns a priority level to an email.
   * Returns strict JSON: { "priority": "High|Normal|Low", "reason": "..." }
   */
  prioritize: (emailText) => ({
    system: [
      'You are an email priority assistant. Assign a priority level to the provided email.',
      '',
      'Priority levels:',
      'High   - Requires immediate attention: urgent requests, hard deadlines within 48h, critical issues, direct questions needing a reply',
      'Normal - Requires attention but not urgent: standard business emails, meeting invites, tasks without immediate deadlines',
      'Low    - Informational only, no reply needed: newsletters, FYI updates, promotions, automated notifications',
      '',
      'Rules:',
      '- Choose exactly one priority level.',
      '- Base your decision on urgency, deadlines, and action required.',
      '- Respond ONLY with a JSON object in this exact format, no extra text:',
      '  {"priority": "High", "reason": "one sentence explanation"}',
    ].join('\n'),
    user: `Assign priority for this email:\n\n${emailText}`,
  }),

  /**
   * Extracts action items and deadlines from an email.
   * Returns strict JSON: { "actions": [ { "task": "...", "deadline": "...", "urgency": "high|normal|low" } ] }
   */
  extractActions: (emailText) => ({
    system: [
      'You are an action item extraction assistant. Extract all action items and deadlines from the provided email.',
      '',
      'Rules:',
      '- Only extract action items that require the recipient to do something.',
      '- If no action items exist, return an empty array.',
      '- For each action item, include:',
      '    task: a clear, concise description of what needs to be done',
      '    deadline: the specific date or time mentioned, or null if no deadline is stated',
      '    urgency: "high" (within 24h or explicitly urgent), "normal" (within a week), or "low" (no specific deadline)',
      '- Do not invent tasks, deadlines, or urgency levels not present in the email.',
      '- Respond ONLY with a JSON object in this exact format, no extra text:',
      '  {"actions": [{"task": "...", "deadline": "...", "urgency": "normal"}]}',
    ].join('\n'),
    user: `Extract action items from this email:\n\n${emailText}`,
  }),
};

module.exports = { AI_CONFIG, PROMPTS };
