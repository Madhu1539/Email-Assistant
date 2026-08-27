import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import EmailDetail from '@/components/email/EmailDetail';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

export default function EmailDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { showSuccess, showError } = useUiStore();

  const [email, setEmail]               = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setIsLoading(true);
      try {
        const res = await api.get(`/emails/${id}`);
        setEmail(res.data.data);
        // Mark as read
        if (!res.data.data.isRead) {
          api.post(`/emails/${id}/read`).catch(() => {});
        }
      } catch (err) {
        showError(err?.response?.data?.error?.message || 'Failed to load email.');
        router.replace('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function doAction(fn, msg) {
    setIsActionLoading(true);
    try {
      await fn();
      setEmail((prev) => ({ ...prev, ...msg }));
    } catch {
      showError('Action failed.');
    } finally {
      setIsActionLoading(false);
    }
  }

  function handleDelete() {
    doAction(() => api.delete(`/emails/${id}`), {}).then(() => {
      showSuccess('Moved to Trash.');
      router.replace('/dashboard');
    }).catch(() => {});
  }

  function handleArchive() {
    api.post(`/emails/${id}/archive`)
      .then(() => { showSuccess('Archived.'); router.replace('/dashboard'); })
      .catch(() => showError('Archive failed.'));
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{email?.subject || 'Email'} — Intelligent Email Assistant</title>
      </Head>
      <AppShell>
        <EmailDetail
          email={email}
          isLoading={isLoading}
          onBack={() => router.back()}
          onMarkRead={() => doAction(() => api.post(`/emails/${id}/read`), { isRead: true })}
          onMarkUnread={() => doAction(() => api.post(`/emails/${id}/unread`), { isRead: false })}
          onStar={() => doAction(() => api.post(`/emails/${id}/star`), { isStarred: true })}
          onUnstar={() => doAction(() => api.post(`/emails/${id}/unstar`), { isStarred: false })}
          onArchive={handleArchive}
          onDelete={handleDelete}
          isActionLoading={isActionLoading}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
