import { Download, HardDrive, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';

/** One-time explainer: browser autosave is a temporary draft, not a backup. */
export default function DraftNoticeDialog({ onDownload, onContinue }) {
  return (
    <Modal
      title="Your work is saved as a temporary draft"
      description="Roadmap Builder has no server. Everything stays on your computer."
      onClose={onContinue}
      testId="draft-notice"
      widthClass="max-w-lg"
    >
      <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <li className="flex gap-3">
          <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <span>
            Your browser keeps a draft so a refresh does not lose your place. It{' '}
            <strong>only lives in this browser</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
          <span>
            Clearing site data, a full disk, private windows, or using another browser or computer
            will <strong>erase or hide it</strong>.
          </span>
        </li>
        <li className="flex gap-3">
          <Download className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
          <span>
            Download a <strong>backup file</strong> to keep your roadmap safe. The status chip in
            the top bar always shows whether your latest changes are backed up.
          </span>
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onContinue}
          data-testid="draft-notice-continue"
          className="rounded-xl bg-slate-200/80 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Continue with draft only
        </button>
        <button
          type="button"
          data-autofocus=""
          data-testid="draft-notice-download"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download a backup file
        </button>
      </div>
    </Modal>
  );
}
