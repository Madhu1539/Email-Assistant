/**
 * Date formatting utilities for email display.
 */

/**
 * Formats an email date string for the email list.
 * - Today: shows time only (e.g., "3:45 PM")
 * - This year: shows month + day (e.g., "Aug 12")
 * - Older: shows month + day + year (e.g., "Aug 12, 2023")
 */
export function formatEmailDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
    if (isThisYear) {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Formats an email date for the detail view (full absolute date + time).
 */
export function formatEmailDateFull(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Extracts just the display name from a From header like "John Doe <john@example.com>".
 */
export function parseDisplayName(fromHeader) {
  if (!fromHeader) return '';
  const match = fromHeader.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return fromHeader;
}

/**
 * Extracts just the email address from a From header.
 */
export function parseEmailAddress(fromHeader) {
  if (!fromHeader) return '';
  const match = fromHeader.match(/<([^>]+)>/);
  if (match) return match[1];
  return fromHeader;
}

/**
 * Returns the sender initials for avatar display (1–2 chars).
 */
export function getInitials(displayName) {
  if (!displayName) return '?';
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (displayName[0] || '?').toUpperCase();
}
