import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  CloudOff,
  Download,
  FileWarning,
  FolderOpen,
  History,
  Save,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { desktop, isDesktop } from '../../storage/desktop';
import { OPEN_SAVE_VERSION, OPEN_VERSION_HISTORY } from '../../storage/desktopEvents';
import { useRoadmap } from '../../state/roadmapContext';
import { getBackupState } from '../../state/backupState';
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
    markBackedUp,
    lastDraftSavedAt,
  } = useRoadmap();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const [localFileHandle, setLocalFileHandle] = useState(null);
  const [isLocalSaving, setIsLocalSaving] = useState(false);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    loadFileHandleFromIdb().then((handle) => {
      if (handle) setLocalFileHandle(handle);
    });
  }, []);

  const stateKey = getBackupState({ persistable, hasUnbackedChanges, saveError });
  const meta = STATES[stateKey];
  const Icon = meta.icon;
  let label = meta.label;
  if (isDesktop && stateKey === 'not-backed-up') label = 'Saving…';
  if (isDesktop && stateKey === 'backed-up') label = 'Saved';

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
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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

          {isDesktop && (
            <div className="mt-3 space-y-2" data-testid="desktop-save-section">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Changes are saved automatically to a file in your roadmap library folder.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="chip-save-version-btn"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event(OPEN_SAVE_VERSION));
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  Save version…
                </button>
                <button
                  type="button"
                  data-testid="chip-version-history-btn"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event(OPEN_VERSION_HISTORY));
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <History className="h-3.5 w-3.5" aria-hidden="true" />
                  Version history…
                </button>
                <button
                  type="button"
                  onClick={() => desktop.library.reveal(roadmapState.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Show file
                </button>
              </div>
            </div>
          )}

          {!isDesktop && isFileSystemAccessSupported() && (
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

      {showPrivacyModal && (
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
}
