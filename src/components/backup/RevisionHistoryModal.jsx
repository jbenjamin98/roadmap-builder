import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { RotateCcw, Loader2, AlertCircle, RefreshCw, Check, Pin } from 'lucide-react';
import { listRevisions, restoreDriveRevision, setRevisionPinned } from '../../utils/googleDrive';
import { formatRelativeTime, formatBytes } from '../../utils/download';

export default function RevisionHistoryModal({ isOpen, onClose, fileId, onRestore }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [error, setError] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [confirmRevId, setConfirmRevId] = useState(null);
  const [pinningId, setPinningId] = useState(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !fileId) return undefined;
    let active = true;

    listRevisions(fileId)
      .then((revs) => {
        if (!active) return;
        const sorted = [...revs].sort((a, b) => {
          const tA = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
          const tB = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
          return tB - tA;
        });
        setRevisions(sorted);
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load revisions.');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, fileId, reloadKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  };

  const handleRestore = async (revId) => {
    try {
      setRestoringId(revId);
      const data = await restoreDriveRevision(fileId, revId);
      onRestore(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to restore revision.');
    } finally {
      setRestoringId(null);
      setConfirmRevId(null);
    }
  };

  const handleTogglePin = async (rev) => {
    try {
      setPinningId(rev.id);
      const next = !rev.keepForever;
      await setRevisionPinned(fileId, rev.id, next);
      setRevisions((list) => list.map((r) => (r.id === rev.id ? { ...r, keepForever: next } : r)));
    } catch (err) {
      setError(err.message || 'Could not change that version.');
    } finally {
      setPinningId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      testId="revision-history-modal"
      title="Google Drive Revision History"
      onClose={onClose}
      widthClass="max-w-xl"
    >
      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drive keeps a new version each time you back up, but only for a limited time (about 30
            days). Pin the ones you want to keep.
          </p>
          <button
            type="button"
            disabled={refreshing || loading}
            onClick={handleRefresh}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm transition-colors disabled:opacity-50"
            title="Refresh revisions list from Google Drive"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-indigo-500 dark:text-indigo-400 gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Loading revisions from Drive...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        ) : revisions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            No revisions found for this file.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto overflow-x-hidden divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            {revisions.map((rev, index) => {
              const isCurrent = index === 0;
              const dateObj = rev.modifiedTime ? new Date(rev.modifiedTime) : null;
              const dateDisplay =
                dateObj && !Number.isNaN(dateObj.getTime())
                  ? dateObj.toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'Saved version';
              const shortId = rev.id && rev.id.length > 14 ? `${rev.id.slice(0, 10)}…` : rev.id;

              return (
                <div
                  key={rev.id}
                  className="flex items-center justify-between gap-3 p-3.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {dateDisplay}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>Current Head</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        ({formatRelativeTime(rev.modifiedTime)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <span title={`Google Drive revision ID: ${rev.id}`}>Revision #{shortId}</span>
                      {rev.lastModifyingUser?.displayName ? (
                        <>
                          <span>•</span>
                          <span className="truncate">{rev.lastModifyingUser.displayName}</span>
                        </>
                      ) : null}
                      {rev.size ? (
                        <>
                          <span>•</span>
                          <span>{formatBytes(rev.size)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={pinningId === rev.id}
                      onClick={() => handleTogglePin(rev)}
                      aria-pressed={Boolean(rev.keepForever)}
                      title={
                        rev.keepForever
                          ? 'Pinned: Google Drive will keep this version. Click to unpin.'
                          : 'Pin this version so Google Drive never deletes it'
                      }
                      className={`rounded-lg p-1.5 transition-colors disabled:opacity-50 ${
                        rev.keepForever
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                          : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {pinningId === rev.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Pin className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span className="sr-only">{rev.keepForever ? 'Unpin' : 'Pin'} version</span>
                    </button>
                    {isCurrent ? (
                      <span className="px-2.5 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none">
                        Active
                      </span>
                    ) : confirmRevId === rev.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={restoringId === rev.id}
                          onClick={() => handleRestore(rev.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors disabled:opacity-50"
                        >
                          {restoringId === rev.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          disabled={restoringId === rev.id}
                          onClick={() => setConfirmRevId(null)}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={restoringId !== null}
                        onClick={() => setConfirmRevId(rev.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-sm transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Restore</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
