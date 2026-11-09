import { useEffect, useRef, useState } from 'react';
import { Download, ShieldAlert, X } from 'lucide-react';
import { useRoadmap } from '../../state/roadmapContext';
import { downloadRoadmapJson } from '../../utils/download';
import { showToast } from '../../utils/toast';
import { useDriveBackupContext } from '../../state/driveBackupContext';

export const NAG_AFTER_MS = 5 * 60 * 1000;

/**
 * In-workspace strip. Red/amber when the draft cannot be written; amber after 5 minutes of edits
 * with no backup. Dismissible only for the nag (a failing draft stays until it works again).
 */
export default function BackupNagBanner() {
  const { roadmapState, saveError, hasUnbackedChanges, markBackedUp } = useRoadmap();
  const drive = useDriveBackupContext();
  const [overdue, setOverdue] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sinceRef = useRef(null);

  // Starts a clock when unbacked-up changes appear; resets whenever they are backed up.
  useEffect(() => {
    if (!hasUnbackedChanges) return undefined;
    sinceRef.current = Date.now();
    const id = setInterval(() => {
      setOverdue(Date.now() - sinceRef.current >= NAG_AFTER_MS);
    }, 15000);
    return () => {
      clearInterval(id);
      sinceRef.current = null;
      setOverdue(false);
      setDismissed(false);
    };
  }, [hasUnbackedChanges]);

  const nagVisible = hasUnbackedChanges && overdue && !dismissed;
  if (!saveError && !nagVisible) return null;

  const handleDownload = () => {
    // A roadmap already linked to Drive backs up there; otherwise fall back to a file download.
    if (drive.link && drive.auth.connected) {
      drive.syncNow();
      return;
    }
    downloadRoadmapJson(roadmapState);
    markBackedUp('download');
    showToast({ message: 'Backup downloaded. Keep the file somewhere safe.', tone: 'success' });
  };

  return (
    <div
      role={saveError ? 'alert' : 'status'}
      data-testid="backup-banner"
      className={`flex shrink-0 items-center gap-3 border-b px-4 py-2 text-xs sm:px-6 ${
        saveError
          ? 'border-rose-500/40 bg-rose-500/15 text-rose-900 dark:text-rose-100'
          : 'border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100'
      }`}
    >
      <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        {saveError ? (
          <>
            <strong>Changes are not being saved in this browser.</strong> {saveError.message}{' '}
            Download a backup so you do not lose your work.
          </>
        ) : (
          <>
            <strong>This roadmap has not been backed up.</strong> It only exists as a temporary
            draft in this browser.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={handleDownload}
        data-testid="banner-download-btn"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        Back up now
      </button>
      {!saveError && (
        <button
          type="button"
          aria-label="Dismiss reminder"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
