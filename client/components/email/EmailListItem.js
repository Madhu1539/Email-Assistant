import { Star } from 'lucide-react';
import { formatEmailDate, parseDisplayName, getInitials } from '@/utils/formatDate';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-violet-600', 'bg-pink-600',
  'bg-blue-600',   'bg-teal-600',   'bg-emerald-600',
];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EmailListItem({ email, isSelected = false, onClick, onStar }) {
  const displayName = parseDisplayName(email.from);
  const initials    = getInitials(displayName);
  const avatarColor = getAvatarColor(email.from);
  const isUnread    = !email.isRead;

  function handleStar(e) {
    e.stopPropagation(); // Don't open email when starring
    onStar?.(email.messageId, email.isStarred);
  }

  return (
    <div
      role="row"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      aria-selected={isSelected}
      aria-label={`Email from ${displayName}: ${email.subject}`}
      className={`
        flex items-start gap-3 px-4 py-3.5 cursor-pointer
        border-b transition-colors duration-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500
        ${isSelected
          ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
          : 'hover:bg-[var(--color-surface-hover)] border-l-2 border-l-transparent'}
      `}
      style={{
        borderColor: 'var(--color-surface-border)',
      }}
    >
      {/* Unread dot */}
      <div className="flex flex-col items-center gap-1 pt-1 shrink-0 w-3">
        {isUnread && (
          <span
            className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"
            aria-label="Unread"
          />
        )}
      </div>

      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5`}
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span
            className="text-sm truncate"
            style={{
              fontWeight: isUnread ? 600 : 500,
              color: isUnread ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {displayName || email.from}
          </span>
          <time
            dateTime={email.date}
            className="text-xs shrink-0"
            style={{
              color: isUnread ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: isUnread ? 600 : 400,
            }}
          >
            {formatEmailDate(email.date)}
          </time>
        </div>
        <p
          className="text-sm truncate mb-0.5"
          style={{
            fontWeight: isUnread ? 600 : 400,
            color: isUnread ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
          }}
        >
          {email.subject}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {email.snippet}
        </p>
      </div>

      {/* Star */}
      <button
        onClick={handleStar}
        aria-label={email.isStarred ? 'Unstar email' : 'Star email'}
        aria-pressed={email.isStarred}
        className="p-1 rounded shrink-0 mt-0.5 transition-colors hover:bg-[var(--color-surface-hover)]"
      >
        <Star
          className={`w-4 h-4 transition-colors ${email.isStarred ? 'text-amber-400 fill-amber-400' : 'text-[var(--color-text-muted)] hover:text-amber-400'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
