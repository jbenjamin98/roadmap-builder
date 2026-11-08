import { useState } from 'react';
import {
  X,
  Download,
  FileJson,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  Loader2,
  Star,
} from 'lucide-react';

const FORMATS = [
  {
    id: 'json',
    label: 'JSON',
    icon: FileJson,
    recommended: true,
    desc: 'Everything about the roadmap. Keep this to re-import and update it later.',
  },
  {
    id: 'png',
    label: 'PNG image',
    icon: ImageIcon,
    desc: 'High-resolution picture of the full roadmap, ready for slides and docs.',
  },
  {
    id: 'pdf',
    label: 'PDF',
    icon: FileText,
    desc: 'Vector, single-page PDF. Opens the print dialog; choose "Save as PDF".',
  },
  {
    id: 'excel',
    label: 'Excel (.xlsx)',
    icon: FileSpreadsheet,
    desc: 'Editable spreadsheet: tasks as rows, periods as columns, bars as colored cells.',
  },
];

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  isExporting,
  errors = [],
}) {
  const [selected, setSelected] = useState({
    json: true,
    png: true,
    pdf: false,
    excel: false,
  });

  if (!isOpen) return null;

  const count = Object.values(selected).filter(Boolean).length;
  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/65 dark:bg-slate-950/85 backdrop-blur-md"
      data-testid="export-modal"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Export Roadmap
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Choose everything you want to download
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Close export dialog"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {FORMATS.map((f) => {
            const Icon = f.icon;
            const on = selected[f.id];
            return (
              <label
                key={f.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  on
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  disabled={isExporting}
                  onChange={() => toggle(f.id)}
                  data-testid={`export-option-${f.id}`}
                  className="w-4 h-4 mt-1 rounded border-slate-300 text-indigo-600 shrink-0"
                />
                <Icon className="w-5 h-5 mt-0.5 text-indigo-600 dark:text-indigo-300 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {f.label}
                    </span>
                    {f.recommended && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                        <Star className="w-2.5 h-2.5" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {f.desc}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {errors.length > 0 && (
          <div
            data-testid="export-errors"
            className="mx-5 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-700 dark:text-rose-300 space-y-1"
          >
            <div className="font-bold">Some files could not be created:</div>
            {errors.map((e, i) => (
              <div key={i} className="font-mono break-words">
                {e}
              </div>
            ))}
            <div className="text-rose-600/80 dark:text-rose-300/80">
              The PDF option works in any browser and is a good alternative.
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="export-run-btn"
            disabled={isExporting || count === 0}
            onClick={() => onExport(selected)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isExporting
                ? 'Exporting...'
                : `Download ${count} file${count === 1 ? '' : 's'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

