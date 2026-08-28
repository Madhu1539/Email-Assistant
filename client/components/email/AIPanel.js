import { useState } from 'react';
import {
  Sparkles, Wand2, Copy, Check, RefreshCw, ChevronDown, ChevronUp,
  Send, Tag, Zap, ListChecks, AlertCircle, Clock, CheckCircle2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import useUiStore from '@/store/uiStore';
import api from '@/services/api';

/**
 * AI Panel component displayed below email content in EmailDetail.
 * Features: Summarize, Draft Reply, Classify, Prioritize, Extract Actions
 */
export default function AIPanel({ messageId, emailSubject }) {
  const { showSuccess, showError } = useUiStore();

  // Summary state
  const [summary, setSummary]               = useState('');
  const [summaryProvider, setSummaryProvider] = useState('');
  const [isSummarizing, setIsSummarizing]   = useState(false);
  const [summaryOpen, setSummaryOpen]       = useState(false);

  // Reply draft state
  const [draft, setDraft]                   = useState('');
  const [draftProvider, setDraftProvider]   = useState('');
  const [instructions, setInstructions]     = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftOpen, setDraftOpen]           = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Classification state
  const [classification, setClassification] = useState(null); // { category, reason, provider }
  const [isClassifying, setIsClassifying]   = useState(false);

  // Priority state
  const [priority, setPriority]             = useState(null); // { priority, reason, provider }
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  // Action items state
  const [actionItems, setActionItems]       = useState(null); // { actions, provider }
  const [isExtracting, setIsExtracting]     = useState(false);
  const [actionsOpen, setActionsOpen]       = useState(false);

  // Copy states
  const [summaryCopied, setSummaryCopied]   = useState(false);
  const [draftCopied, setDraftCopied]       = useState(false);

  async function handleSummarize() {
    setIsSummarizing(true);
    setSummaryOpen(true);
    try {
      const res = await api.post(`/ai/summarize/${messageId}`);
      setSummary(res.data.data.summary);
      setSummaryProvider(res.data.data.provider);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'AI summary failed. Please try again.');
      setSummaryOpen(false);
    } finally {
      setIsSummarizing(false);
    }
  }

  async function handleGenerateDraft() {
    setIsGeneratingDraft(true);
    setDraftOpen(true);
    try {
      const res = await api.post(`/ai/reply/${messageId}`, { instructions });
      setDraft(res.data.data.draft);
      setDraftProvider(res.data.data.provider);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'AI reply generation failed. Please try again.');
      setDraftOpen(false);
    } finally {
      setIsGeneratingDraft(false);
    }
  }

  async function handleSendReply() {
    if (!draft) return;
    setIsSendingReply(true);
    try {
      await api.post(`/emails/${messageId}/reply`, { body: draft });
      showSuccess('Reply sent successfully.');
      setDraft('');
      setDraftOpen(false);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  }

  async function handleClassify() {
    setIsClassifying(true);
    try {
      const res = await api.post(`/ai/classify/${messageId}`);
      setClassification(res.data.data);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Classification failed. Please try again.');
    } finally {
      setIsClassifying(false);
    }
  }

  async function handlePrioritize() {
    setIsPrioritizing(true);
    try {
      const res = await api.post(`/ai/prioritize/${messageId}`);
      setPriority(res.data.data);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Priority analysis failed. Please try again.');
    } finally {
      setIsPrioritizing(false);
    }
  }

  async function handleExtractActions() {
    setIsExtracting(true);
    setActionsOpen(true);
    try {
      const res = await api.post(`/ai/extract-actions/${messageId}`);
      setActionItems(res.data.data);
    } catch (err) {
      showError(err?.response?.data?.error?.message || 'Action extraction failed. Please try again.');
      setActionsOpen(false);
    } finally {
      setIsExtracting(false);
    }
  }

  async function copyToClipboard(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'summary') {
        setSummaryCopied(true);
        setTimeout(() => setSummaryCopied(false), 2000);
      } else {
        setDraftCopied(true);
        setTimeout(() => setDraftCopied(false), 2000);
      }
    } catch {
      showError('Failed to copy to clipboard.');
    }
  }

  const providerLabel = (p) => p === 'gemini' ? 'Gemini' : 'OpenRouter';

  // Category styling
  const CATEGORY_STYLES = {
    Work:       'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Finance:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Travel:     'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    Promotions: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    Social:     'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    Updates:    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Personal:   'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    Other:      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  // Priority styling
  const PRIORITY_STYLES = {
    High:   { badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    Normal: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
    Low:    { badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  };

  const URGENCY_DOT = {
    high:   'bg-red-500',
    normal: 'bg-amber-500',
    low:    'bg-slate-400',
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
        AI Assistant
      </div>

      {/* Row 1: Classify + Prioritize (compact inline cards) */}
      <div className="grid grid-cols-2 gap-3">

        {/* Classify */}
        <div
          className="rounded-xl border px-4 py-3 space-y-2"
          style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Category</span>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={handleClassify}
              isLoading={isClassifying}
              disabled={isClassifying}
              id={`classify-btn-${messageId}`}
            >
              {classification ? <RefreshCw className="w-3.5 h-3.5" /> : <Tag className="w-3.5 h-3.5" />}
              {classification ? 'Re-check' : 'Classify'}
            </Button>
          </div>
          {isClassifying && (
            <div className="flex items-center gap-2 py-1">
              <Spinner size="sm" /><span className="text-xs text-[var(--color-text-secondary)]">Classifying…</span>
            </div>
          )}
          {classification && !isClassifying && (
            <div className="space-y-1.5 pt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[classification.category] || CATEGORY_STYLES.Other}`}>
                {classification.category}
              </span>
              {classification.reason && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {classification.reason}
                </p>
              )}
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                via {providerLabel(classification.provider)}
              </div>
            </div>
          )}
        </div>

        {/* Prioritize */}
        <div
          className="rounded-xl border px-4 py-3 space-y-2"
          style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Priority</span>
            </div>
            <Button
              variant="outline" size="sm"
              onClick={handlePrioritize}
              isLoading={isPrioritizing}
              disabled={isPrioritizing}
              id={`prioritize-btn-${messageId}`}
            >
              {priority ? <RefreshCw className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              {priority ? 'Re-check' : 'Analyze'}
            </Button>
          </div>
          {isPrioritizing && (
            <div className="flex items-center gap-2 py-1">
              <Spinner size="sm" /><span className="text-xs text-[var(--color-text-secondary)]">Analyzing…</span>
            </div>
          )}
          {priority && !isPrioritizing && (
            <div className="space-y-1.5 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PRIORITY_STYLES[priority.priority]?.badge || PRIORITY_STYLES.Normal.badge}`}>
                {PRIORITY_STYLES[priority.priority]?.icon}
                {priority.priority}
              </span>
              {priority.reason && (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {priority.reason}
                </p>
              )}
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                via {providerLabel(priority.provider)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Summarize */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Summarize</span>
          </div>
          <div className="flex items-center gap-1.5">
            {summary && (
              <button
                onClick={() => setSummaryOpen((v) => !v)}
                aria-expanded={summaryOpen}
                aria-label={summaryOpen ? 'Collapse summary' : 'Expand summary'}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={handleSummarize}
              isLoading={isSummarizing} disabled={isSummarizing} id={`summarize-btn-${messageId}`}>
              {summary ? <RefreshCw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {summary ? 'Re-summarize' : 'Summarize'}
            </Button>
          </div>
        </div>
        {summaryOpen && (isSummarizing || summary) && (
          <div
            className="px-4 pb-4 border-t pt-3 space-y-3"
            style={{ borderColor: 'var(--color-surface-border)' }}
          >
            {isSummarizing ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[var(--color-text-secondary)]">Generating summary…</span>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed font-normal" style={{ color: 'var(--color-text-primary)' }}>
                  {summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    via {providerLabel(summaryProvider)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(summary, 'summary')}
                    aria-label="Copy summary"
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {summaryCopied
                      ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
                      : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Action Items */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-green-500 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Action Items</span>
          </div>
          <div className="flex items-center gap-1.5">
            {actionItems && (
              <button
                onClick={() => setActionsOpen((v) => !v)}
                aria-expanded={actionsOpen}
                aria-label={actionsOpen ? 'Collapse actions' : 'Expand actions'}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {actionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={handleExtractActions}
              isLoading={isExtracting} disabled={isExtracting} id={`extract-actions-btn-${messageId}`}>
              {actionItems ? <RefreshCw className="w-3.5 h-3.5" /> : <ListChecks className="w-3.5 h-3.5" />}
              {actionItems ? 'Re-extract' : 'Extract'}
            </Button>
          </div>
        </div>

        {actionsOpen && (isExtracting || actionItems) && (
          <div
            className="px-4 pb-4 border-t pt-3 space-y-3"
            style={{ borderColor: 'var(--color-surface-border)' }}
          >
            {isExtracting ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[var(--color-text-secondary)]">Extracting action items…</span>
              </div>
            ) : actionItems?.actions?.length === 0 ? (
              <p className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                No action items found in this email.
              </p>
            ) : (
              <>
                <ul className="space-y-2.5">
                  {actionItems.actions.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-surface-hover)', borderColor: 'var(--color-surface-border)' }}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${URGENCY_DOT[item.urgency] || URGENCY_DOT.normal}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                          {item.task}
                        </p>
                        {item.deadline && (
                          <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {item.deadline}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize shrink-0 font-medium ${
                        item.urgency === 'high' ? 'text-red-600 bg-red-500/10' :
                        item.urgency === 'normal' ? 'text-amber-600 bg-amber-500/10' :
                        'text-slate-600 bg-slate-500/10'
                      }`}>
                        {item.urgency}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  via {providerLabel(actionItems.provider)}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Row 4: Draft Reply */}
      <div
        className="rounded-xl border"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-violet-500 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Draft Reply</span>
          </div>
          <div className="flex items-center gap-1.5">
            {draft && (
              <button
                onClick={() => setDraftOpen((v) => !v)}
                aria-expanded={draftOpen}
                aria-label={draftOpen ? 'Collapse draft' : 'Expand draft'}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {draftOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={handleGenerateDraft}
              isLoading={isGeneratingDraft} disabled={isGeneratingDraft} id={`draft-reply-btn-${messageId}`}>
              <Wand2 className="w-3.5 h-3.5" />
              {draft ? 'Regenerate' : 'Generate Draft'}
            </Button>
          </div>
        </div>

        {/* Instructions field */}
        <div className="px-4 pb-3">
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value.slice(0, 500))}
            placeholder="Optional: e.g. 'keep it brief' or 'be formal'"
            aria-label="Reply instructions for AI"
            className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              borderColor: 'var(--color-surface-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {instructions.length > 450 && (
            <p className="text-xs text-amber-500 mt-1">{500 - instructions.length} characters remaining</p>
          )}
        </div>

        {draftOpen && (isGeneratingDraft || draft) && (
          <div
            className="px-4 pb-4 border-t pt-3 space-y-3"
            style={{ borderColor: 'var(--color-surface-border)' }}
          >
            {isGeneratingDraft ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[var(--color-text-secondary)]">Generating reply draft…</span>
              </div>
            ) : (
              <>
                <pre
                  className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {draft}
                </pre>
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    via {providerLabel(draftProvider)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(draft, 'draft')}
                      aria-label="Copy draft"
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {draftCopied
                        ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
                        : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply}
                      aria-label="Send this reply"
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-2.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      {isSendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs px-1" style={{ color: 'var(--color-text-muted)' }}>
        AI responses may be inaccurate. Always review before acting.
      </p>
    </div>
  );
}
