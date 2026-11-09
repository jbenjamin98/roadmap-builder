import { FileCode } from 'lucide-react';

export default function LocalFileSection({
  localFileHandle,
  isLocalSaving,
  onLinkLocalFile,
  onSyncLocalFile,
  onUnlinkLocalFile,
}) {
  return (
    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Local File</span>
        </div>
        {localFileHandle && (
          <button
            type="button"
            onClick={onUnlinkLocalFile}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-400"
          >
            Unlink
          </button>
        )}
      </div>

      {localFileHandle ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
            {localFileHandle.name}
          </span>
          <button
            type="button"
            disabled={isLocalSaving}
            onClick={onSyncLocalFile}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isLocalSaving}
          onClick={onLinkLocalFile}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors"
        >
          Link &amp; Save to File
        </button>
      )}
    </div>
  );
}
