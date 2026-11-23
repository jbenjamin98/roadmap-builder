import { useEffect, useState } from 'react';
import { Copy, FileUp, FolderOpen, FolderSearch, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { desktop } from '../../storage/desktop';
import { formatRelativeTime } from '../../utils/download';
import { showToast } from '../../utils/toast';

const iconBtn =
  'rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white';

/** Desktop only: the roadmaps stored as files in the library folder. */
export default function LibraryModal({ onClose, onOpen, onImportFile, currentId }) {
  const [folder, setFolder] = useState('');
  const [items, setItems] = useState(null);
  const [unreadable, setUnreadable] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = () => setReloadKey((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    Promise.all([desktop.library.getPath(), desktop.library.list()])
      .then(([path, listing]) => {
        if (cancelled) return;
        setFolder(path);
        setItems(listing.items);
        setUnreadable(listing.unreadable);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        showToast({ message: `Could not read the library: ${err?.message || err}`, tone: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const run = async (action, failure) => {
    try {
      await action();
      refresh();
    } catch (err) {
      showToast({ message: `${failure}: ${err?.message || err}`, tone: 'error' });
    }
  };

  return (
    <Modal
      testId="library-modal"
      title="Roadmap library"
      description={folder ? `Saved in ${folder}` : 'Your roadmaps saved on this computer.'}
      onClose={onClose}
      widthClass="max-w-2xl"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run(() => desktop.library.chooseFolder(), 'Could not change folder')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <FolderSearch className="h-3.5 w-3.5" aria-hidden="true" />
          Change folder…
        </button>
        <button
          type="button"
          onClick={() => desktop.library.openFolder()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Show in file explorer
        </button>
        <button
          type="button"
          onClick={onImportFile}
          data-testid="library-import-btn"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
          Import a file…
        </button>
      </div>

      {items === null && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
      {items?.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500" data-testid="library-empty">
          No roadmaps in this folder yet. Create one and it will be saved here automatically.
        </p>
      )}

      <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1" data-testid="library-list">
        {items?.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60"
          >
            <button
              type="button"
              data-testid="library-open-item"
              onClick={() => onOpen(item.id)}
              className="min-w-0 flex-1 rounded-xl px-2 py-1 text-left hover:bg-indigo-50 dark:hover:bg-slate-800"
            >
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                {item.name}
                {item.id === currentId && (
                  <span className="ml-2 text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-300">
                    open now
                  </span>
                )}
              </span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {item.file} · edited {formatRelativeTime(item.updatedAt)}
              </span>
            </button>
            <button
              type="button"
              className={iconBtn}
              title="Duplicate"
              aria-label={`Duplicate ${item.name}`}
              onClick={() => run(() => desktop.library.duplicate(item.id), 'Could not duplicate')}
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={iconBtn}
              title="Show file"
              aria-label={`Show ${item.name} in file explorer`}
              onClick={() => desktop.library.reveal(item.id)}
            >
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={iconBtn}
              title={item.id === currentId ? 'Open roadmaps cannot be deleted' : 'Move to trash'}
              aria-label={`Delete ${item.name}`}
              disabled={item.id === currentId}
              onClick={() => setPendingDelete(item)}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {unreadable.length > 0 && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
          Skipped {unreadable.length} file{unreadable.length === 1 ? '' : 's'} that could not be
          read: {unreadable.join(', ')}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Close
        </button>
      </div>

      {pendingDelete && (
        <ConfirmDialog
          testId="library-delete-confirm"
          title={`Move "${pendingDelete.name}" to the trash?`}
          description="The file goes to your system trash, so you can still recover it from there. Its version history is kept."
          onCancel={() => setPendingDelete(null)}
          actions={[
            { label: 'Cancel', onClick: () => setPendingDelete(null) },
            {
              label: 'Move to trash',
              variant: 'danger',
              onClick: () => {
                const { id } = pendingDelete;
                setPendingDelete(null);
                run(() => desktop.library.remove(id), 'Could not delete');
              },
            },
          ]}
        />
      )}
    </Modal>
  );
}
