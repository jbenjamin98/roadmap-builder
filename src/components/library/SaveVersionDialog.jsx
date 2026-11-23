import { useState } from 'react';
import Modal from '../ui/Modal';

/** Names a version and optionally pins it as a "master" that is never pruned. */
export default function SaveVersionDialog({ onSave, onClose }) {
  const [label, setLabel] = useState('');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ label, pinned });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      testId="save-version-dialog"
      title="Save a version"
      description="Snapshot this roadmap so you can come back to it later. Autosave keeps the file itself up to date."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Name (optional)
          <input
            type="text"
            data-autofocus=""
            data-testid="save-version-label"
            value={label}
            maxLength={120}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Q3 master, sent to leadership"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <strong>Pin as a master version.</strong> Pinned versions are never deleted by automatic
            cleanup.
          </span>
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            data-testid="save-version-submit"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            Save version
          </button>
        </div>
      </form>
    </Modal>
  );
}
