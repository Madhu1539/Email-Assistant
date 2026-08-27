import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { PenSquare, Send, X, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useGmailStore from '@/store/gmailStore';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';
import { isValidEmail } from '@/utils/validators';
import Link from 'next/link';

const EMPTY_FORM = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
};

function validateCompose(form) {
  const errors = {};
  if (!form.to.trim()) {
    errors.to = 'At least one recipient is required.';
  } else {
    const addresses = form.to.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const invalid = addresses.filter((a) => !isValidEmail(a));
    if (invalid.length > 0) errors.to = `Invalid address(es): ${invalid.join(', ')}`;
  }
  if (form.cc) {
    const ccAddrs = form.cc.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const invalid = ccAddrs.filter((a) => !isValidEmail(a));
    if (invalid.length > 0) errors.cc = `Invalid CC address(es): ${invalid.join(', ')}`;
  }
  if (!form.body.trim()) errors.body = 'Email body is required.';
  if (form.subject.length > 998) errors.subject = 'Subject must not exceed 998 characters.';
  return errors;
}

export default function ComposePage() {
  const router = useRouter();
  const { isConnected } = useGmailStore();
  const { showSuccess, showError } = useUiStore();

  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc]       = useState(false);
  const [showBcc, setShowBcc]     = useState(false);

  // AI Compose state
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [aiProvider, setAiProvider]       = useState('');
  const [aiPanelOpen, setAiPanelOpen]     = useState(true);

  // Pre-fill body from query params (e.g. from AIPanel)
  useEffect(() => {
    const { body } = router.query;
    if (body) setForm((p) => ({ ...p, body: String(body) }));
  }, [router.query]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }

  async function handleAiGenerate() {
    if (!aiDescription.trim() || aiDescription.trim().length < 5) {
      showError('Please describe what you want to write (at least 5 characters).');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate', { description: aiDescription.trim() });
      const { email, provider } = res.data.data;
      setForm((p) => ({
        ...p,
        subject: email.subject || p.subject,
        body: email.body || p.body,
      }));
      setAiProvider(provider);
      setAiPanelOpen(false);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'AI generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateCompose(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSending(true);
    try {
      await api.post('/emails/send', {
        to: form.to.split(/[,;]/).map((s) => s.trim()).filter(Boolean),
        cc: showCc && form.cc ? form.cc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
        bcc: showBcc && form.bcc ? form.bcc.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
        subject: form.subject,
        body: form.body,
      });
      showSuccess('Email sent successfully.');
      router.replace('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.error?.message || 'Failed to send email.';
      showError(msg);
    } finally {
      setIsSending(false);
    }
  }

  function handleDiscard() {
    setForm(EMPTY_FORM);
    setErrors({});
    router.back();
  }

  const providerLabel = (p) => p === 'gemini' ? 'Gemini' : 'OpenRouter';

  return (
    <ProtectedRoute>
      <Head>
        <title>Compose — Intelligent Email Assistant</title>
        <meta name="description" content="Compose and send a new email." />
      </Head>
      <AppShell>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38] bg-[#1a1a24] shrink-0">
            <div className="flex items-center gap-2">
              <PenSquare className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              <h1 className="text-base font-semibold text-[#f0f0f8]">New Email</h1>
            </div>
            <button
              onClick={handleDiscard}
              aria-label="Discard draft"
              className="p-2 rounded-lg text-[#60607a] hover:text-red-400 hover:bg-[#22222e] transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {!isConnected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
              <p className="text-sm text-[#9898b0]">Connect Gmail to send emails.</p>
              <Link href="/integrations">
                <Button variant="primary" size="sm">Connect Gmail</Button>
              </Link>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

                {/* AI Compose Panel */}
                <div className="rounded-xl bg-[#1e1e2a] border border-violet-500/20">
                  <button
                    type="button"
                    onClick={() => setAiPanelOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    aria-expanded={aiPanelOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium text-[#f0f0f8]">Generate with AI</span>
                      {aiProvider && !aiPanelOpen && (
                        <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                          Generated via {providerLabel(aiProvider)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#60607a]">{aiPanelOpen ? 'Hide' : 'Show'}</span>
                  </button>

                  {aiPanelOpen && (
                    <div className="px-4 pb-4 border-t border-[#2a2a38] pt-3 space-y-3">
                      <p className="text-xs text-[#9898b0]">
                        Describe what you want to write — AI will generate the subject and body for you.
                      </p>
                      <textarea
                        id="ai-description"
                        value={aiDescription}
                        onChange={(e) => setAiDescription(e.target.value.slice(0, 1000))}
                        placeholder="e.g. Write a polite follow-up to my client about the invoice due September 1st."
                        rows={3}
                        aria-label="Describe the email you want AI to write"
                        className="w-full px-3 py-2.5 text-sm bg-[#22222e] border border-[#2a2a38] rounded-lg text-[#f0f0f8] placeholder-[#60607a] resize-y focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#60607a]">{aiDescription.length}/1000</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAiGenerate}
                          isLoading={isGenerating}
                          disabled={isGenerating || aiDescription.trim().length < 5}
                          id="ai-generate-btn"
                        >
                          {isGenerating ? 'Generating...' : aiProvider ? 'Regenerate' : 'Generate Email'}
                        </Button>
                      </div>
                      {aiProvider && (
                        <p className="text-xs text-violet-400">
                          Subject and body filled in via {providerLabel(aiProvider)}. Review and edit below before sending.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Compose Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* To */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Input
                        id="to"
                        name="to"
                        type="text"
                        label="To"
                        placeholder="recipient@example.com, another@example.com"
                        value={form.to}
                        onChange={handleChange}
                        error={errors.to}
                        required
                        className="flex-1"
                      />
                      <div className="flex gap-1 mt-6">
                        {!showCc && (
                          <button
                            type="button"
                            onClick={() => setShowCc(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded"
                          >
                            CC
                          </button>
                        )}
                        {!showBcc && (
                          <button
                            type="button"
                            onClick={() => setShowBcc(true)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 rounded"
                          >
                            BCC
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CC */}
                  {showCc && (
                    <Input id="cc" name="cc" type="text" label="CC" placeholder="cc@example.com"
                      value={form.cc} onChange={handleChange} error={errors.cc} />
                  )}

                  {/* BCC */}
                  {showBcc && (
                    <Input id="bcc" name="bcc" type="text" label="BCC" placeholder="bcc@example.com"
                      value={form.bcc} onChange={handleChange} error={errors.bcc} />
                  )}

                  {/* Subject */}
                  <Input id="subject" name="subject" type="text" label="Subject"
                    placeholder="Enter a subject..." value={form.subject}
                    onChange={handleChange} error={errors.subject} />

                  {/* Body */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="body" className="text-sm font-medium text-[#9898b0]">
                      Message <span className="text-red-400" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="body" name="body" rows={14} value={form.body} onChange={handleChange}
                      placeholder="Write your message here... or use AI above to generate it."
                      required aria-invalid={!!errors.body}
                      aria-describedby={errors.body ? 'body-error' : undefined}
                      className={`w-full px-4 py-3 rounded-lg text-sm resize-y bg-[#1a1a24] border text-[#f0f0f8] placeholder-[#60607a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${errors.body ? 'border-red-500/50' : 'border-[#2a2a38] hover:border-[#3a3a50]'}`}
                    />
                    {errors.body && (
                      <p id="body-error" role="alert" className="text-xs text-red-400">{errors.body}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" variant="primary" size="md" isLoading={isSending} id="send-email-btn">
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Send
                    </Button>
                    <Button type="button" variant="ghost" size="md" onClick={handleDiscard} disabled={isSending}>
                      Discard
                    </Button>
                  </div>
                </form>

              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
