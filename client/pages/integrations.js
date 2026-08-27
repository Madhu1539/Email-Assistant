import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import { Plug, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import useGmailStore from '@/store/gmailStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

export default function IntegrationsPage() {
  const router = useRouter();
  const { isConnected, gmailEmail, setGmailStatus } = useGmailStore();
  const { showSuccess, showError } = useUiStore();

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Read error from query param (set by OAuth callback redirect)
  const oauthError = router.query.error;

  function handleConnectGmail() {
    // Navigate directly — the backend handles the OAuth redirect
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/gmail/oauth/start`;
  }

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      await api.post('/gmail/disconnect');
      setGmailStatus({ isConnected: false, email: null });
      setShowConfirm(false);
      showSuccess('Gmail disconnected successfully.');
    } catch {
      showError('Failed to disconnect Gmail. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  }

  const ERROR_MESSAGES = {
    OAUTH_DENIED: 'Gmail connection was cancelled. You can try again anytime.',
    OAUTH_ERROR: 'Something went wrong during Gmail connection. Please try again.',
    OAUTH_STATE_INVALID: 'Connection session expired. Please try connecting again.',
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Integrations — Intelligent Email Assistant</title>
        <meta name="description" content="Connect and manage your Gmail account." />
      </Head>
      <AppShell>
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Page header */}
          <div className="flex items-center gap-2 mb-8">
            <Plug className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <h1 className="text-base font-semibold text-[#f0f0f8]">Integrations</h1>
          </div>

          {/* OAuth error banner */}
          {oauthError && (
            <div
              role="alert"
              className="flex items-start gap-3 mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{ERROR_MESSAGES[oauthError] || 'An error occurred. Please try again.'}</span>
            </div>
          )}

          {/* Gmail integration card */}
          <div className="bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-xl border flex items-center justify-center shrink-0
                  ${isConnected
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-[#22222e] border-[#2a2a38]'}
                `}>
                  {isConnected
                    ? <Wifi className="w-5 h-5 text-green-400" aria-hidden="true" />
                    : <WifiOff className="w-5 h-5 text-[#60607a]" aria-hidden="true" />}
                </div>
                <div>
                  <p className="font-semibold text-[#f0f0f8] text-sm">Gmail</p>
                  <p className="text-xs text-[#9898b0] mt-0.5">
                    {isConnected
                      ? `Connected as ${gmailEmail || 'your Gmail account'}`
                      : 'Connect your Gmail to read and manage emails'}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <span
                  className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg font-medium shrink-0"
                  aria-label="Gmail connected"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                  Connected
                </span>
              ) : (
                <Button variant="primary" size="sm" onClick={handleConnectGmail} id="connect-gmail-btn">
                  Connect Gmail
                </Button>
              )}
            </div>

            {/* Scopes info */}
            <div className="mt-5 pt-5 border-t border-[#2a2a38]">
              <p className="text-xs text-[#60607a] mb-2 font-medium uppercase tracking-wider">Permissions requested</p>
              <ul className="space-y-1 text-xs text-[#9898b0]">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" aria-hidden="true" />
                  Read your Gmail emails
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" aria-hidden="true" />
                  Send emails on your behalf
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" aria-hidden="true" />
                  Modify email labels (read, star, archive)
                </li>
              </ul>
            </div>

            {/* Disconnect section */}
            {isConnected && (
              <div className="mt-5 pt-5 border-t border-[#2a2a38]">
                {showConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-[#9898b0]">
                      This will revoke access and remove your Gmail tokens.
                      Your application account will remain active.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDisconnect}
                        isLoading={isDisconnecting}
                        id="confirm-disconnect-btn"
                      >
                        Yes, disconnect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirm(false)}
                        disabled={isDisconnecting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowConfirm(true)}
                    id="disconnect-gmail-btn"
                  >
                    Disconnect Gmail
                  </Button>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-[#60607a] mt-4">
            We never store your Gmail password. Access is managed via Google OAuth 2.0.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
