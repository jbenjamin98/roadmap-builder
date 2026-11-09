import { ArrowRight, Eye, Sliders, X } from 'lucide-react';
import ConfigPreview from './ConfigPreview';
import { PERIOD_TYPES, PRESET_THEMES } from '../constants/themes';
import {
  DUCK_THEME_PALETTE,
  applyEffectToggle,
  getDuckModeDesign,
  getRandomDesignConfig,
  normalizeDesign,
} from '../constants/designOptions';
import { calculatePeriods } from '../utils/dateUtils';
import { getCanvasTokens } from './canvasStyles';
import { getTodayDateString } from '../data/defaultState';
import { resolveMilestoneDesign } from './styleHelpers';
import { useEffect, useRef, useState } from 'react';
import { publishCursorTheme } from '../utils/cursorTheme';
import useDialogBehavior from '../hooks/useDialogBehavior';
import { SectionTitle } from './config/primitives';
import { YellowDuckIcon } from './parts/DuckParts';
import { FIXED_LENGTH_PERIODS, NAV_GROUPS, inputCls } from './config/navConfig';
import { createSwatches } from './config/swatches';
import TimelineTab from './config/TimelineTab';
import BannerTab from './config/BannerTab';
import ThemesTab from './config/ThemesTab';
import FontsTab from './config/FontsTab';
import EffectsTab from './config/EffectsTab';
import HeaderTab from './config/HeaderTab';
import PeriodTab from './config/PeriodTab';
import SectionTab from './config/SectionTab';
import SubsectionTab from './config/SubsectionTab';
import TaskTab from './config/TaskTab';
import NumberingTab from './config/NumberingTab';
import BarsTab from './config/BarsTab';
import MilestonesTab from './config/MilestonesTab';
import LegendTab from './config/LegendTab';
import CondensedTab from './config/CondensedTab';
import GridTab from './config/GridTab';

export default function ConfigModal({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
  isCreatingNew = false,
}) {
  const [activeTab, setActiveTab] = useState('timeline');
  const panelRef = useRef(null);
  useDialogBehavior(panelRef, onClose, isOpen);

  const [name, setName] = useState(isCreatingNew ? '' : initialConfig?.name || '');
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
    baseMode: initialConfig?.theme?.baseMode || 'dark',
    primary: initialConfig?.theme?.primary || '#6366f1',
    secondary: initialConfig?.theme?.secondary || '#0f172a',
    accents:
      Array.isArray(initialConfig?.theme?.accents) && initialConfig.theme.accents.length === 4
        ? [...initialConfig.theme.accents]
        : ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
  });

  const [alternateRowHighlighting, setAlternateRowHighlighting] = useState(
    isCreatingNew ? true : (initialConfig?.previewSettings?.alternateRowHighlighting ?? true)
  );
  const [subtleGridDemarcations, setSubtleGridDemarcations] = useState(
    isCreatingNew ? true : (initialConfig?.previewSettings?.subtleGridDemarcations ?? true)
  );

  const [design, setDesign] = useState(() =>
    normalizeDesign(isCreatingNew ? null : initialConfig?.design)
  );

  const isPeriodLengthDisabled = FIXED_LENGTH_PERIODS.has(periodLabel);

  const selectedPreset = PRESET_THEMES.find((t) => t.id === themeId);
  const activeTheme =
    themeId === 'custom'
      ? customTheme
      : {
        baseMode: selectedPreset?.isLight ? 'light' : 'dark',
        primary: selectedPreset?.primary || '#6366f1',
        secondary: selectedPreset?.secondary || '#0f172a',
        accents: selectedPreset?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
      };

  // Preview the draft canvas theme on the custom cursor while this modal is open.
  useEffect(() => {
    publishCursorTheme(isOpen ? activeTheme : null);
  }, [isOpen, activeTheme.primary, activeTheme.accents?.[0], activeTheme.baseMode]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => publishCursorTheme(null), []);

  if (!isOpen) return null;

  const draftConfig = {
    name: name.trim() || 'Untitled Roadmap',
    periodLabel,
    startDate,
    weeksPerPeriod: Math.max(1, Math.min(52, Number(weeksPerPeriod) || 2)),
    totalPeriods: Math.max(1, Math.min(36, Number(totalPeriods) || 8)),
    fontStyle,
    themeId,
    theme: activeTheme,
    previewSettings: { alternateRowHighlighting, subtleGridDemarcations },
    design,
  };

  const previewPeriods = calculatePeriods(draftConfig);
  const samplePeriod = previewPeriods[0];
  // Swatches should not inherit "flat" / "neo-brutalist" - those only apply to the roadmap.
  const swatchEffects = { ...design.effects, flat: false, brutalist: false };
  const swatchDesign = { ...design, effects: swatchEffects };
  const tokens = getCanvasTokens({ ...draftConfig, design: swatchDesign });
  const numbering = design.numbering;
  // Milestone 'auto' fill/border follow the canvas theme.
  const resolvedMilestone = resolveMilestoneDesign(design.milestone, tokens);
  const accent = activeTheme.primary;
  const sampleCategory = {
    id: 'sw',
    label: 'Task',
    color: accent,
    gradient: `linear-gradient(135deg, ${accent} 0%, ${accent}bb 100%)`,
    hasBorder: false,
    borderColor: '#ffffff',
    isStriped: false,
  };

  const updateDesign = (patch) => setDesign((prev) => ({ ...prev, ...patch }));
  const updateMilestone = (patch) =>
    setDesign((prev) => ({
      ...prev,
      milestone: { ...prev.milestone, ...patch },
    }));
  const toggleEffect = (id, checked) =>
    setDesign((prev) => ({
      ...prev,
      effects: applyEffectToggle(prev.effects, id, checked),
    }));
  const updateLegend = (patch) =>
    setDesign((prev) => ({ ...prev, legend: { ...prev.legend, ...patch } }));
  const updateBanner = (patch) =>
    setDesign((prev) => ({ ...prev, banner: { ...prev.banner, ...patch } }));

  const toggleCondensedMode = (id) =>
    setDesign((prev) => {
      const has = prev.condensedModes.includes(id);
      return {
        ...prev,
        condensedModes: has
          ? prev.condensedModes.filter((m) => m !== id)
          : [...prev.condensedModes, id],
      };
    });

  const handlePeriodTypeChange = (newLabel) => {
    setPeriodLabel(newLabel);
    const preset = PERIOD_TYPES.find((p) => p.value === newLabel);
    if (preset) setWeeksPerPeriod(preset.defaultWeeks);
  };

  const handleAccentChange = (idx, colorValue) => {
    setThemeId('custom');
    setCustomTheme((prev) => {
      const nextAccents = [...prev.accents];
      nextAccents[idx] = colorValue;
      return { ...prev, accents: nextAccents };
    });
  };

  const handleCustomBaseModeChange = (mode) => {
    setThemeId('custom');
    setCustomTheme((prev) => ({
      ...prev,
      baseMode: mode,
      secondary:
        mode === 'light' && prev.secondary === '#0f172a'
          ? '#f8fafc'
          : mode === 'dark' && prev.secondary === '#f8fafc'
            ? '#0f172a'
            : prev.secondary,
    }));
  };

  const handleRandomizeDesign = () => {
    const randomized = getRandomDesignConfig();
    setThemeId(randomized.themeId);
    setFontStyle(randomized.fontStyle);
    setDesign((prev) => ({
      ...prev,
      duckMode: false,
      headerStyle: randomized.headerStyle,
      periodHeaderStyle: randomized.periodHeaderStyle,
      sectionStyle: randomized.sectionStyle,
      subSectionStyle: randomized.subSectionStyle,
      taskStyle: randomized.taskStyle,
      itemStyle: randomized.itemStyle,
      canvasCorners: randomized.canvasCorners,
      numberingStyle: randomized.numberingStyle,
      milestone: {
        ...prev.milestone,
        shape: randomized.milestoneShape,
      },
    }));
  };

  const handleToggleDuckMode = () => {
    if (design?.duckMode) {
      setDesign((prev) => ({
        ...prev,
        duckMode: false,
        headerStyle: 'gradient-banner',
      }));
    } else {
      setThemeId('custom');
      setCustomTheme(DUCK_THEME_PALETTE);
      setDesign((prev) => getDuckModeDesign(prev));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(draftConfig);
  };

  const base = {
    activeTab,
    setActiveTab,
    name,
    setName,
    periodLabel,
    setPeriodLabel,
    startDate,
    setStartDate,
    weeksPerPeriod,
    setWeeksPerPeriod,
    totalPeriods,
    setTotalPeriods,
    fontStyle,
    setFontStyle,
    themeId,
    setThemeId,
    customTheme,
    setCustomTheme,
    alternateRowHighlighting,
    setAlternateRowHighlighting,
    subtleGridDemarcations,
    setSubtleGridDemarcations,
    design,
    setDesign,
    isPeriodLengthDisabled,
    selectedPreset,
    activeTheme,
    draftConfig,
    previewPeriods,
    samplePeriod,
    swatchEffects,
    swatchDesign,
    tokens,
    numbering,
    resolvedMilestone,
    accent,
    sampleCategory,
    updateDesign,
    updateMilestone,
    toggleEffect,
    updateLegend,
    updateBanner,
    toggleCondensedMode,
    handlePeriodTypeChange,
    handleAccentChange,
    handleCustomBaseModeChange,
    handleRandomizeDesign,
    handleToggleDuckMode,
    handleSubmit,
    isCreatingNew,
    onClose,
  };
  const swatches = createSwatches(base);

  const legendHidden = design.legendPosition === 'hidden';
  const grid3 = 'grid grid-cols-2 xl:grid-cols-3 gap-2.5';
  const panelTitle = (Icon, tone, text) => (
    <SectionTitle icon={Icon} tone={tone}>
      {text}
    </SectionTitle>
  );
  const ctx = { ...base, ...swatches, legendHidden, grid3, panelTitle };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 dark:bg-slate-950/85 backdrop-blur-md">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={isCreatingNew ? 'Create roadmap' : 'Roadmap settings'}
        tabIndex={-1}
        className="relative w-[97vw] max-w-[2000px] h-[94vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        data-testid="config-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 dark:bg-indigo-500/20 border border-indigo-500/30 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isCreatingNew ? 'Create New Roadmap' : 'Roadmap Design & Configuration Studio'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Cadence, dates, themes, typography, hierarchy and bar styles, milestones and
                effects, with a live preview
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[210px_minmax(0,10fr)_minmax(0,9fr)] 2xl:grid-cols-[210px_minmax(0,5fr)_minmax(0,7fr)]">
            {/* Left category rail */}
            <nav className="hidden lg:block overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-4">
              {NAV_GROUPS.map((g) => (
                <div key={g.group} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {g.group}
                  </div>
                  {g.items.map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        data-testid={`config-tab-${t.id}`}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${active
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Controls */}
            <div className="overflow-y-auto p-6 space-y-6 min-w-0">
              {/* Compact category picker for narrow screens */}
              <select
                className={`lg:hidden ${inputCls}`}
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {NAV_GROUPS.flatMap((g) => g.items).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Active Duck Mode Banner */}
              {design?.duckMode && (
                <div
                  data-testid="ultimate-duck-mode-banner"
                  className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <YellowDuckIcon size={28} wake />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Ultimate Duck Mode Active</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Orchestrated
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        Visual styling is curated by the Duck Design System (Pond palette, floating
                        duck header, duck egg spine, rippled bars). Conflicting options are locked.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleDuckMode}
                    data-testid="disable-duck-mode-btn"
                    className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-amber-500/40 shadow-xs transition-colors cursor-pointer"
                  >
                    Disable Duck Mode
                  </button>
                </div>
              )}

              <div
                className={
                  design?.duckMode && !['timeline', 'banner', 'themes'].includes(activeTab)
                    ? 'pointer-events-none opacity-50 select-none'
                    : ''
                }
              >
                {/* TIMELINE */}
                {activeTab === 'timeline' && <TimelineTab ctx={ctx} />}

                {/* HEADER DETAILS */}
                {activeTab === 'banner' && <BannerTab ctx={ctx} />}

                {/* THEMES */}
                {activeTab === 'themes' && <ThemesTab ctx={ctx} />}

                {/* FONTS */}
                {activeTab === 'fonts' && <FontsTab ctx={ctx} />}

                {/* EFFECTS */}
                {activeTab === 'effects' && <EffectsTab ctx={ctx} />}

                {/* CANVAS HEADER */}
                {activeTab === 'header' && <HeaderTab ctx={ctx} />}

                {/* PERIOD HEADERS */}
                {activeTab === 'period' && <PeriodTab ctx={ctx} />}

                {/* SECTIONS */}
                {activeTab === 'section' && <SectionTab ctx={ctx} />}

                {/* SUB-SECTIONS */}
                {activeTab === 'subsection' && <SubsectionTab ctx={ctx} />}

                {/* TASKS */}
                {activeTab === 'task' && <TaskTab ctx={ctx} />}

                {/* NUMBERING */}
                {activeTab === 'numbering' && <NumberingTab ctx={ctx} />}

                {/* BARS */}
                {activeTab === 'bars' && <BarsTab ctx={ctx} />}

                {/* MILESTONES */}
                {activeTab === 'milestones' && <MilestonesTab ctx={ctx} />}

                {/* LEGEND */}
                {activeTab === 'legend' && <LegendTab ctx={ctx} />}

                {/* CONDENSED */}
                {activeTab === 'condensed' && <CondensedTab ctx={ctx} />}

                {/* GRID & DISPLAY */}
                {activeTab === 'grid' && <GridTab ctx={ctx} />}
              </div>
            </div>

            {/* Live preview */}
            <div className="hidden lg:flex flex-col min-w-0 min-h-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <Eye className="w-4 h-4" />
                  <span>Live Preview</span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Updates as you click
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable] px-5 pb-5">
                <ConfigPreview draftConfig={draftConfig} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/70 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
