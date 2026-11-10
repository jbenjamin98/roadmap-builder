import { getThemeLegendPresets, solidLegendGradient } from '../../constants/legendPresets';

const FALLBACK_ACCENTS = ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'];

/**
 * Style picker for a legend category: preset styles, theme swatches, a custom color, striped
 * pattern and border. Used both when creating and when editing a category, so the two always
 * offer the same choices. `style` is anything with { color, gradient, isStriped, hasBorder,
 * borderColor }; `onChange` receives a partial patch.
 */
export default function LegendStylePicker({ style, onChange, theme, stripedTestId }) {
  const presets = getThemeLegendPresets(theme);
  const swatches = [theme?.primary || '#6366f1', ...(theme?.accents || FALLBACK_ACCENTS)];
  const usingPreset = presets.some((p) => p.gradient === style.gradient);
  const pickColor = (color) => onChange({ color, gradient: solidLegendGradient(color) });

  return (
    <div className="space-y-2.5 text-xs">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Preset styles
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange({ color: preset.color, gradient: preset.gradient })}
              className={`w-6 h-6 rounded-lg border transition-transform ${
                style.gradient === preset.gradient
                  ? 'scale-110 ring-2 ring-indigo-400 border-white'
                  : 'border-white/20 hover:scale-105'
              }`}
              style={{ background: preset.gradient }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Swatches
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {swatches.map((swatch, idx) => (
            <button
              key={`${swatch}-${idx}`}
              type="button"
              onClick={() => pickColor(swatch)}
              className={`w-5 h-5 rounded-full border transition-transform ${
                !usingPreset && style.color === swatch
                  ? 'scale-125 ring-2 ring-indigo-400 border-white'
                  : 'border-slate-300 dark:border-white/20 hover:scale-110'
              }`}
              style={{ backgroundColor: swatch }}
              title={`Use theme color ${swatch}`}
            />
          ))}

          <label
            className="inline-flex items-center gap-1.5 ml-auto px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300"
            title="Pick a custom color"
          >
            <input
              type="color"
              value={style.color || '#6366f1'}
              onChange={(e) => pickColor(e.target.value)}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
            />
            <span>Custom</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(style.isStriped)}
            onChange={(e) => onChange({ isStriped: e.target.checked })}
            data-testid={stripedTestId}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Striped Pattern</span>
        </label>

        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(style.hasBorder)}
            onChange={(e) => onChange({ hasBorder: e.target.checked })}
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Add Border</span>
        </label>

        {style.hasBorder && (
          <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
            <span>Border Color</span>
            <input
              type="color"
              value={style.borderColor || '#ffffff'}
              onChange={(e) => onChange({ borderColor: e.target.value })}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
            />
          </label>
        )}
      </div>
    </div>
  );
}
