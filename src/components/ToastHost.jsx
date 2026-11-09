import { useEffect, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { dismissToast, subscribeToasts } from '../utils/toast';

const TONES = {
  info: {
    icon: Info,
    ring: 'border-indigo-400/50',
    accent: 'text-indigo-500 dark:text-indigo-300',
  },
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-400/50',
    accent: 'text-emerald-500 dark:text-emerald-300',
  },
  warning: {
    icon: TriangleAlert,
    ring: 'border-amber-400/60',
    accent: 'text-amber-500 dark:text-amber-300',
  },
  error: { icon: XCircle, ring: 'border-rose-400/60', accent: 'text-rose-500 dark:text-rose-300' },
};

/** Renders toasts raised through utils/toast. Mount once near the app root. */
export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(
    () =>
      subscribeToasts((event) => {
        setToasts((prev) =>
          event.type === 'add'
            ? [...prev.slice(-3), event.toast]
            : prev.filter((t) => t.id !== event.id)
        );
      }),
    []
  );

  useEffect(() => {
    const timers = toasts
      .filter((t) => t.duration > 0)
      .map((t) => setTimeout(() => dismissToast(t.id), t.duration));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[400] flex -translate-x-1/2 flex-col items-center gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const tone = TONES[t.tone] || TONES.info;
        const Icon = tone.icon;
        return (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            data-testid="toast"
            className={`flex items-center gap-3 rounded-2xl border bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-xl backdrop-blur dark:bg-slate-900/95 dark:text-slate-100 ${tone.ring}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${tone.accent}`} aria-hidden="true" />
            <span>{t.message}</span>
            {t.actionLabel && (
              <button
                type="button"
                data-testid="toast-action"
                onClick={() => {
                  t.onAction?.();
                  dismissToast(t.id);
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-300"
              >
                {t.actionLabel}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(t.id)}
              className="rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
