import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  Download,
  FileWarning,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useRoadmap } from '../../state/roadmapContext';
import { useDriveBackupContext } from '../../state/driveBackupContext';
import { getBackupState } from '../../state/backupState';
import { isBlockingProblem } from '../../hooks/useDriveBackup';
import { downloadRoadmapJson, formatRelativeTime } from '../../utils/download';
import { showToast } from '../../utils/toast';
import {
  isFileSystemAccessSupported,
  pickLocalFileToSave,
  writeRoadmapToHandle,
} from '../../utils/fileSystemAccess';
import {
  loadFileHandleFromIdb,
  saveFileHandleToIdb,
  clearFileHandleFromIdb,
} from '../../data/indexedDbDraft';
import RevisionHistoryModal from './RevisionHistoryModal';
import GoogleDriveSection from './GoogleDriveSection';
import DriveRoadmapsModal from './DriveRoadmapsModal';
import LocalFileSection from './LocalFileSection';
import PrivacyModal from '../PrivacyModal';

const STATES = {
  'not-backed-up': {
    label: 'Not backed up',
    icon: CloudOff,
    cls: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40 hover:bg-rose-500/25',
  },
  'draft-failing': {
    label: 'Draft not saving',
    icon: ShieldAlert,
    cls: 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/50 hover:bg-amber-500/30',
  },
  'backed-up': {
    label: 'Backed up',
    icon: CheckCircle2,
    cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25',
  },
  syncing: {
    label: 'Saving to Drive…',
    icon: Loader2,
    cls: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/40 hover:bg-amber-500/25',
  },
  attention: {
    label: 'Drive needs attention',
    icon: AlertTriangle,
    cls: 'bg-orange-500/20 text-orange-800 dark:text-orange-200 border-orange-500/50 hover:bg-orange-500/30',
  },
  sample: {
    label: 'Sample roadmap',
    icon: FileWarning,
    cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/40 hover:bg-slate-500/20',
  },
};

export default function BackupChip() {
  const {
    roadmapState,
    persistable,
    hasUnbackedChanges,
    saveError,
    lastBackupAt,
    backupMethod,
    markBackedUp,
    lastDraftSavedAt,
    importRoadmap,
  } = useRoadmap();
  const drive = useDriveBackupContext();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const [localFileHandle, setLocalFileHandle] = useState(null);
  const [isLocalSaving, setIsLocalSaving] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  useEffect(() => {
    loadFileHandleFromIdb().then((handle) => {
      if (handle) setLocalFileHandle(handle);
    });
  }, []);

  const driveAttention =
    isBlockingProblem(drive.problem) ||
    drive.linkedElsewhere ||
    Boolean(drive.link && !drive.auth.connected && hasUnbackedChanges);

  const stateKey = getBackupState({
    persistable,
    hasUnbackedChanges,
    saveError,
    driveSyncing: drive.syncing,
    driveAttention,
  });
  const meta = STATES[stateKey];
  const Icon = meta.icon;
  let label = meta.label;
  if (stateKey === 'backed-up' && backupMethod === 'google-drive') label = 'Saved to Google Drive';
  if (stateKey === 'attention') {
    const kind = drive.problem?.kind;
    if (kind === 'conflict') label = 'Drive conflict';
    else if (kind === 'trashed' || kind === 'missing') label = 'Drive file missing';
    else if (!drive.auth.connected && !drive.linkedElsewhere) label = 'Reconnect Drive';
  }

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleDownload = () => {
    downloadRoadmapJson(roadmapState);
    markBackedUp('download');
    showToast({ message: 'Backup downloaded. Keep the file somewhere safe.', tone: 'success' });
    setOpen(false);
  };

  const handleLinkLocalFile = async () => {
    try {
      setIsLocalSaving(true);
      const suggestedName = `${roadmapState.config?.name || 'roadmap'}.json`;
      const handle = await pickLocalFileToSave(suggestedName);
      await writeRoadmapToHandle(handle, roadmapState);
      await saveFileHandleToIdb(handle);
      setLocalFileHandle(handle);
      markBackedUp('local-file');
      showToast({ message: `Saved directly to ${handle.name}.`, tone: 'success' });
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast({ message: err.message || 'Could not save local file.', tone: 'error' });
      }
    } finally {
      setIsLocalSaving(false);
    }
  };

  const handleSyncLocalFile = async () => {
    if (!localFileHandle) return;
    try {
      setIsLocalSaving(true);
      await writeRoadmapToHandle(localFileHandle, roadmapState);
      markBackedUp('local-file');
      showToast({ message: `Updated ${localFileHandle.name}.`, tone: 'success' });
    } catch (err) {
      showToast({ message: err.message || 'Could not update local file.', tone: 'error' });
    } finally {
      setIsLocalSaving(false);
    }
  };

  const handleUnlinkLocalFile = async () => {
    await clearFileHandleFromIdb();
    setLocalFileHandle(null);
    showToast({ message: 'Unlinked local file.', tone: 'info' });
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        data-testid="backup-chip"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${meta.cls}`}
        title="Where is my work saved?"
      >
        <Icon
          className={`h-3.5 w-3.5 ${stateKey === 'syncing' ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <span>{label}</span>
        {stateKey === 'backed-up' && (
          <span className="hidden font-normal opacity-80 md:inline">
            · {formatRelativeTime(lastBackupAt)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Backup status"
          className="absolute left-0 xl:left-auto xl:right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Save &amp; Backup</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Draft: {lastDraftSavedAt ? formatRelativeTime(lastDraftSavedAt) : 'up to date'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowPrivacyModal(true);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy</span>
            </button>
          </div>

          <GoogleDriveSection
            onOpenHistory={() => setShowHistoryModal(true)}
            onOpenFromDrive={() => {
              setOpen(false);
              setShowDriveModal(true);
            }}
          />

          {isFileSystemAccessSupported() && (
            <LocalFileSection
              localFileHandle={localFileHandle}
              isLocalSaving={isLocalSaving}
              onLinkLocalFile={handleLinkLocalFile}
              onSyncLocalFile={handleSyncLocalFile}
              onUnlinkLocalFile={handleUnlinkLocalFile}
            />
          )}

          <button
            type="button"
            data-testid="backup-download-btn"
            onClick={handleDownload}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download backup (.json)</span>
          </button>
        </div>
      )}

      {showHistoryModal && (
        <RevisionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          fileId={drive.link?.fileId}
          onRestore={(data) => {
            importRoadmap(data);
            showToast({
              message: 'Restored that version. Undo is available; back up to keep it.',
              tone: 'success',
            });
          }}
        />
      )}

      {showDriveModal && (
        <DriveRoadmapsModal
          onClose={() => setShowDriveModal(false)}
          onOpened={() => setShowDriveModal(false)}
        />
      )}

      {showPrivacyModal && (
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
}
