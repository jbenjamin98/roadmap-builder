import { useEffect, useMemo, useState } from 'react';
import { Copy, FileUp, FolderOpen, FolderSearch, Search, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { desktop } from '../../storage/desktop';
import { formatRelativeTime } from '../../utils/download';
import { showToast } from '../../utils/toast';

const toolBtn =
  'inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700';
const iconBtn =
  'rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white';

const SORTS = {
  recent: { label: 'Recently edited', compare: (a, b) => b.updatedAt - a.updatedAt },
  name: { label: 'Name (A to Z)', compare: (a, b) => a.name.localeCompare(b.name) },
};

/** Accent strip built from the roadmap's own theme colours. */
const stripStyle = (colors) => ({
  background:
    colors?.length > 1
      ? `linear-gradient(90deg, ${colors.join(', ')})`
      : colors?.[0] || 'linear-gradient(90deg, #6366f1, #c026d3)',
});

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Desktop only: a grid of the roadmaps stored as files in the library folder. */
export default function LibraryModal({ onClose, onOpen, onImportFile, currentId }) {
  const [folder, setFolder] = useState('');
  const [items, setItems] = useState(null);
  const [unreadable, setUnreadable] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');

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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items || [])
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.file.toLowerCase().includes(q))
      .sort(SORTS[sort].compare);
  }, [items, query, sort]);

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
      title="Your roadmaps"
      description={folder ? `Saved in ${folder}` : 'Roadmaps saved on this computer.'}
      onClose={onClose}
      widthClass="max-w-4xl"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[12rem] flex-1">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            data-testid="library-search"
            data-autofocus=""
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roadmaps"
            aria-label="Search roadmaps"
            className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          data-testid="library-sort"
          aria-label="Sort roadmaps"
          className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          {Object.entries(SORTS).map(([id, s]) => (
            <option key={id} value={id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => run(() => desktop.library.chooseFolder(), 'Could not change folder')}
          className={toolBtn}
        >
          <FolderSearch className="h-3.5 w-3.5" aria-hidden="true" />
          Change folder…
        </button>
        <button type="button" onClick={() => desktop.library.openFolder()} className={toolBtn}>
          <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Show folder
        </button>
        <button
          type="button"
          onClick={onImportFile}
          data-testid="library-import-btn"
          className={toolBtn}
        >
          <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
          Import a file…
        </button>
      </div>

      {items === null && <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}
      {items?.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500" data-testid="library-empty">
          No roadmaps in this folder yet. Create one and it will be saved here automatically.
        </p>
      )}
      {items?.length > 0 && visible.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500" data-testid="library-no-match">
          No roadmaps match “{query}”.
        </p>
      )}

      <ul
        className="grid max-h-[55vh] grid-cols-1 gap-3 overflow-y-auto p-1 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="library-list"
      >
        {visible.map((item) => {
          const isOpen = item.id === currentId;
          return (
            <li
              key={item.id}
              data-testid="library-card"
              className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-slate-50 transition-shadow hover:shadow-lg dark:bg-slate-800/60 ${
                isOpen
                  ? 'border-emerald-400/70'
                  : 'border-slate-200 hover:border-indigo-400 dark:border-slate-700'
              }`}
            >
              <div className="h-2 w-full" style={stripStyle(item.colors)} aria-hidden="true" />
              <button
                type="button"
                data-testid="library-open-item"
                onClick={() => onOpen(item.id)}
                aria-label={`Open ${item.name}`}
                className="flex-1 px-3.5 pb-2 pt-3 text-left"
              >
                <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                  Edited {formatRelativeTime(item.updatedAt)}
                  {isOpen && (
                    <span className="ml-2 font-semibold uppercase text-emerald-600 dark:text-emerald-300">
                      open now
                    </span>
                  )}
                </span>
                <span className="mt-2.5 block text-xs text-slate-600 dark:text-slate-300">
                  {plural(item.sections, 'section')} · {plural(item.items, 'item')}
                  {item.periods > 0 && ` · ${item.periods} ${item.periodLabel || 'periods'}`}
                </span>
                <span className="mt-1 block truncate font-mono text-[10px] text-slate-400">
                  {item.file}
                </span>
              </button>
              <div className="flex justify-end gap-0.5 border-t border-slate-200 px-2 py-1 dark:border-slate-700">
                <button
                  type="button"
                  className={iconBtn}
                  title="Duplicate"
                  aria-label={`Duplicate ${item.name}`}
                  onClick={() =>
                    run(() => desktop.library.duplicate(item.id), 'Could not duplicate')
                  }
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
                  title={isOpen ? 'Open roadmaps cannot be deleted' : 'Move to trash'}
                  aria-label={`Delete ${item.name}`}
                  disabled={isOpen}
                  onClick={() => setPendingDelete(item)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
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
