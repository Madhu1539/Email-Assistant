import Head from 'next/head';
import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import EmailList from '@/components/email/EmailList';
import EmailDetail from '@/components/email/EmailDetail';
import useEmailStore from '@/store/emailStore';
import useGmailStore from '@/store/gmailStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

export default function SearchPage() {
  const { isConnected } = useGmailStore();
  const { showError } = useUiStore();

  const {
    searchResults, searchNextPageToken, searchHasMore,
    setSearchResults, appendSearchResults, clearSearchResults,
    selectedEmail, setSelectedEmail, clearSelectedEmail,
    updateEmailInList,
  } = useEmailStore();

  const [query, setQuery]               = useState('');
  const [isSearching, setIsSearching]   = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [showDetailMobile, setShowDetailMobile] = useState(false);
  const inputRef = useRef(null);

  async function handleSearch(e) {
    e?.preventDefault();
    const q = query.trim();
    if (!q || q.length < 1) return;
    setIsSearching(true);
    setHasSearched(true);
    clearSearchResults();
    clearSelectedEmail();
    setShowDetailMobile(false);
    try {
      const res = await api.get(`/emails/search?q=${encodeURIComponent(q)}`);
      const { items, nextPageToken, hasMore } = res.data.data;
      setSearchResults(items, nextPageToken, hasMore);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  }

  async function loadMore() {
    if (!searchHasMore || !searchNextPageToken) return;
    setIsLoadingMore(true);
    try {
      const res = await api.get(
        `/emails/search?q=${encodeURIComponent(query.trim())}&pageToken=${encodeURIComponent(searchNextPageToken)}`
      );
      const { items, nextPageToken, hasMore } = res.data.data;
      appendSearchResults(items, nextPageToken, hasMore);
    } catch {
      showError('Failed to load more results.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleEmailClick(emailSummary) {
    setShowDetailMobile(true);
    setIsDetailLoading(true);
    try {
      const res = await api.get(`/emails/${emailSummary.messageId}`);
      setSelectedEmail(res.data.data);
    } catch {
      showError('Failed to load email.');
      setSelectedEmail(emailSummary);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function handleStar(messageId, isCurrentlyStarred) {
    const endpoint = isCurrentlyStarred ? 'unstar' : 'star';
    api.post(`/emails/${messageId}/${endpoint}`).catch(() => {});
    // Update in search results list
    const updated = searchResults.map((e) =>
      e.messageId === messageId ? { ...e, isStarred: !isCurrentlyStarred } : e
    );
    setSearchResults(updated, searchNextPageToken, searchHasMore);
    if (selectedEmail?.messageId === messageId) {
      setSelectedEmail({ ...selectedEmail, isStarred: !isCurrentlyStarred });
    }
  }

  function handleClearSearch() {
    setQuery('');
    clearSearchResults();
    clearSelectedEmail();
    setHasSearched(false);
    setShowDetailMobile(false);
    inputRef.current?.focus();
  }

  async function doAction(fn) {
    setIsActionLoading(true);
    try { await fn(); }
    catch { showError('Action failed.'); }
    finally { setIsActionLoading(false); }
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Search — Intelligent Email Assistant</title>
        <meta name="description" content="Search your Gmail emails." />
      </Head>

      <AppShell>
        <div className="flex flex-col h-full">
          {/* Search bar */}
          <div className="px-4 py-3 border-b border-[#2a2a38] bg-[#1a1a24] shrink-0">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#60607a] pointer-events-none" aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="email-search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search emails…"
                  autoComplete="off"
                  aria-label="Search emails"
                  disabled={!isConnected}
                  className="w-full pl-9 pr-9 py-2 text-sm bg-[#22222e] border border-[#2a2a38] rounded-lg text-[#f0f0f8] placeholder-[#60607a] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#60607a] hover:text-[#f0f0f8] transition-colors"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={!isConnected || !query.trim() || isSearching}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching…' : 'Search'}
              </button>
            </form>
          </div>

          {!isConnected ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-[#60607a]">Connect Gmail to search emails.</p>
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Results pane */}
              <div className={`
                flex-shrink-0 w-full lg:w-[360px] xl:w-[400px] border-r border-[#2a2a38]
                ${showDetailMobile ? 'hidden lg:flex' : 'flex'} flex-col
              `}>
                {!hasSearched ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
                    <Search className="w-10 h-10 text-[#2a2a38] mb-4" aria-hidden="true" />
                    <p className="text-sm text-[#60607a]">Enter a search query to find emails.</p>
                  </div>
                ) : (
                  <EmailList
                    emails={searchResults}
                    isLoading={isSearching}
                    hasMore={searchHasMore}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={loadMore}
                    onEmailClick={handleEmailClick}
                    onStarToggle={handleStar}
                    selectedMessageId={selectedEmail?.messageId}
                    onRefresh={() => handleSearch()}
                    isRefreshing={isSearching}
                    headerTitle={`Results for "${query}"`}
                    emptyMessage="No emails found."
                  />
                )}
              </div>

              {/* Detail pane */}
              <div className={`
                flex-1 min-w-0 overflow-hidden
                ${showDetailMobile ? 'flex' : 'hidden lg:flex'} flex-col
              `}>
                {selectedEmail || isDetailLoading ? (
                  <EmailDetail
                    email={selectedEmail}
                    isLoading={isDetailLoading}
                    onBack={() => { setShowDetailMobile(false); clearSelectedEmail(); }}
                    onMarkRead={() => doAction(() => api.post(`/emails/${selectedEmail.messageId}/read`))}
                    onMarkUnread={() => doAction(() => api.post(`/emails/${selectedEmail.messageId}/unread`))}
                    onStar={() => handleStar(selectedEmail.messageId, false)}
                    onUnstar={() => handleStar(selectedEmail.messageId, true)}
                    onArchive={() => doAction(() => api.post(`/emails/${selectedEmail.messageId}/archive`))}
                    onDelete={() => doAction(() => api.delete(`/emails/${selectedEmail.messageId}`))}
                    isActionLoading={isActionLoading}
                  />
                ) : (
                  <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-6">
                    <p className="text-sm text-[#60607a]">Select a result to read it</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
