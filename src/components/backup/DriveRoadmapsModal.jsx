import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDownAZ,
  Check,
  Clock,
  Cloud,
  FileJson,
  Loader2,
  Search,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { useDriveBackupContext } from '../../state/driveBackupContext';
import { useRoadmap } from '../../state/roadmapContext';
import { downloadRoadmapJson, formatRelativeTime } from '../../utils/download';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * "Your roadmaps in Google Drive": searchable, sortable and paged, so it keeps working with
 * dozens of roadmaps. Used from the landing page and from the editor's backup menu.
 */
export default function DriveRoadmapsModal({ onClose, onOpened, onBack }) {
  const { auth, link, syncing, connect, listFiles, openFile } = useDriveBackupContext();
  const { roadmapState, hasUnbackedChanges, markBackedUp } = useRoadmap();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState('recent');
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: '', files: [], next: null, error: null });
  const [loadingMore, setLoadingMore] = useState(false);
  const [pending, setPending] = useState(null);
  const [opening, setOpening] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // The result belongs to a (search, sort, reload) key; a different key means "still loading".
  const key = `${debounced}|${sort}|${reloadKey}`;
  const loading = auth.connected && result.key !== key;

  useEffect(() => {
    if (!auth.connected) return undefined;
    let active = true;
    listFiles({ query: debounced, sort })
      .then(({ files, nextPageToken }) => {
        if (active) setResult({ key, files, next: nextPageToken, error: null });
      })
      .catch((err) => {
        if (active) {
          setResult({
            key,
            files: [],
            next: null,
            error: err.message || 'Could not load your Google Drive roadmaps.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [auth.connected, debounced, sort, key, listFiles]);

  const loadMore = async () => {
    if (!result.next || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await listFiles({ query: debounced, sort, pageToken: result.next });
      setResult((r) => ({ ...r, files: [...r.files, ...page.files], next: page.nextPageToken }));
    } catch (err) {
      setResult((r) => ({ ...r, error: err.message || 'Could not load more roadmaps.' }));
    } finally {
      setLoadingMore(false);
    }
  };

  const open = async (file) => {
    setOpening(true);
    const opened = await openFile(file.id);
    setOpening(false);
    setPending(null);
    if (opened) onOpened();
  };

  const choose = (file) => {
    // Opening a different roadmap replaces the one on screen, so protect unsaved work.
    if (hasUnbackedChanges && file.id !== link?.fileId) setPending(file);
    else open(file);
  };

  const title = pending ? 'Replace your current roadmap?' : 'Open from Google Drive';

  return (
    <Modal
      testId="drive-open-modal"
      title={title}
      description={
        pending
          ? `Your current roadmap has changes that are not backed up. Opening “${pending.name.replace(/\.json$/i, '')}” replaces it.`
          : 'Roadmaps this app saved to your Google Drive, from any device.'
      }
      onClose={onClose}
      widthClass="max-w-lg"
    >
      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        {pending ? (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={opening}
              onClick={() => setPending(null)}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={opening}
              onClick={() => open(pending)}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              Replace anyway
            </button>
            <button
              type="button"
              disabled={opening}
              onClick={() => {
                downloadRoadmapJson(roadmapState);
                markBackedUp('download');
                open(pending);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60"
            >
              {opening && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Download current, then open
            </button>
          </div>
        ) : !auth.connected ? (
          <button
            type="button"
            data-testid="drive-open-connect-btn"
            disabled={syncing}
            onClick={() => connect({ backup: false })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-sky-500 hover:to-indigo-500 disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Cloud className="h-4 w-4" aria-hidden="true" />
            )}
            Connect Google Drive
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search your roadmaps</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  data-testid="drive-search-input"
                  data-autofocus=""
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name…"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>
              <div
                role="group"
                aria-label="Sort roadmaps"
                className="flex shrink-0 rounded-xl border border-slate-300 p-0.5 dark:border-slate-700"
              >
                {[
                  ['recent', Clock, 'Recently edited'],
                  ['name', ArrowDownAZ, 'Name A–Z'],
                ].map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={sort === value}
                    onClick={() => setSort(value)}
                    className={`rounded-lg p-1.5 transition-colors ${
                      sort === value
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={listRef}
              data-testid="drive-roadmap-list"
              className="max-h-[min(22rem,48dvh)] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800"
            >
              {loading ? (
                <p className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading your roadmaps…
                </p>
              ) : result.error ? (
                <div className="flex flex-col items-center gap-2 px-3 py-6 text-xs text-rose-500">
                  <p className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {result.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="rounded-lg bg-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Try again
                  </button>
                </div>
              ) : result.files.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  {debounced
                    ? `No roadmaps match “${debounced}”.`
                    : 'No roadmaps saved to this Google account yet.'}
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {result.files.map((file) => {
                    const isCurrent = file.id === link?.fileId;
                    return (
                      <li key={file.id}>
                        <button
                          type="button"
                          data-testid="drive-roadmap-row"
                          disabled={opening}
                          onClick={() => choose(file)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-100 disabled:opacity-60 dark:hover:bg-slate-800/60"
                        >
                          <FileJson
                            className="h-4 w-4 shrink-0 text-indigo-500"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {file.name.replace(/\.json$/i, '')}
                            </span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                              Edited {formatRelativeTime(file.modifiedTime)}
                            </span>
                          </span>
                          {isCurrent && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                              <Check className="h-3 w-3" aria-hidden="true" />
                              Open now
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!loading && result.next && (
                <div className="border-t border-slate-200 p-2 text-center dark:border-slate-800">
                  <button
                    type="button"
                    data-testid="drive-load-more"
                    disabled={loadingMore}
                    onClick={loadMore}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {loadingMore && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    )}
                    Load more
                  </button>
                </div>
              )}
            </div>
            {!loading && !result.error && result.files.length > 0 && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {result.files.length} roadmap{result.files.length === 1 ? '' : 's'} shown
                {result.next ? ' · more available' : ''}
              </p>
            )}
          </>
        )}

        {!pending && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
            {onBack ? (
              <button
                type="button"
                data-testid="drive-back-btn"
                onClick={onBack}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
