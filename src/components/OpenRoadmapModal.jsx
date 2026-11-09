import { Cloud, HardDrive } from 'lucide-react';
import Modal from './ui/Modal';

const optionClass =
  'group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-indigo-400 dark:hover:bg-slate-800';

/** Landing "Open Roadmap" chooser: a file from this computer, or one saved in Google Drive. */
export default function OpenRoadmapModal({ onClose, onChooseUpload, onChooseDrive }) {
  return (
    <Modal
      testId="open-roadmap-modal"
      title="Open a roadmap"
      description="Pick where your roadmap is saved. You can also drop a .json file anywhere on the page."
      onClose={onClose}
      widthClass="max-w-md"
    >
      <div className="space-y-3">
        <button
          type="button"
          data-testid="open-upload-option"
          data-autofocus=""
          onClick={onChooseUpload}
          className={optionClass}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <HardDrive className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">
              Upload from this computer
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Choose a roadmap .json file
            </span>
          </span>
        </button>
        <button
          type="button"
          data-testid="open-drive-option"
          onClick={onChooseDrive}
          className={optionClass}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
            <Cloud className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">
              Open from Google Drive
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Roadmaps this app saved to your Drive
            </span>
          </span>
        </button>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
