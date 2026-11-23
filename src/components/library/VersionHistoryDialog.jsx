import { useEffect, useState } from 'react';
import { Pin, PinOff, RotateCcw, Trash2, Copy } from 'lucide-react';
import Modal from '../ui/Modal';
import { desktop } from '../../storage/desktop';
import { formatBytes, formatRelativeTime } from '../../utils/download';
import { showToast } from '../../utils/toast';

const iconBtn =
  'rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white';

/**
 * Desktop only: every saved version of the open roadmap. Pinned "master" versions never expire.
 * `onRestore(state)` replaces the open roadmap (undoable); `onOpenCopy(state)` loads it as a new one.
 */
export default function VersionHistoryDialog({ roadmapId, onRestore, onOpenCopy, onClose }) {
  const [versions, setVersions] = useState(null);
  const [editing, setEditing] = useState(null); // { id, label }

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    desktop.versions
      .list(roadmapId)
      .then((list) => {
        if (!cancelled) setVersions(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setVersions([]);
        showToast({ message: `Could not load versions: ${err?.message || err}`, tone: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [roadmapId, reloadKey]);

  const guard = async (fn, failure) => {
    try {
      await fn();
    } catch (err) {
      showToast({ message: `${failure}: ${err?.message || err}`, tone: 'error' });
    }
  };

  const restore = (v) =>
    guard(async () => {
      const state = await desktop.versions.restore(roadmapId, v.id);
      onRestore(state);
      onClose();
    }, 'Could not restore');

  const openCopy = (v) =>
    guard(async () => {
      const state = await desktop.versions.read(roadmapId, v.id);
      onOpenCopy(state);
      onClose();
    }, 'Could not open copy');

  const togglePin = (v) =>
    guard(async () => {
      await desktop.versions.update(roadmapId, v.id, { pinned: !v.pinned });
      refresh();
    }, 'Could not update version');

  const saveLabel = () =>
    guard(async () => {
      await desktop.versions.update(roadmapId, editing.id, { label: editing.label });
      setEditing(null);
      refresh();
    }, 'Could not rename version');

  const remove = (v) =>
    guard(async () => {
      await desktop.versions.remove(roadmapId, v.id);
      refresh();
    }, 'Could not delete version');

  return (
    <Modal
      testId="version-history-dialog"
      title="Version history"
      description="Restoring replaces the open roadmap and can be undone. Your current version is snapshotted first."
      onClose={onClose}
      widthClass="max-w-2xl"
    >
      {versions === null && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
      {versions?.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500" data-testid="versions-empty">
          No versions yet. They are created automatically as you work, or use File → Save Version.
        </p>
      )}
      <ul className="max-h-[55vh] space-y-2 overflow-y-auto pr-1" data-testid="versions-list">
        {versions?.map((v) => (
          <li
            key={v.id}
            data-pinned={v.pinned ? 'true' : 'false'}
            className={`flex items-center gap-2 rounded-2xl border p-2 ${
              v.pinned
                ? 'border-amber-400/60 bg-amber-50 dark:border-amber-400/40 dark:bg-amber-500/10'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
            }`}
          >
            <div className="min-w-0 flex-1 px-2">
              {editing?.id === v.id ? (
                <input
                  type="text"
                  autoFocus
                  value={editing.label}
                  maxLength={120}
                  onChange={(e) => setEditing({ id: v.id, label: e.target.value })}
                  onBlur={saveLabel}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              ) : (
                <button
                  type="button"
                  className="block max-w-full truncate text-left text-sm font-bold text-slate-900 dark:text-white"
                  title="Click to rename"
                  onClick={() => setEditing({ id: v.id, label: v.label })}
                >
                  {v.pinned && <span className="mr-1 text-amber-600 dark:text-amber-300">★</span>}
                  {v.label || (v.auto ? 'Autosaved version' : 'Saved version')}
                </button>
              )}
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {new Date(v.createdAt).toLocaleString()} · {formatRelativeTime(v.createdAt)} ·{' '}
                {formatBytes(v.size)}
              </span>
            </div>
            <button
              type="button"
              className={iconBtn}
              title={v.pinned ? 'Unpin (allow cleanup)' : 'Pin as master (never deleted)'}
              aria-label={v.pinned ? 'Unpin version' : 'Pin version as master'}
              onClick={() => togglePin(v)}
            >
              {v.pinned ? (
                <PinOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Pin className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className={iconBtn}
              title="Open as a new roadmap (keeps the current one)"
              aria-label="Open version as a copy"
              onClick={() => openCopy(v)}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid="version-restore-btn"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
              onClick={() => restore(v)}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restore
            </button>
            <button
              type="button"
              className={iconBtn}
              title="Delete this version"
              aria-label="Delete version"
              onClick={() => remove(v)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
