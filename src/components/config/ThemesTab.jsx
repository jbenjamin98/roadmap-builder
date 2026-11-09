import { Layers, Moon, Palette, Sparkles, Sun } from 'lucide-react';

export default function ThemesTab({ ctx }) {
  const {
    customTheme,
    darkThemes,
    grid3,
    handleAccentChange,
    handleCustomBaseModeChange,
    lightThemes,
    neutralThemes,
    panelTitle,
    renderThemeCard,
    setCustomTheme,
    setThemeId,
    themeId,
  } = ctx;

  return (
    <div className="space-y-5">
      {panelTitle(Palette, 'text-fuchsia-600 dark:text-fuchsia-400', 'Canvas Themes')}

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark Mode Canvas Themes</span>
        </div>
        <div className={grid3}>{darkThemes.map(renderThemeCard)}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light Mode Canvas Themes</span>
        </div>
        <div className={grid3}>{lightThemes.map(renderThemeCard)}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Simple & Neutral Canvas Themes</span>
        </div>
        <div className={grid3}>{neutralThemes.map(renderThemeCard)}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
          <span>Custom Theme</span>
        </div>
        <div
          onClick={() => setThemeId('custom')}
          data-testid="theme-custom-btn"
          className={`p-4 rounded-2xl border transition-all space-y-3.5 cursor-pointer ${
            themeId === 'custom'
              ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Custom Palette</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Pick a dark or light base, then your own colors
              </div>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {[
                ['dark', 'Dark Base', Moon, 'bg-slate-900 text-white dark:bg-indigo-600'],
                ['light', 'Light Base', Sun, 'bg-amber-500 text-white'],
              ].map(([mode, label, Icon, on]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCustomBaseModeChange(mode);
                  }}
                  data-testid={`custom-base-${mode}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    (mode === 'light') === (customTheme.baseMode === 'light')
                      ? on
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="h-2 w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accents[0]}, ${customTheme.accents[1]}, ${customTheme.accents[2]}, ${customTheme.accents[3]})`,
            }}
          />

          <div
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              {
                key: 'primary',
                label: 'Primary',
                value: customTheme.primary,
                set: (v) => {
                  setThemeId('custom');
                  setCustomTheme((p) => ({ ...p, primary: v }));
                },
              },
              {
                key: 'secondary',
                label: 'Canvas Bg',
                value: customTheme.secondary,
                set: (v) => {
                  setThemeId('custom');
                  setCustomTheme((p) => ({ ...p, secondary: v }));
                },
              },
              ...customTheme.accents.map((acc, idx) => ({
                key: `acc-${idx}`,
                label: `Accent ${idx + 1}`,
                value: acc,
                set: (v) => handleAccentChange(idx, v),
              })),
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {f.label}
                </label>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <input
                    type="color"
                    aria-label={`${f.label} color`}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[10px] font-mono">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
