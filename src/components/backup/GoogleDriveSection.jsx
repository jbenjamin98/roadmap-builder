import {
  AlertTriangle,
  Cloud,
  CloudUpload,
  FolderOpen,
  History,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useDriveBackupContext } from '../../state/driveBackupContext';
import { formatRelativeTime } from '../../utils/download';

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50';
const btnPrimary = `${btn} bg-indigo-600 text-white shadow-sm hover:bg-indigo-500`;
const btnQuiet = `${btn} bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700`;

function GoogleG() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/** What went wrong and the one or two actions that fix it. Mirrors the design's edge-case table. */
function ProblemNotice({ drive }) {
  const { problem, link, linkedElsewhere } = drive;
  if (!problem && !linkedElsewhere) return null;
  const kind = linkedElsewhere ? 'account' : problem.kind;

  const copy = {
    auth: 'Your Google sign-in expired, so changes are not uploading.',
    trashed: 'This roadmap’s Drive file is in the Trash.',
    missing: 'The linked Drive file was deleted or can no longer be reached.',
    conflict: 'Drive has a newer version of this roadmap than this browser.',
    account: `This roadmap is linked to another Google account${link?.accountId ? ` (${link.accountId})` : ''}.`,
    network: 'You appear to be offline. Changes upload automatically once you are back.',
    other: problem?.message,
  }[kind];

  const actions = {
    auth: [['Reconnect', drive.connect, true]],
    trashed: [
      ['Restore from Trash', drive.restoreTrashedFile, true],
      ['Save as new file', drive.saveAsNewFile],
    ],
    missing: [
      ['Save as new file', drive.saveAsNewFile, true],
      ['Unlink', drive.unlink],
    ],
    conflict: [['Resolve…', () => drive.setConflictOpen(true), true]],
    account: [
      ['Save as new file', drive.saveAsNewFile, true],
      ['Unlink', drive.unlink],
    ],
  }[kind];

  return (
    <div
      role="alert"
      data-testid="drive-problem"
      className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-900 dark:text-amber-100"
    >
      <p className="flex gap-1.5">
        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{copy}</span>
      </p>
      {actions && (
        <div className="flex flex-wrap gap-1.5">
          {actions.map(([label, onClick, primary]) => (
            <button
              key={label}
              type="button"
              disabled={drive.syncing}
              onClick={onClick}
              className={primary ? btnPrimary : btnQuiet}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoogleDriveSection({ onOpenHistory, onOpenFromDrive }) {
  const drive = useDriveBackupContext();
  const { auth, link, syncing } = drive;

  return (
    <div
      data-testid="drive-section"
      className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-sky-500" aria-hidden="true" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Google Drive</span>
        </div>
        {auth.connected && (
          <button
            type="button"
            onClick={drive.disconnect}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-400"
          >
            <LogOut className="h-3 w-3" aria-hidden="true" />
            <span>Disconnect</span>
          </button>
        )}
      </div>

      <ProblemNotice drive={drive} />

      {auth.connected && auth.profile && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          {auth.profile.picture && (
            <img src={auth.profile.picture} alt="" className="h-4 w-4 rounded-full" />
          )}
          <span className="truncate">{auth.profile.email}</span>
        </div>
      )}

      {link && (
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Roadmap Builder / {link.fileName || 'roadmap.json'}
          </span>
          {link.lastSyncedAt ? ` · saved ${formatRelativeTime(link.lastSyncedAt)}` : ''}
          <br />
          Changes upload automatically about 30 seconds after you stop editing.
        </p>
      )}

      {auth.connected ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="drive-sync-btn"
              disabled={syncing}
              onClick={drive.syncNow}
              className={`${btnPrimary} flex-1`}
            >
              {syncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{link ? 'Back up now' : 'Save to Drive'}</span>
            </button>
            {link && (
              <button
                type="button"
                data-testid="drive-history-btn"
                onClick={onOpenHistory}
                className={btnQuiet}
                title="Version history"
              >
                <History className="h-3.5 w-3.5" aria-hidden="true" />
                <span>History</span>
              </button>
            )}
          </div>
          <button
            type="button"
            data-testid="drive-open-from-menu-btn"
            onClick={onOpenFromDrive}
            className={`${btnQuiet} w-full`}
          >
            <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open another roadmap…</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            data-testid="drive-connect-btn"
            disabled={syncing}
            onClick={drive.connect}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleG />
            )}
            <span>{link ? 'Reconnect Google Drive' : 'Connect Google Drive'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
