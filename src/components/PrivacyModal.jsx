import Modal from './ui/Modal';
import { ShieldCheck, Lock, HardDrive, KeyRound } from 'lucide-react';

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
              Roadmap Builder is a serverless, client-only web application. There is no backend
              server, database, or analytics tracking. All roadmap computations, rendering, and
              export operations occur entirely inside your browser.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Google Drive & User Data Usage</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Roadmap Builder offers optional integration with Google Drive to securely store your
            roadmaps in your personal Google Drive account.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 pl-1">
            <li>
              <strong className="text-slate-100">Minimal Scope:</strong> We use the restricted{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px]">
                https://www.googleapis.com/auth/drive.file
              </code>{' '}
              permission. This only grants access to files created or explicitly opened with Roadmap
              Builder. We cannot read, modify, or view any of your other Drive files.
            </li>
            <li>
              <strong className="text-slate-100">No Intermediary Servers:</strong> Communication
              with Google APIs is direct from your web browser via encrypted HTTPS (
              <code className="text-slate-200 font-mono">www.googleapis.com</code>). Your access
              tokens and roadmaps are never transmitted to any proxy, server, or third party.
            </li>
            <li>
              <strong className="text-slate-100">Revocation & Control:</strong> You can disconnect
              Google Drive anytime from the backup menu, or revoke access entirely via your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Google Account Permissions
              </a>
              .
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Browser Storage (Local Drafts)</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            In-progress roadmap edits are saved temporarily in your browser&apos;s local storage
            (IndexedDB / localStorage) as an unsaved working draft. This draft never leaves your
            device and can be cleared at any time by resetting or downloading your roadmap.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <KeyRound className="w-4 h-4 text-sky-400" />
            <span>Compliance with Google API Services User Data Policy</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Roadmap Builder&apos;s use and transfer to any other app of information received from
            Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <a
              href="/privacy.html"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white underline"
            >
              Privacy Policy
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="/terms.html"
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
