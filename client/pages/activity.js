import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import api from '@/services/api';

const ACTIVITY_LABELS = {
  gmail_connected:    'Gmail Connected',
  gmail_disconnected: 'Gmail Disconnected',
  email_sent:         'Email Sent',
  email_replied:      'Email Replied',
  email_deleted:      'Email Deleted',
  email_archived:     'Email Archived',
  email_starred:      'Email Starred',
  email_unstarred:    'Email Unstarred',
  email_read:         'Marked as Read',
  email_unread:       'Marked as Unread',
  ai_summarize:       'AI Summary Generated',
  ai_reply:           'AI Reply Generated',
  login:              'Signed In',
  logout:             'Signed Out',
  registration:       'Account Created',
  error:              'Error',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function ActivityItem({ item }) {
  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-[#1e1e2a] transition-colors">
      <div className="mt-0.5 shrink-0">
        {item.status === 'success' ? (
          <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#f0f0f8]">
          {ACTIVITY_LABELS[item.type] || item.type}
        </p>
        {item.message && (
          <p className="text-xs text-[#9898b0] mt-0.5 truncate">{item.message}</p>
        )}
      </div>
      <time
        dateTime={item.createdAt}
        className="text-xs text-[#60607a] shrink-0"
      >
        {formatDate(item.createdAt)}
      </time>
    </div>
  );
}

export default function ActivityPage() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');

  async function fetchActivity(p = 1) {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get(`/activity?page=${p}&limit=20`);
      const { items: newItems, total: t, totalPages: tp } = res.data.data;
      setItems(newItems);
      setTotal(t);
      setPage(p);
      setTotalPages(tp);
    } catch {
      setError('Failed to load activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchActivity(1); }, []);

  return (
    <ProtectedRoute>
      <Head>
        <title>Activity — Intelligent Email Assistant</title>
        <meta name="description" content="Your application activity history." />
      </Head>
      <AppShell>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38] bg-[#1a1a24]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <h1 className="text-base font-semibold text-[#f0f0f8]">Activity</h1>
              {total > 0 && (
                <span className="text-xs text-[#60607a] bg-[#22222e] px-2 py-0.5 rounded-full">
                  {total}
                </span>
              )}
            </div>
            <button
              onClick={() => fetchActivity(page)}
              aria-label="Refresh activity"
              className="p-2 rounded-lg text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#22222e] transition-colors"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <p className="text-sm text-red-400">{error}</p>
                <Button variant="secondary" size="sm" onClick={() => fetchActivity(page)}>
                  Retry
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#22222e] border border-[#2a2a38] flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-[#60607a]" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-[#f0f0f8] mb-1">No activity yet</p>
                <p className="text-xs text-[#60607a]">Actions you take will appear here.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-[#2a2a38]">
                  {items.map((item) => (
                    <ActivityItem key={item._id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2a38]">
                    <p className="text-xs text-[#60607a]">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => fetchActivity(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => fetchActivity(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
