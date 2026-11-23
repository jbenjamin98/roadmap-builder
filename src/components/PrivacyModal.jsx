import Modal from './ui/Modal';
import { ShieldCheck, HardDrive } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <Modal
      testId="privacy-modal"
      title="Privacy Policy & Data Security"
      onClose={onClose}
      widthClass="max-w-2xl"
    >
      <div className="space-y-6 text-sm text-slate-300">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-400/25">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              100% Client-Side Architecture
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Roadmap Builder is a serverless, client-only application (web and desktop). There is
              no backend server, database, or analytics tracking. All roadmap computations,
              rendering, and export operations occur entirely on your device.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Browser Storage &amp; Local Files</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            In the web version, in-progress roadmap edits are saved temporarily in your
            browser&apos;s local storage (IndexedDB / localStorage) as an unsaved working draft.
            This draft never leaves your device and can be cleared at any time by resetting or
            downloading your roadmap. In the desktop app, roadmaps are saved as plain files in a
            folder you choose on your computer.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <a
              href="./privacy.html"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white underline"
            >
              Privacy Policy
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="./terms.html"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white underline"
            >
              Terms of Service
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
