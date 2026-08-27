import { RefreshCw, ChevronDown } from 'lucide-react';
import EmailListItem from './EmailListItem';
import Button from '@/components/ui/Button';

// Loading skeleton for email list
export function EmailListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading emails">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-[#2a2a38]">
          <div className="w-3 shrink-0" />
          <div className="skeleton w-8 h-8 rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between gap-4">
              <div className="skeleton h-3.5 w-28 rounded" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
            <div className="skeleton h-3.5 w-48 rounded" />
            <div className="skeleton h-3 w-full max-w-xs rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state for inbox
export function EmailListEmpty({ message = 'No emails to show.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-[#22222e] border border-[#2a2a38] flex items-center justify-center mb-5">
        <svg className="w-7 h-7 text-[#60607a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-[#f0f0f8] mb-1">{message}</p>
      <p className="text-xs text-[#60607a]">Check back later or refresh.</p>
    </div>
  );
}

export default function EmailList({
  emails = [],
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onEmailClick,
  onStarToggle,
  selectedMessageId = null,
  onRefresh,
  isRefreshing = false,
  headerTitle = 'Inbox',
  emptyMessage,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* List header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24] shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#f0f0f8]">{headerTitle}</h2>
          {emails.length > 0 && (
            <span className="text-xs text-[#60607a] bg-[#22222e] px-2 py-0.5 rounded-full">
              {emails.length}{hasMore ? '+' : ''}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh emails"
          className="p-1.5 rounded-lg text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Email list body */}
      <div className="flex-1 overflow-auto" role="table" aria-label="Email list">
        {isLoading ? (
          <EmailListSkeleton />
        ) : emails.length === 0 ? (
          <EmailListEmpty message={emptyMessage} />
        ) : (
          <>
            {emails.map((email) => (
              <EmailListItem
                key={email.messageId}
                email={email}
                isSelected={email.messageId === selectedMessageId}
                onClick={() => onEmailClick?.(email)}
                onStar={onStarToggle}
              />
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="p-4 text-center border-t border-[#2a2a38]">
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={isLoadingMore}
                  onClick={onLoadMore}
                >
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
