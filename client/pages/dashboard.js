import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Wifi, WifiOff } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import EmailList from '@/components/email/EmailList';
import EmailDetail from '@/components/email/EmailDetail';
import Button from '@/components/ui/Button';
import useEmailStore from '@/store/emailStore';
import useGmailStore from '@/store/gmailStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

function GmailNotConnectedPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
        <WifiOff className="w-8 h-8 text-amber-400" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-[#f0f0f8] mb-2">Gmail not connected</h2>
      <p className="text-sm text-[#9898b0] max-w-sm mb-6 leading-relaxed">
        Connect your Gmail account to start reading and managing your emails with AI assistance.
      </p>
      <Link href="/integrations">
        <Button variant="primary" size="lg" id="connect-gmail-dashboard-btn">
          <Wifi className="w-4 h-4" aria-hidden="true" />
          Connect Gmail
        </Button>
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected } = useGmailStore();
  const { showError, showSuccess } = useUiStore();

  const {
    emails, nextPageToken, hasMore,
    setEmails, appendEmails, updateEmailInList, removeEmailFromList,
    selectedEmail, setSelectedEmail, clearSelectedEmail,
  } = useEmailStore();

  const [isLoading, setIsLoading]       = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  // Mobile: show detail pane or list pane
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  // ── Load inbox ──────────────────────────────────────────────────────────────
  const loadInbox = useCallback(async (refresh = false) => {
    if (!isConnected) return;
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const res = await api.get('/emails');
      const { items, nextPageToken: npt, hasMore: hm } = res.data.data;
      setEmails(items, npt, hm);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to load emails.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isConnected, setEmails, showError]);

  useEffect(() => {
    if (isConnected) loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // ── Load more ───────────────────────────────────────────────────────────────
  async function loadMore() {
    if (!hasMore || !nextPageToken) return;
    setIsLoadingMore(true);
    try {
      const res = await api.get(`/emails?pageToken=${encodeURIComponent(nextPageToken)}`);
      const { items, nextPageToken: npt, hasMore: hm } = res.data.data;
      appendEmails(items, npt, hm);
    } catch {
      showError('Failed to load more emails.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  // ── Select email and fetch detail ────────────────────────────────────────────
  async function handleEmailClick(emailSummary) {
    setShowDetailMobile(true);
    setIsDetailLoading(true);
    // Optimistically mark as read in list
    if (!emailSummary.isRead) {
      updateEmailInList(emailSummary.messageId, { isRead: true });
      api.post(`/emails/${emailSummary.messageId}/read`).catch(() => {});
    }
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

  // ── Email actions ───────────────────────────────────────────────────────────
  async function action(fn, successMsg, mutate) {
    if (!selectedEmail) return;
    setIsActionLoading(true);
    try {
      await fn();
      mutate?.();
      if (successMsg) showSuccess(successMsg);
    } catch {
      showError('Action failed. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  }

  function handleMarkRead() {
    action(
      () => api.post(`/emails/${selectedEmail.messageId}/read`),
      null,
      () => {
        setSelectedEmail({ ...selectedEmail, isRead: true });
        updateEmailInList(selectedEmail.messageId, { isRead: true });
      }
    );
  }

  function handleMarkUnread() {
    action(
      () => api.post(`/emails/${selectedEmail.messageId}/unread`),
      null,
      () => {
        setSelectedEmail({ ...selectedEmail, isRead: false });
        updateEmailInList(selectedEmail.messageId, { isRead: false });
      }
    );
  }

  function handleStar(messageId, isCurrentlyStarred) {
    const endpoint = isCurrentlyStarred ? 'unstar' : 'star';
    api.post(`/emails/${messageId}/${endpoint}`).catch(() => {});
    updateEmailInList(messageId, { isStarred: !isCurrentlyStarred });
    if (selectedEmail?.messageId === messageId) {
      setSelectedEmail({ ...selectedEmail, isStarred: !isCurrentlyStarred });
    }
  }

  function handleArchive() {
    action(
      () => api.post(`/emails/${selectedEmail.messageId}/archive`),
      'Email archived.',
      () => {
        removeEmailFromList(selectedEmail.messageId);
        clearSelectedEmail();
        setShowDetailMobile(false);
      }
    );
  }

  function handleDelete() {
    action(
      () => api.delete(`/emails/${selectedEmail.messageId}`),
      'Moved to Trash.',
      () => {
        removeEmailFromList(selectedEmail.messageId);
        clearSelectedEmail();
        setShowDetailMobile(false);
      }
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Inbox — Intelligent Email Assistant</title>
        <meta name="description" content="Manage your Gmail inbox with AI assistance." />
      </Head>

      <AppShell>
        {!isConnected ? (
          <GmailNotConnectedPrompt />
        ) : (
          /* Split-pane layout */
          <div className="flex h-full overflow-hidden">
            {/* Email List pane */}
            <div className={`
              flex-shrink-0 w-full lg:w-[360px] xl:w-[400px] border-r border-[#2a2a38]
              ${showDetailMobile ? 'hidden lg:flex' : 'flex'} flex-col
            `}>
              <EmailList
                emails={emails}
                isLoading={isLoading}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
                onEmailClick={handleEmailClick}
                onStarToggle={handleStar}
                selectedMessageId={selectedEmail?.messageId}
                onRefresh={() => loadInbox(true)}
                isRefreshing={isRefreshing}
                headerTitle="Inbox"
                emptyMessage="Your inbox is empty."
              />
            </div>

            {/* Email Detail pane */}
            <div className={`
              flex-1 min-w-0 overflow-hidden
              ${showDetailMobile ? 'flex' : 'hidden lg:flex'} flex-col
            `}>
              {selectedEmail || isDetailLoading ? (
                <EmailDetail
                  email={selectedEmail}
                  isLoading={isDetailLoading}
                  onBack={() => { setShowDetailMobile(false); clearSelectedEmail(); }}
                  onMarkRead={handleMarkRead}
                  onMarkUnread={handleMarkUnread}
                  onStar={() => handleStar(selectedEmail.messageId, false)}
                  onUnstar={() => handleStar(selectedEmail.messageId, true)}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  isActionLoading={isActionLoading}
                />
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#22222e] border border-[#2a2a38] flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-[#60607a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#60607a]">Select an email to read it</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
