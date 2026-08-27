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
    Work:       'bg-blue-500/15 text-blue-400 border-blue-500/25',
    Finance:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    Travel:     'bg-sky-500/15 text-sky-400 border-sky-500/25',
    Promotions: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    Social:     'bg-pink-500/15 text-pink-400 border-pink-500/25',
    Updates:    'bg-purple-500/15 text-purple-400 border-purple-500/25',
    Personal:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    Other:      'bg-[#2a2a38] text-[#9898b0] border-[#3a3a50]',
  };

  // Priority styling
  const PRIORITY_STYLES = {
    High:   { badge: 'bg-red-500/15 text-red-400 border-red-500/25', icon: <AlertCircle className="w-3.5 h-3.5" /> },
    Normal: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25', icon: <Clock className="w-3.5 h-3.5" /> },
    Low:    { badge: 'bg-[#2a2a38] text-[#9898b0] border-[#3a3a50]', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  };

  const URGENCY_DOT = {
    high:   'bg-red-400',
    normal: 'bg-amber-400',
    low:    'bg-[#60607a]',
  };

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2 text-xs font-medium text-[#9898b0] uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
        AI Assistant
      </div>

      {/* Row 1: Classify + Prioritize (compact inline cards) */}
      <div className="grid grid-cols-2 gap-3">

        {/* Classify */}
        <div className="rounded-xl bg-[#1e1e2a] border border-indigo-500/15 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-[#f0f0f8]">Category</span>
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
              <Spinner size="sm" /><span className="text-xs text-[#9898b0]">Classifying…</span>
            </div>
          )}
          {classification && !isClassifying && (
            <div className="space-y-1">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CATEGORY_STYLES[classification.category] || CATEGORY_STYLES.Other}`}>
                {classification.category}
              </span>
              {classification.reason && (
                <p className="text-xs text-[#60607a] leading-relaxed">{classification.reason}</p>
              )}
              <span className="text-xs text-[#60607a]">via {providerLabel(classification.provider)}</span>
            </div>
          )}
        </div>

        {/* Prioritize */}
        <div className="rounded-xl bg-[#1e1e2a] border border-indigo-500/15 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-[#f0f0f8]">Priority</span>
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
              <Spinner size="sm" /><span className="text-xs text-[#9898b0]">Analyzing…</span>
            </div>
          )}
          {priority && !isPrioritizing && (
            <div className="space-y-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_STYLES[priority.priority]?.badge || PRIORITY_STYLES.Normal.badge}`}>
                {PRIORITY_STYLES[priority.priority]?.icon}
                {priority.priority}
              </span>
              {priority.reason && (
                <p className="text-xs text-[#60607a] leading-relaxed">{priority.reason}</p>
              )}
              <span className="text-xs text-[#60607a]">via {providerLabel(priority.provider)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Summarize */}
      <div className="rounded-xl bg-[#1e1e2a] border border-indigo-500/15">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-[#f0f0f8]">Summarize</span>
          </div>
          <div className="flex items-center gap-1.5">
            {summary && (
              <button
                onClick={() => setSummaryOpen((v) => !v)}
                aria-expanded={summaryOpen}
                aria-label={summaryOpen ? 'Collapse summary' : 'Expand summary'}
                className="p-1.5 rounded-md text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#2a2a38] transition-colors"
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
          <div className="px-4 pb-4 border-t border-[#2a2a38] pt-3 space-y-3">
            {isSummarizing ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[#9898b0]">Generating summary…</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#d0d0e0] leading-relaxed">{summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#60607a]">via {providerLabel(summaryProvider)}</span>
                  <button onClick={() => copyToClipboard(summary, 'summary')} aria-label="Copy summary"
                    className="flex items-center gap-1.5 text-xs text-[#9898b0] hover:text-[#f0f0f8] transition-colors">
                    {summaryCopied
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                      : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Row 3: Action Items */}
      <div className="rounded-xl bg-[#1e1e2a] border border-green-500/15">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-green-400 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-[#f0f0f8]">Action Items</span>
          </div>
          <div className="flex items-center gap-1.5">
            {actionItems && (
              <button
                onClick={() => setActionsOpen((v) => !v)}
                aria-expanded={actionsOpen}
                aria-label={actionsOpen ? 'Collapse actions' : 'Expand actions'}
                className="p-1.5 rounded-md text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#2a2a38] transition-colors"
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
          <div className="px-4 pb-4 border-t border-[#2a2a38] pt-3 space-y-3">
            {isExtracting ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[#9898b0]">Extracting action items…</span>
              </div>
            ) : actionItems?.actions?.length === 0 ? (
              <p className="text-sm text-[#60607a] italic">No action items found in this email.</p>
            ) : (
              <>
                <ul className="space-y-2.5">
                  {actionItems.actions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#22222e] border border-[#2a2a38]">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${URGENCY_DOT[item.urgency] || URGENCY_DOT.normal}`} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#f0f0f8] leading-relaxed">{item.task}</p>
                        {item.deadline && (
                          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {item.deadline}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded capitalize shrink-0 ${
                        item.urgency === 'high' ? 'text-red-400 bg-red-500/10' :
                        item.urgency === 'normal' ? 'text-amber-400 bg-amber-500/10' :
                        'text-[#60607a] bg-[#2a2a38]'
                      }`}>
                        {item.urgency}
                      </span>
                    </li>
                  ))}
                </ul>
                <span className="text-xs text-[#60607a]">via {providerLabel(actionItems.provider)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Row 4: Draft Reply */}
      <div className="rounded-xl bg-[#1e1e2a] border border-violet-500/15">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-violet-400 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium text-[#f0f0f8]">Draft Reply</span>
          </div>
          <div className="flex items-center gap-1.5">
            {draft && (
              <button
                onClick={() => setDraftOpen((v) => !v)}
                aria-expanded={draftOpen}
                aria-label={draftOpen ? 'Collapse draft' : 'Expand draft'}
                className="p-1.5 rounded-md text-[#60607a] hover:text-[#f0f0f8] hover:bg-[#2a2a38] transition-colors"
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
            className="w-full px-3 py-2 text-xs bg-[#22222e] border border-[#2a2a38] rounded-lg text-[#f0f0f8] placeholder-[#60607a] focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          {instructions.length > 450 && (
            <p className="text-xs text-amber-400 mt-1">{500 - instructions.length} characters remaining</p>
          )}
        </div>

        {draftOpen && (isGeneratingDraft || draft) && (
          <div className="px-4 pb-4 border-t border-[#2a2a38] pt-3 space-y-3">
            {isGeneratingDraft ? (
              <div className="flex items-center gap-2 py-2">
                <Spinner size="sm" /><span className="text-xs text-[#9898b0]">Generating reply draft…</span>
              </div>
            ) : (
              <>
                <pre className="text-sm text-[#d0d0e0] leading-relaxed whitespace-pre-wrap font-sans">{draft}</pre>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#60607a]">via {providerLabel(draftProvider)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(draft, 'draft')} aria-label="Copy draft"
                      className="flex items-center gap-1.5 text-xs text-[#9898b0] hover:text-[#f0f0f8] transition-colors">
                      {draftCopied
                        ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                        : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply}
                      aria-label="Send this reply"
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-2.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20"
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

      <p className="text-xs text-[#60607a] px-1">
        AI responses may be inaccurate. Always review before acting.
      </p>
    </div>
  );
}
