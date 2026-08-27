import { useState } from 'react';
import {
  ArrowLeft, Star, Trash2, Archive,
  MailOpen, Mail, ExternalLink, Paperclip,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import AIPanel from '@/components/email/AIPanel';
import { sanitizeEmailHtml, textToSafeHtml } from '@/utils/sanitize';
import { formatEmailDateFull, parseDisplayName, parseEmailAddress } from '@/utils/formatDate';

function Avatar({ from }) {
  const name = parseDisplayName(from);
  const initials = name ? name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase() : '?';
  return (
    <div
      className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function ActionBar({ email, onMarkRead, onMarkUnread, onStar, onUnstar, onArchive, onDelete, isLoading }) {
  return (
    <div className="flex items-center gap-1" role="toolbar" aria-label="Email actions">
      <button
        onClick={() => email.isRead ? onMarkUnread() : onMarkRead()}
        title={email.isRead ? 'Mark as unread' : 'Mark as read'}
        aria-label={email.isRead ? 'Mark as unread' : 'Mark as read'}
        disabled={isLoading}
        className="p-2 rounded-lg text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors disabled:opacity-50"
      >
        {email.isRead
          ? <Mail className="w-4 h-4" aria-hidden="true" />
          : <MailOpen className="w-4 h-4" aria-hidden="true" />}
      </button>

      <button
        onClick={() => email.isStarred ? onUnstar() : onStar()}
        title={email.isStarred ? 'Unstar' : 'Star'}
        aria-label={email.isStarred ? 'Unstar email' : 'Star email'}
        aria-pressed={email.isStarred}
        disabled={isLoading}
        className="p-2 rounded-lg text-[#60607a] hover:text-amber-400 hover:bg-[#22222e] transition-colors disabled:opacity-50"
      >
        <Star className={`w-4 h-4 ${email.isStarred ? 'text-amber-400 fill-amber-400' : ''}`} aria-hidden="true" />
      </button>

      <button
        onClick={onArchive}
        title="Archive"
        aria-label="Archive email"
        disabled={isLoading}
        className="p-2 rounded-lg text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors disabled:opacity-50"
      >
        <Archive className="w-4 h-4" aria-hidden="true" />
      </button>

      <button
        onClick={onDelete}
        title="Delete"
        aria-label="Move to Trash"
        disabled={isLoading}
        className="p-2 rounded-lg text-[#60607a] hover:text-red-400 hover:bg-[#22222e] transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>

      {isLoading && <Spinner size="sm" className="ml-1" />}
    </div>
  );
}

export default function EmailDetail({
  email,
  isLoading = false,
  onBack,
  onMarkRead,
  onMarkUnread,
  onStar,
  onUnstar,
  onArchive,
  onDelete,
  isActionLoading = false,
}) {
  const [showImages, setShowImages] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24]">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  if (!email) return null;

  const fromName    = parseDisplayName(email.from);
  const fromAddress = parseEmailAddress(email.from);

  // Prepare body: prefer HTML (sanitized), fall back to plain text
  let bodyContent = null;
  if (email.bodyHtml) {
    const clean = sanitizeEmailHtml(email.bodyHtml);
    bodyContent = (
      <div
        className="email-body prose-sm max-w-none text-[#d0d0e0]"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    );
  } else if (email.bodyText) {
    bodyContent = (
      <div
        className="email-body prose-sm max-w-none text-[#d0d0e0] whitespace-pre-wrap font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: textToSafeHtml(email.bodyText) }}
      />
    );
  } else {
    bodyContent = <p className="text-sm text-[#60607a] italic">No message body.</p>;
  }

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24] shrink-0">
        <button
          onClick={onBack}
          aria-label="Back to email list"
          className="p-2 rounded-lg text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        <ActionBar
          email={email}
          onMarkRead={onMarkRead}
          onMarkUnread={onMarkUnread}
          onStar={onStar}
          onUnstar={onUnstar}
          onArchive={onArchive}
          onDelete={onDelete}
          isLoading={isActionLoading}
        />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* Subject */}
        <h1 className="text-xl font-semibold text-[#f0f0f8] leading-tight">
          {email.subject}
        </h1>

        {/* Sender metadata */}
        <div className="flex items-start gap-3">
          <Avatar from={email.from} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="text-sm font-semibold text-[#f0f0f8]">{fromName}</span>
                <span className="text-xs text-[#60607a] ml-2">&lt;{fromAddress}&gt;</span>
              </div>
              <time
                dateTime={email.date}
                className="text-xs text-[#60607a]"
              >
                {formatEmailDateFull(email.date)}
              </time>
            </div>
            {email.to && (
              <p className="text-xs text-[#9898b0] mt-0.5 truncate">
                To: {email.to}
              </p>
            )}
            {email.cc && (
              <p className="text-xs text-[#60607a] mt-0.5 truncate">
                CC: {email.cc}
              </p>
            )}
          </div>
        </div>

        {/* Image load warning */}
        {email.bodyHtml && !showImages && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-[#22222e] border border-[#2a2a38] text-xs text-[#9898b0]">
            <span>Images are blocked to protect your privacy.</span>
            <button
              onClick={() => setShowImages(true)}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Show images
            </button>
          </div>
        )}

        {/* Attachments */}
        {email.attachments?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9898b0] uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
              {email.attachments.length} Attachment{email.attachments.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#22222e] border border-[#2a2a38] text-xs text-[#9898b0]"
                >
                  <Paperclip className="w-3.5 h-3.5 shrink-0 text-[#60607a]" aria-hidden="true" />
                  <span className="truncate max-w-[160px]">{att.filename}</span>
                  <span className="text-[#60607a] shrink-0">
                    {att.size ? `${Math.round(att.size / 1024)}KB` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email body */}
        <div className="email-body-container rounded-xl bg-[#1a1a24] border border-[#2a2a38] p-6 overflow-x-auto">
          {bodyContent}
        </div>

        {/* AI Panel */}
        <AIPanel messageId={email.messageId} emailSubject={email.subject} />
      </div>
    </div>
  );
}
