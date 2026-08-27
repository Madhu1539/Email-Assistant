import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import useUiStore from '@/store/uiStore';

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />,
  error:   <XCircle    className="w-5 h-5 text-red-400"   aria-hidden="true" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-400" aria-hidden="true" />,
  info:    <Info       className="w-5 h-5 text-blue-400"  aria-hidden="true" />,
};

const BORDER_COLORS = {
  success: 'border-green-500/20',
  error:   'border-red-500/20',
  warning: 'border-amber-500/20',
  info:    'border-blue-500/20',
};

const AUTO_DISMISS_MS = 4000;

function Toast({ id, message, type = 'info' }) {
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, removeToast]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        toast-enter flex items-start gap-3 w-80 max-w-full
        bg-[#1e1e2a] border ${BORDER_COLORS[type]}
        rounded-xl px-4 py-3 shadow-2xl
      `}
    >
      <span className="mt-0.5 shrink-0">{ICONS[type]}</span>
      <p className="text-sm text-[#f0f0f8] flex-1 leading-snug">{message}</p>
      <button
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-[#60607a] hover:text-[#f0f0f8] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
