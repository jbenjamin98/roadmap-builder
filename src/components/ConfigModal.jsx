import { useState } from 'react';
import {
  X,
  Calendar,
  Palette,
  Type,
  Sparkles,
  Check,
  Sliders,
  ArrowRight,
  Grid,
  Rows,
} from 'lucide-react';
import { PERIOD_TYPES, FONT_STYLES, PRESET_THEMES } from '../constants/themes';
import { calculatePeriods } from '../utils/dateUtils';
import { getTodayDateString } from '../data/defaultState';

const FIXED_LENGTH_PERIODS = new Set(['Weeks', 'Months', 'Quarters']);

export default function ConfigModal({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
  isCreatingNew = false,
}) {
  const [name, setName] = useState(
    isCreatingNew ? '' : initialConfig?.name || ''
  );
  const [periodLabel, setPeriodLabel] = useState(
    isCreatingNew ? 'Sprints' : initialConfig?.periodLabel || 'Sprints'
  );
  const [startDate, setStartDate] = useState(
    isCreatingNew ? getTodayDateString() : initialConfig?.startDate || getTodayDateString()
  );
  const [weeksPerPeriod, setWeeksPerPeriod] = useState(
    isCreatingNew ? 2 : Number(initialConfig?.weeksPerPeriod) || 2
  );
  const [totalPeriods, setTotalPeriods] = useState(
    isCreatingNew ? 8 : Number(initialConfig?.totalPeriods) || 8
  );
  const [fontStyle, setFontStyle] = useState(
    isCreatingNew ? 'sans' : initialConfig?.fontStyle || 'sans'
  );
  const [themeId, setThemeId] = useState(
    isCreatingNew ? PRESET_THEMES[0].id : initialConfig?.themeId || PRESET_THEMES[0].id
  );

  const [customTheme, setCustomTheme] = useState({
    primary: initialConfig?.theme?.primary || '#6366f1',
    secondary: initialConfig?.theme?.secondary || '#0f172a',
    accents:
      Array.isArray(initialConfig?.theme?.accents) && initialConfig.theme.accents.length === 4
        ? [...initialConfig.theme.accents]
        : ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
  });

  const [alternateRowHighlighting, setAlternateRowHighlighting] = useState(
    isCreatingNew ? true : initialConfig?.previewSettings?.alternateRowHighlighting ?? true
  );
  const [subtleGridDemarcations, setSubtleGridDemarcations] = useState(
    isCreatingNew ? true : initialConfig?.previewSettings?.subtleGridDemarcations ?? true
  );

  if (!isOpen) return null;

  const isPeriodLengthDisabled = FIXED_LENGTH_PERIODS.has(periodLabel);

  const selectedPreset = PRESET_THEMES.find((t) => t.id === themeId);
  const activeTheme =
    themeId === 'custom'
      ? customTheme
      : {
          primary: selectedPreset?.primary || '#6366f1',
          secondary: selectedPreset?.secondary || '#0f172a',
          accents: selectedPreset?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
        };

  const previewPeriods = calculatePeriods({
    periodLabel,
    startDate,
    weeksPerPeriod,
    totalPeriods,
  });

  const handlePeriodTypeChange = (newLabel) => {
    setPeriodLabel(newLabel);
    const preset = PERIOD_TYPES.find((p) => p.value === newLabel);
    if (preset) {
      setWeeksPerPeriod(preset.defaultWeeks);
    }
  };

  const handleAccentChange = (idx, colorValue) => {
    setCustomTheme((prev) => {
      const nextAccents = [...prev.accents];
      nextAccents[idx] = colorValue;
      return { ...prev, accents: nextAccents };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig({
      name: name.trim() || 'Untitled Roadmap',
      periodLabel,
      startDate,
      weeksPerPeriod: Math.max(1, Math.min(52, Number(weeksPerPeriod) || 2)),
      totalPeriods: Math.max(1, Math.min(36, Number(totalPeriods) || 8)),
      fontStyle,
      themeId,
      theme: activeTheme,
      previewSettings: {
        alternateRowHighlighting,
        subtleGridDemarcations,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        data-testid="config-modal"
      >
        {/* Top Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isCreatingNew ? 'Create New Roadmap' : 'Roadmap Configuration'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure timeline cadence, display options, typography, and theme
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Section 1: Core Timeline Parameters */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
              <span>1. Timeline & Relative Period Cadence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Roadmap Name */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Roadmap Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus={isCreatingNew}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter roadmap name..."
                  data-testid="config-roadmap-name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Period Type Dropdown */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Period Type Name
                </label>
                <select
                  value={periodLabel}
                  onChange={(e) => handlePeriodTypeChange(e.target.value)}
                  data-testid="config-period-type"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {PERIOD_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.value} (Default: {pt.defaultWeeks} {pt.defaultWeeks === 1 ? 'wk' : 'wks'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  data-testid="config-start-date"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Weeks per Period */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Weeks per Period{' '}
                  {isPeriodLengthDisabled && (
                    <span className="text-[10px] font-normal text-slate-400">
                      (Fixed for {periodLabel})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  required
                  disabled={isPeriodLengthDisabled}
                  value={weeksPerPeriod}
                  onChange={(e) => setWeeksPerPeriod(e.target.value)}
                  data-testid="config-weeks-per-period"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isPeriodLengthDisabled
                      ? 'bg-slate-200/70 dark:bg-slate-900/60 border-slate-300/70 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Total Number of Periods */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Number of Periods
                </label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  required
                  value={totalPeriods}
                  onChange={(e) => setTotalPeriods(e.target.value)}
                  data-testid="config-total-periods"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Live Date Math Preview Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                  Calculated Horizon:
                </span>{' '}
                {previewPeriods.length} {periodLabel} (
                {Number(weeksPerPeriod) * previewPeriods.length} weeks total)
              </div>
              {previewPeriods.length > 0 && (
                <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                  {previewPeriods[0].title}: {previewPeriods[0].dateRange} →{' '}
                  {previewPeriods[previewPeriods.length - 1].title}:{' '}
                  {previewPeriods[previewPeriods.length - 1].dateRange}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Grid & Row Display Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Grid className="w-4 h-4" />
              <span>2. Canvas Grid & Row Display</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Rows className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Alternate Row Highlighting
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Subtle contrast striping on every other task row
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alternateRowHighlighting}
                  onChange={(e) => setAlternateRowHighlighting(e.target.checked)}
                  data-testid="config-alt-rows-checkbox"
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Grid Lines
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Show period column and section divider lines
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={subtleGridDemarcations}
                  onChange={(e) => setSubtleGridDemarcations(e.target.checked)}
                  data-testid="config-grid-lines-checkbox"
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Theme Selection (6 Glassmorphism + Gradient Patterns + 1 Custom) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
                <Palette className="w-4 h-4" />
                <span>3. Canvas Theme Selection (6 Presets + Custom)</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Primary + Secondary + 4 Accent Swatches
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {PRESET_THEMES.map((preset) => {
                const isSelected = themeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemeId(preset.id)}
                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/50 dark:bg-slate-800/90'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/70'
                    }`}
                  >
                    <div
                      className="h-2 w-full rounded-full mb-3"
                      style={{
                        background: `linear-gradient(90deg, ${preset.primary}, ${preset.accents[0]}, ${preset.accents[1]}, ${preset.accents[2]})`,
                      }}
                    />
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-400/40 dark:border-white/30"
                        style={{ backgroundColor: preset.primary }}
                        title={`Primary: ${preset.primary}`}
                      />
                      <span
                        className="w-4 h-4 rounded-full border border-slate-400/40 dark:border-white/30"
                        style={{ backgroundColor: preset.secondary }}
                        title={`Secondary: ${preset.secondary}`}
                      />
                      <span className="text-slate-400 dark:text-slate-600 text-xs mx-0.5">|</span>
                      {preset.accents.map((acc, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-slate-400/30 dark:border-white/20"
                          style={{ backgroundColor: acc }}
                          title={`Accent ${i + 1}: ${acc}`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}

              {/* 7th Option: Custom Theme */}
              <button
                type="button"
                onClick={() => setThemeId('custom')}
                data-testid="theme-custom-btn"
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  themeId === 'custom'
                    ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/30 bg-fuchsia-50/40 dark:bg-slate-800/90'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/70'
                }`}
              >
                <div
                  className="h-2 w-full rounded-full mb-3"
                  style={{
                    background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accents[0]}, ${customTheme.accents[1]}, ${customTheme.accents[2]}, ${customTheme.accents[3]})`,
                  }}
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 dark:text-fuchsia-400" />
                    Custom Palette
                  </span>
                  {themeId === 'custom' && (
                    <span className="w-5 h-5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Define your own Primary, Secondary, and 4 custom Accent colors
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-400/40 dark:border-white/30"
                    style={{ backgroundColor: customTheme.primary }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-slate-400/40 dark:border-white/30"
                    style={{ backgroundColor: customTheme.secondary }}
                  />
                  <span className="text-slate-400 dark:text-slate-600 text-xs mx-0.5">|</span>
                  {customTheme.accents.map((acc, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-slate-400/30 dark:border-white/20"
                      style={{ backgroundColor: acc }}
                    />
                  ))}
                </div>
              </button>
            </div>

            {/* Custom Color Pickers when "Custom" is active */}
            {themeId === 'custom' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-fuchsia-500/30 grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Primary
                  </label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) =>
                        setCustomTheme((prev) => ({ ...prev, primary: e.target.value }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {customTheme.primary}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Secondary
                  </label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={customTheme.secondary}
                      onChange={(e) =>
                        setCustomTheme((prev) => ({ ...prev, secondary: e.target.value }))
                      }
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                      {customTheme.secondary}
                    </span>
                  </div>
                </div>

                {customTheme.accents.map((accentColor, idx) => (
                  <div key={idx}>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Accent {idx + 1}
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => handleAccentChange(idx, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                        {accentColor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Font Style Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <Type className="w-4 h-4" />
              <span>4. Typography & Font Style</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {FONT_STYLES.map((font) => {
                const active = fontStyle === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setFontStyle(font.id)}
                    style={{ fontFamily: font.fontFamily }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      active
                        ? 'border-teal-500 bg-teal-500/10 text-slate-900 dark:text-white ring-1 ring-teal-400/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                      {font.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {font.sample}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-config-btn"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>{isCreatingNew ? 'Create Roadmap' : 'Apply Configuration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
