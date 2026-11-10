import { Dices, Layers, Moon, Palette, Sparkles, Sun } from 'lucide-react';
import { YellowDuckIcon } from '../parts/DuckParts';
import { AppianNode } from '../parts/AppianParts';
import AppianThemeCards from './AppianThemeCards';

export default function ThemesTab({ ctx }) {
  const {
    customTheme,
    darkThemes,
    design,
    grid3,
    handleAccentChange,
    handleCustomBaseModeChange,
    handleRandomizeDesign,
    handleToggleDuckMode,
    lightThemes,
    neutralThemes,
    panelTitle,
    renderThemeCard,
    setCustomTheme,
    selectTheme,
    themeId,
  } = ctx;

  return (
    <div className="space-y-5">
      {panelTitle(Palette, 'text-fuchsia-600 dark:text-fuchsia-400', 'Canvas Themes')}

      {/* Random Style Dice */}
      <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Roll the Style Dice</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                Randomize
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Generate a surprising new combination of theme, headers, spines, fonts, and bars in
              one click.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRandomizeDesign}
          data-testid="random-style-dice-btn"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>Surprise Me</span>
        </button>
      </div>

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
          onClick={() => selectTheme('custom')}
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
                  selectTheme('custom');
                  setCustomTheme((p) => ({ ...p, primary: v }));
                },
              },
              {
                key: 'secondary',
                label: 'Canvas Bg',
                value: customTheme.secondary,
                set: (v) => {
                  selectTheme('custom');
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

      {/* Appian Brand Themes */}
      <div className="space-y-2" data-testid="appian-themes-section">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <AppianNode height={14} color="#2322F0" />
          <span>Brand Themes - Appian</span>
        </div>
        <AppianThemeCards ctx={ctx} />
      </div>

      {/* Ultimate Duck Mode */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <YellowDuckIcon size={16} />
          <span>Canvas Mode · Ultimate Duck Mode</span>
        </div>
        <div
          data-testid="ultimate-duck-mode-card"
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            design?.duckMode
              ? 'border-amber-500 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 shadow-md shadow-amber-500/10'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl border-2 border-amber-500/60 bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0 shadow-inner">
              <YellowDuckIcon size={30} wake />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Ultimate Duck Mode</span>
                {design?.duckMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Yellow duckling palette, floating duck emblem header, duck egg spine, and
                ripple-accented bars.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleDuckMode}
            data-testid="ultimate-duck-mode-btn"
            className={`shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              design?.duckMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm'
            }`}
          >
            <YellowDuckIcon size={14} />
            <span>{design?.duckMode ? 'Disable Duck Mode' : 'Enable Duck Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
