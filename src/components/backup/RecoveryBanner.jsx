import { Download, History, X } from 'lucide-react';
import { readQuarantined } from '../../data/persistence';
import { downloadText } from '../../utils/download';

/** Shown once after load when the saved draft could not be read. Nothing was overwritten. */
export default function RecoveryBanner({ recovery, onRestore, onDismiss }) {
  if (!recovery) return null;

  const handleDownloadCorrupt = () => {
    const raw = readQuarantined(recovery.corruptKey);
    if (raw) downloadText(raw, 'roadmap-draft-unreadable.json');
  };

  return (
    <div
      role="alert"
      data-testid="recovery-banner"
      className="fixed left-1/2 top-4 z-[350] flex w-[min(92vw,44rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-rose-400/60 bg-white p-4 text-sm shadow-2xl dark:bg-slate-900"
    >
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 dark:text-white">
          Your saved draft could not be read
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          We kept the unreadable data untouched so nothing is lost.
          {recovery.lastGoodAvailable
            ? ' You can restore the copy from your previous session.'
            : ''}
        </p>
      </div>
      {recovery.corruptKey && (
        <button
          type="button"
          onClick={handleDownloadCorrupt}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download it
        </button>
      )}
      {recovery.lastGoodAvailable && (
        <button
          type="button"
          onClick={onRestore}
          data-testid="restore-lastgood-btn"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Restore previous
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
