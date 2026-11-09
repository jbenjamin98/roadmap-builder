import { CONDENSED_MODES } from '../../constants/designOptions';
import { Minimize2 } from 'lucide-react';

export default function CondensedTab({ ctx }) {
  const { design, panelTitle, toggleCondensedMode, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {panelTitle(Minimize2, 'text-indigo-600 dark:text-indigo-400', 'Condensed View')}
        {design.condensedModes.length > 0 && (
          <button
            type="button"
            onClick={() => updateDesign({ condensedModes: [] })}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Combine any modes you like.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CONDENSED_MODES.map((mode) => {
          const on = design.condensedModes.includes(mode.id);
          return (
            <label
              key={mode.id}
              data-testid={`condensed-mode-${mode.id}`}
              className={`flex items-start justify-between gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                on
                  ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{mode.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {mode.desc}
                </div>
              </div>
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggleCondensedMode(mode.id)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 shrink-0"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
