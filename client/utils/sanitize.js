/**
 * HTML Sanitization Utility
 *
 * Sanitizes untrusted email HTML before rendering.
 * Removes scripts, event handlers, dangerous URL schemes, and active embedded content.
 * SEC-036, SEC-037 compliance.
 */

// isomorphic-dompurify works in both Node.js (for SSR) and browser environments
import DOMPurify from 'isomorphic-dompurify';

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'br', 'caption', 'cite',
    'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'div', 'dl', 'dt',
    'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins',
    'kbd', 'li', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span',
    'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
    'time', 'tr', 'tt', 'u', 'ul', 'var',
  ],
  ALLOWED_ATTR: [
    'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'class',
    'color', 'colspan', 'dir', 'height', 'href', 'lang', 'rowspan',
    'src', 'style', 'title', 'valign', 'width',
  ],
  // Block dangerous URL schemes
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  // Remove all script content
  FORBID_TAGS: ['script', 'style', 'object', 'embed', 'applet', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'],
  // Don't allow data: URIs (can embed scripts)
  ALLOW_DATA_ATTR: false,
  // Force all links to open in new tab safely
  ADD_ATTR: ['target'],
};

/**
 * Sanitizes HTML email content for safe rendering.
 * @param {string} html - Raw HTML from Gmail API
 * @returns {string} Sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeEmailHtml(html) {
  if (!html || typeof html !== 'string') return '';

  const clean = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);

  // Force all links to open in a new tab with rel="noopener noreferrer"
  return clean.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');
}

/**
 * Converts plain text to safe HTML with line breaks preserved.
 * @param {string} text
 * @returns {string}
 */
export function textToSafeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  // Escape HTML entities, then restore newlines as <br>
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br />');
}
