import { useState } from 'react';
import {
  X,
  Calendar,
  Palette,
  Type,
  Sparkles,
  Sliders,
  ArrowRight,
  Grid,
  Rows,
  Diamond,
  Layers,
  Eye,
  Minimize2,
  Compass,
  Sun,
  Moon,
  ListOrdered,
  Columns,
  Clock,
  Zap,
} from 'lucide-react';
import { PERIOD_TYPES, FONT_STYLES, PRESET_THEMES } from '../constants/themes';
import {
  MILESTONE_SHAPES,
  MILESTONE_BORDER_STYLES,
  DATE_FORMATS,
  EFFECT_TOGGLES,
  EFFECT_CATEGORIES,
  EFFECT_RULES,
  EFFECT_KIND_LABELS,
  applyEffectToggle,
  CONDENSED_MODES,
  PERIOD_HEADER_STYLES,
  SECTION_STYLES,
  SUBSECTION_STYLES,
  TASK_STYLES,
  ITEM_STYLES,
  NUMBERING_STYLES,
  LEGEND_POSITIONS,
  LEGEND_STYLES,
  getDefaultDesign,
  getDensity,
  isRotatedSectionStyle,
  normalizeDesign,
} from '../constants/designOptions';
import { calculatePeriods, formatDateWithPattern } from '../utils/dateUtils';
import { getTodayDateString } from '../data/defaultState';
import { getCanvasTokens } from './canvasStyles';
import { getSectionVisuals, resolveMilestoneDesign } from './styleHelpers';
import {
  BarVisual,
  CanvasOverlays,
  LevelLabel,
  NumBadge,
  PeriodHeaderCell,
  SectionNumber,
  SectionSpine,
} from './StyleParts';
import MilestoneMarker from './MilestoneMarker';
import ConfigPreview from './ConfigPreview';

const FIXED_LENGTH_PERIODS = new Set(['Weeks', 'Months', 'Quarters']);

const NAV_GROUPS = [
  {
    group: 'Setup',
    items: [
      { id: 'timeline', label: 'Timeline & Dates', icon: Calendar },
      { id: 'banner', label: 'Header Details', icon: Layers },
    ],
  },
  {
    group: 'Look & Feel',
    items: [
      { id: 'themes', label: 'Canvas Themes', icon: Palette },
      { id: 'fonts', label: 'Typography', icon: Type },
      { id: 'effects', label: 'Surface Effects', icon: Sparkles },
    ],
  },
  {
    group: 'Hierarchy',
    items: [
      { id: 'period', label: 'Period Headers', icon: Columns },
      { id: 'section', label: 'Sections', icon: Rows },
      { id: 'subsection', label: 'Sub-sections', icon: Layers },
      { id: 'task', label: 'Task Rows', icon: ListOrdered },
      { id: 'numbering', label: 'Numbering', icon: ListOrdered },
    ],
  },
  {
    group: 'Timeline Items',
    items: [
      { id: 'bars', label: 'Timeline Bars', icon: Sliders },
      { id: 'milestones', label: 'Milestones', icon: Diamond },
      { id: 'legend', label: 'Legend', icon: Eye },
    ],
  },
  {
    group: 'Layout',
    items: [
      { id: 'condensed', label: 'Condensed View', icon: Minimize2 },
      { id: 'grid', label: 'Grid & Display', icon: Grid },
    ],
  },
];

const BASE_DENSITY = getDensity({ condensedModes: [] });

const inputCls =
  'w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500';

/** Selection card. Selected state is shown by the border highlight only. */
function OptionCard({ selected, onClick, title, desc, children, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
        selected
          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <span className="text-xs font-bold text-slate-900 dark:text-white">
        {title}
      </span>
      {children}
      {desc && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {desc}
        </span>
      )}
    </button>
  );
}

function Stage({ tokens, children, className = '', style }) {
  return (
    <div
      style={{
        backgroundColor: tokens.stickyBg,
        color: tokens.textMain,
        borderColor: tokens.gridBorder,
        ...style,
      }}
      className={`rounded-lg border overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function Segmented({ options, value, onChange, disabled = false }) {
  return (
    <div
      className={`inline-flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${
        disabled ? 'opacity-45 pointer-events-none' : ''
      }`}
    >
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            value === id
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ icon: Icon, tone, children }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${tone}`}
    >
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

function ToggleRow({ icon: Icon, tone, title, desc, checked, onChange, testId }) {
  return (
    <label
      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
        checked
          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 ${tone}`} />
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {title}
          </div>
          <div className="text-[10px] text-slate-500">{desc}</div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={testId}
        className="w-4 h-4 rounded border-slate-300 text-indigo-600"
      />
    </label>
  );
}

export default function ConfigModal({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
  isCreatingNew = false,
}) {
  const [activeTab, setActiveTab] = useState('timeline');

  const [name, setName] = useState(
    isCreatingNew ? '' : initialConfig?.name || ''
  );
  const [periodLabel, setPeriodLabel] = useState(
    isCreatingNew ? 'Sprints' : initialConfig?.periodLabel || 'Sprints'
  );
  const [startDate, setStartDate] = useState(
    isCreatingNew
      ? getTodayDateString()
      : initialConfig?.startDate || getTodayDateString()
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
    isCreatingNew
      ? PRESET_THEMES[0].id
      : initialConfig?.themeId || PRESET_THEMES[0].id
  );

  const [customTheme, setCustomTheme] = useState({
    baseMode: initialConfig?.theme?.baseMode || 'dark',
    primary: initialConfig?.theme?.primary || '#6366f1',
    secondary: initialConfig?.theme?.secondary || '#0f172a',
    accents:
      Array.isArray(initialConfig?.theme?.accents) &&
      initialConfig.theme.accents.length === 4
        ? [...initialConfig.theme.accents]
        : ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
  });

  const [alternateRowHighlighting, setAlternateRowHighlighting] = useState(
    isCreatingNew
      ? true
      : initialConfig?.previewSettings?.alternateRowHighlighting ?? true
  );
  const [subtleGridDemarcations, setSubtleGridDemarcations] = useState(
    isCreatingNew
      ? true
      : initialConfig?.previewSettings?.subtleGridDemarcations ?? true
  );

  const [design, setDesign] = useState(() =>
    normalizeDesign(isCreatingNew ? null : initialConfig?.design)
  );

  if (!isOpen) return null;

  const isPeriodLengthDisabled = FIXED_LENGTH_PERIODS.has(periodLabel);

  const selectedPreset = PRESET_THEMES.find((t) => t.id === themeId);
  const activeTheme =
    themeId === 'custom'
      ? customTheme
      : {
          baseMode: selectedPreset?.isLight ? 'light' : 'dark',
          primary: selectedPreset?.primary || '#6366f1',
          secondary: selectedPreset?.secondary || '#0f172a',
          accents: selectedPreset?.accents || [
            '#818cf8',
            '#ec4899',
            '#14b8a6',
            '#f59e0b',
          ],
        };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveConfig(draftConfig);
  };

  const showSection = (secId) => activeTab === secId;

  const darkThemes = PRESET_THEMES.filter((t) => !t.isLight && !t.isNeutral);
  const lightThemes = PRESET_THEMES.filter((t) => t.isLight && !t.isNeutral);
  const neutralThemes = PRESET_THEMES.filter((t) => t.isNeutral);

  const renderThemeCard = (preset) => (
    <OptionCard
      key={preset.id}
      selected={themeId === preset.id}
      onClick={() => setThemeId(preset.id)}
      title={preset.name}
      desc={preset.description}
    >
      <div
        className="h-2 w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${preset.primary}, ${preset.accents[0]}, ${preset.accents[1]}, ${preset.accents[2]})`,
        }}
      />
      <div className="flex items-center gap-1">
        <span
          className="w-3.5 h-3.5 rounded-full border border-slate-400/50"
          style={{ backgroundColor: preset.primary }}
        />
        <span
          className="w-3.5 h-3.5 rounded-full border border-slate-400/50"
          style={{ backgroundColor: preset.secondary }}
        />
        <span className="text-slate-400 text-[10px] mx-0.5">|</span>
        {preset.accents.map((acc, i) => (
          <span
            key={i}
            className="w-3.5 h-3.5 rounded-full border border-slate-400/40"
            style={{ backgroundColor: acc }}
          />
        ))}
      </div>
    </OptionCard>
  );

  /* ---- swatches (all use the real renderers so they match the canvas) ---- */

  const periodSwatch = (id) => (
    <Stage tokens={tokens}>
      <PeriodHeaderCell
        styleId={id}
        period={samplePeriod}
        accent={accent}
        tokens={tokens}
        density={BASE_DENSITY}
        width="100%"
      />
    </Stage>
  );

  const sectionSwatch = (id) => {
    if (isRotatedSectionStyle(id)) {
      return (
        <Stage tokens={tokens}>
          <div className="flex items-stretch" style={{ height: 78 }}>
            <SectionSpine
              styleId={id}
              accent={accent}
              tokens={tokens}
              number={numbering.sections ? 1 : null}
              title="Foundation"
            />
            <div className="flex-1 px-2 flex flex-col justify-center gap-1.5">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: tokens.gridBorder }}
              />
              <div
                className="h-2 w-2/3 rounded"
                style={{ backgroundColor: tokens.gridBorder }}
              />
            </div>
          </div>
        </Stage>
      );
    }
    const v = getSectionVisuals(id, accent, tokens, true);
    return (
      <Stage tokens={tokens}>
        <div style={{ background: v.bannerBg }}>
          <div
            style={{ ...v.leftCell, width: '100%' }}
            className="px-3 py-2 flex items-center gap-2"
          >
            <div
              style={
                v.pill
                  ? {
                      backgroundColor: `${accent}22`,
                      border: `1.5px solid ${accent}77`,
                    }
                  : undefined
              }
              className={`flex items-center gap-2 ${
                v.pill ? 'px-2.5 py-0.5 rounded-full' : ''
              }`}
            >
              <SectionNumber
                show={numbering.sections}
                label="1"
                accent={accent}
                visuals={v}
                numStyle={design.numberingStyle}
              />
              <span
                style={{ color: v.titleColor }}
                className="text-xs font-extrabold uppercase tracking-wider whitespace-nowrap"
              >
                Foundation
              </span>
            </div>
          </div>
        </div>
      </Stage>
    );
  };

  const levelSwatch = (id, level) => {
    const showNum = level === 'sub' ? numbering.subSections : numbering.tasks;
    return (
      <Stage tokens={tokens}>
        <div
          className="py-2.5"
          style={{
            backgroundColor:
              level === 'sub' ? tokens.subHeaderBg : tokens.stickyBg,
            paddingLeft: level === 'sub' ? 14 : 24,
            paddingRight: 10,
          }}
        >
          <LevelLabel
            styleId={id}
            level={level}
            accent={accent}
            badge={
              showNum ? (
                <NumBadge
                  label={level === 'sub' ? '1.1' : '1.1.1'}
                  accent={accent}
                  numStyle={design.numberingStyle}
                />
              ) : null
            }
          >
            <span
              style={{ color: tokens.textSecondary }}
              className={`whitespace-nowrap ${
                level === 'sub'
                  ? 'text-[11px] font-bold uppercase tracking-wider'
                  : 'text-xs font-medium'
              }`}
            >
              {level === 'sub' ? 'Workstream' : 'Deliverable'}
            </span>
          </LevelLabel>
        </div>
      </Stage>
    );
  };

  const numberSwatch = (id) => (
    <Stage tokens={tokens}>
      <div className="px-3 py-2.5 flex items-center gap-3">
        {['1', '1.1', '1.1.1'].map((l) => (
          <NumBadge key={l} label={l} accent={accent} numStyle={id} />
        ))}
      </div>
    </Stage>
  );

  const barSwatch = (id) => (
    <Stage tokens={tokens} className="p-2">
      <div style={{ height: 34 }}>
        <BarVisual
          label="Task bar"
          category={sampleCategory}
          design={{ ...swatchDesign, itemStyle: id, showBarDurationLabels: false }}
          tokens={tokens}
          density={BASE_DENSITY}
          duration={2}
          shortUnit="S"
        />
      </div>
    </Stage>
  );

  const effectSwatch = (id) => {
    const allOff = Object.fromEntries(
      Object.keys(getDefaultDesign().effects).map((k) => [k, false])
    );
    const fxDesign = {
      ...swatchDesign,
      itemStyle: 'pill-gradient',
      showBarDurationLabels: false,
      effects: { ...allOff, [id]: true },
    };
    return (
      <div
        className="relative rounded-lg overflow-hidden border p-3 flex items-center gap-2"
        style={{
          background: tokens.surfaceBg,
          borderColor: tokens.canvasBorder,
          color: tokens.textMain,
        }}
      >
        <CanvasOverlays
          effects={fxDesign.effects}
          tokens={tokens}
          radiusClass="rounded-lg"
        />
        <div className="flex-1" style={{ height: 30 }}>
          <BarVisual
            label="Task bar"
            category={sampleCategory}
            design={fxDesign}
            tokens={tokens}
            density={BASE_DENSITY}
          />
        </div>
        <MilestoneMarker
          milestoneDesign={resolvedMilestone}
          size={18}
          effects={fxDesign.effects}
          isLight={tokens.isLight}
        />
      </div>
    );
  };

  const renderEffectCard = (eff) => {
    const checked = Boolean(design.effects?.[eff.id]);
    const kind = EFFECT_RULES[eff.id]?.kind;
    const blocked = Boolean(design.effects?.flat) && eff.id !== 'flat';
    return (
      <label
        key={eff.id}
        title={blocked ? 'Turn off Ultra-Flat Matte to use this effect' : undefined}
        className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
          blocked
            ? 'opacity-45 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70'
            : checked
            ? 'cursor-pointer border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
            : 'cursor-pointer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {eff.name}
          </span>
          <input
            type="checkbox"
            checked={checked}
            disabled={blocked}
            onChange={(e) => toggleEffect(eff.id, e.target.checked)}
            data-testid={`effect-toggle-${eff.id}`}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 shrink-0"
          />
        </div>
        {kind === 'override-all' && (
          <span className="inline-flex items-center gap-1 self-start px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/40">
            <Zap className="w-2.5 h-2.5" />
            {EFFECT_KIND_LABELS[kind]}
          </span>
        )}
        {effectSwatch(eff.id)}
        <div className="text-[10px] text-slate-500 dark:text-slate-400">
          {eff.desc}
        </div>
      </label>
    );
  };

  const legendHidden = design.legendPosition === 'hidden';
  const grid3 = 'grid grid-cols-2 xl:grid-cols-3 gap-2.5';
  const panelTitle = (Icon, tone, text) => (
    <SectionTitle icon={Icon} tone={tone}>
      {text}
    </SectionTitle>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 dark:bg-slate-950/85 backdrop-blur-md">
      <div
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
                {isCreatingNew
                  ? 'Create New Roadmap'
                  : 'Roadmap Design & Configuration Studio'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Cadence, dates, themes, typography, hierarchy and bar styles,
                milestones and effects, with a live preview
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
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[210px_minmax(0,5fr)_minmax(0,7fr)]">
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
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                          active
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

              {/* TIMELINE */}
              {showSection('timeline') && (
                <div className="space-y-5">
                  {panelTitle(Calendar, 'text-indigo-600 dark:text-indigo-400', 'Timeline Cadence & Date Formatting')}

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
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
                        className={inputCls}
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Period Type Name
                      </label>
                      <select
                        value={periodLabel}
                        onChange={(e) => handlePeriodTypeChange(e.target.value)}
                        data-testid="config-period-type"
                        className={inputCls}
                      >
                        {PERIOD_TYPES.map((pt) => (
                          <option key={pt.value} value={pt.value}>
                            {pt.value} (Default: {pt.defaultWeeks}{' '}
                            {pt.defaultWeeks === 1 ? 'wk' : 'wks'})
                          </option>
                        ))}
                      </select>
                    </div>

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
                        className={inputCls}
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Weeks per Period{' '}
                        {isPeriodLengthDisabled && (
                          <span className="text-[10px] font-normal text-slate-400">
                            (Fixed)
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
                        className={`${inputCls} ${
                          isPeriodLengthDisabled
                            ? 'opacity-60 cursor-not-allowed'
                            : ''
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Total Periods
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={36}
                        required
                        value={totalPeriods}
                        onChange={(e) => setTotalPeriods(e.target.value)}
                        data-testid="config-total-periods"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Date Format</FieldLabel>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
                      {DATE_FORMATS.map((fmt) => (
                        <OptionCard
                          key={fmt.id}
                          selected={design.dateFormat === fmt.id}
                          onClick={() => updateDesign({ dateFormat: fmt.id })}
                          testId={`date-format-${fmt.id}`}
                          title={fmt.name}
                        >
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            {formatDateWithPattern(startDate, fmt.id)}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {fmt.id}
                          </span>
                        </OptionCard>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                        Calculated Horizon:
                      </span>{' '}
                      {previewPeriods.length} {periodLabel} (
                      {Number(weeksPerPeriod) * previewPeriods.length} weeks)
                    </div>
                    {previewPeriods.length > 0 && (
                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        {previewPeriods[0].title}: {previewPeriods[0].dateRange}{' '}
                        → {previewPeriods[previewPeriods.length - 1].title}:{' '}
                        {previewPeriods[previewPeriods.length - 1].dateRange}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HEADER DETAILS */}
              {showSection('banner') && (
                <div className="space-y-4">
                  {panelTitle(Layers, 'text-indigo-600 dark:text-indigo-400', 'Header Details (Optional)')}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Shown in the roadmap header and in exports. The owner appears
                    on the right side of the header.
                  </p>
                  <div className="grid grid-cols-1 gap-3 max-w-xl">
                    {[
                      ['subtitle', 'Subtitle / strategic goal'],
                      ['owner', 'Owner / Team'],
                      ['version', 'Version (e.g. v2.4)'],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={design.banner?.[key] || ''}
                          onChange={(e) => updateBanner({ [key]: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* THEMES */}
              {showSection('themes') && (
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
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            Custom Palette
                          </div>
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
              )}

              {/* FONTS */}
              {showSection('fonts') && (
                <div className="space-y-4">
                  {panelTitle(Type, 'text-teal-600 dark:text-teal-400', 'Typography & Font Options')}
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {FONT_STYLES.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setFontStyle(font.id)}
                        style={{ fontFamily: font.fontFamily }}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          fontStyle === font.id
                            ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                          {font.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {font.sample}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EFFECTS */}
              {showSection('effects') && (
                <div className="space-y-4">
                  {panelTitle(Sparkles, 'text-purple-600 dark:text-purple-400', 'Surface Effects')}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    These only affect the roadmap itself. Effects marked with a
                    badge replace others of the same kind, so selecting one
                    automatically unchecks the conflicting ones.
                  </p>
                  {EFFECT_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {cat.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cat.desc}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                        {cat.ids
                          .map((id) => EFFECT_TOGGLES.find((e) => e.id === id))
                          .filter(Boolean)
                          .map((eff) => renderEffectCard(eff))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PERIOD HEADERS */}
              {showSection('period') && (
                <div className="space-y-4">
                  {panelTitle(Columns, 'text-indigo-600 dark:text-indigo-400', 'Period / Date Column Header Style')}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {PERIOD_HEADER_STYLES.map((o) => (
                      <OptionCard
                        key={o.id}
                        selected={design.periodHeaderStyle === o.id}
                        onClick={() => updateDesign({ periodHeaderStyle: o.id })}
                        testId={`period-header-style-${o.id}`}
                        title={o.name}
                        desc={o.desc}
                      >
                        {periodSwatch(o.id)}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTIONS */}
              {showSection('section') && (
                <div className="space-y-4">
                  {panelTitle(Rows, 'text-indigo-600 dark:text-indigo-400', 'Section Style')}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {SECTION_STYLES.map((o) => (
                      <OptionCard
                        key={o.id}
                        selected={design.sectionStyle === o.id}
                        onClick={() => updateDesign({ sectionStyle: o.id })}
                        testId={`section-style-${o.id}`}
                        title={o.name}
                        desc={o.desc}
                      >
                        {sectionSwatch(o.id)}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-SECTIONS */}
              {showSection('subsection') && (
                <div className="space-y-4">
                  {panelTitle(Layers, 'text-indigo-600 dark:text-indigo-400', 'Sub-Section Style')}
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {SUBSECTION_STYLES.map((o) => (
                      <OptionCard
                        key={o.id}
                        selected={design.subSectionStyle === o.id}
                        onClick={() => updateDesign({ subSectionStyle: o.id })}
                        testId={`subsection-style-${o.id}`}
                        title={o.name}
                        desc={o.desc}
                      >
                        {levelSwatch(o.id, 'sub')}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              )}

              {/* TASKS */}
              {showSection('task') && (
                <div className="space-y-4">
                  {panelTitle(ListOrdered, 'text-indigo-600 dark:text-indigo-400', 'Task Row Style')}
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {TASK_STYLES.map((o) => (
                      <OptionCard
                        key={o.id}
                        selected={design.taskStyle === o.id}
                        onClick={() => updateDesign({ taskStyle: o.id })}
                        testId={`task-style-${o.id}`}
                        title={o.name}
                        desc={o.desc}
                      >
                        {levelSwatch(o.id, 'task')}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              )}

              {/* NUMBERING */}
              {showSection('numbering') && (
                <div className="space-y-5">
                  {panelTitle(ListOrdered, 'text-indigo-600 dark:text-indigo-400', 'Numbering')}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <ToggleRow
                      icon={ListOrdered}
                      tone="text-indigo-500"
                      title="Number sections"
                      desc="1, 2, 3"
                      checked={Boolean(design.numbering?.sections)}
                      onChange={(v) =>
                        updateDesign({ numbering: { ...design.numbering, sections: v } })
                      }
                      testId="config-number-sections"
                    />
                    <ToggleRow
                      icon={ListOrdered}
                      tone="text-indigo-500"
                      title="Number sub-sections"
                      desc="1.1, 1.2"
                      checked={Boolean(design.numbering?.subSections)}
                      onChange={(v) =>
                        updateDesign({ numbering: { ...design.numbering, subSections: v } })
                      }
                      testId="config-number-subsections"
                    />
                    <ToggleRow
                      icon={ListOrdered}
                      tone="text-indigo-500"
                      title="Number tasks"
                      desc="1.1.1, 1.1.2"
                      checked={Boolean(design.numbering?.tasks)}
                      onChange={(v) =>
                        updateDesign({ numbering: { ...design.numbering, tasks: v } })
                      }
                      testId="config-number-tasks"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Numbering Style</FieldLabel>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {NUMBERING_STYLES.map((o) => (
                        <OptionCard
                          key={o.id}
                          selected={design.numberingStyle === o.id}
                          onClick={() => updateDesign({ numberingStyle: o.id })}
                          testId={`numbering-style-${o.id}`}
                          title={o.name}
                        >
                          {numberSwatch(o.id)}
                        </OptionCard>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BARS */}
              {showSection('bars') && (
                <div className="space-y-4">
                  {panelTitle(Sliders, 'text-amber-600 dark:text-amber-400', 'Timeline Bar Style')}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {ITEM_STYLES.map((o) => (
                      <OptionCard
                        key={o.id}
                        selected={design.itemStyle === o.id}
                        onClick={() => updateDesign({ itemStyle: o.id })}
                        testId={`item-style-${o.id}`}
                        title={o.name}
                        desc={o.desc}
                      >
                        {barSwatch(o.id)}
                      </OptionCard>
                    ))}
                  </div>
                </div>
              )}

              {/* MILESTONES */}
              {showSection('milestones') && (
                <div className="space-y-4">
                  {panelTitle(Diamond, 'text-amber-600 dark:text-amber-400', 'Milestone Style')}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                    {MILESTONE_SHAPES.map((sh) => (
                      <OptionCard
                        key={sh.id}
                        selected={design.milestone?.shape === sh.id}
                        onClick={() => updateMilestone({ shape: sh.id })}
                        testId={`milestone-shape-${sh.id}`}
                        title={sh.name}
                      >
                        <span className="flex justify-center py-1">
                          <MilestoneMarker
                            milestoneDesign={{ ...resolvedMilestone, shape: sh.id }}
                            size={22}
                            effects={swatchEffects}
                            isLight={tokens.isLight}
                          />
                        </span>
                      </OptionCard>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Fill Color
                      </label>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {design.milestone?.color === 'auto' ? (
                          <>
                            <span
                              className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 shrink-0"
                              style={{ backgroundColor: resolvedMilestone.color }}
                            />
                            <span className="text-xs flex-1 text-slate-600 dark:text-slate-300">
                              Auto · follows theme
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateMilestone({ color: resolvedMilestone.color })
                              }
                              data-testid="milestone-color-custom"
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              Custom
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="color"
                              value={design.milestone?.color}
                              onChange={(e) => updateMilestone({ color: e.target.value })}
                              data-testid="milestone-color-input"
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            />
                            <span className="text-xs font-mono flex-1">
                              {design.milestone?.color}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateMilestone({ color: 'auto' })}
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              Auto
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Border Style
                      </label>
                      <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        {MILESTONE_BORDER_STYLES.map((bs) => (
                          <button
                            key={bs.id}
                            type="button"
                            onClick={() => updateMilestone({ borderStyle: bs.id })}
                            data-testid={`milestone-border-${bs.id}`}
                            className={`py-1 rounded-lg text-[10px] font-semibold ${
                              design.milestone?.borderStyle === bs.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {bs.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Border Color
                      </label>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {design.milestone?.borderColor === 'auto' ? (
                          <>
                            <span className="text-xs flex-1 text-slate-600 dark:text-slate-300">
                              Auto · contrasts with canvas
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateMilestone({
                                  borderColor: tokens.isLight ? '#0f172a' : '#ffffff',
                                })
                              }
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              Custom
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="color"
                              value={design.milestone?.borderColor || '#ffffff'}
                              onChange={(e) =>
                                updateMilestone({ borderColor: e.target.value })
                              }
                              data-testid="milestone-border-color-input"
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            />
                            <span className="text-xs font-mono flex-1">
                              {design.milestone?.borderColor}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateMilestone({ borderColor: 'auto' })}
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            >
                              Auto
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LEGEND */}
              {showSection('legend') && (
                <div className="space-y-6">
                  {panelTitle(Eye, 'text-indigo-600 dark:text-indigo-400', 'Legend')}

                  {/* 1. Placement: everything else depends on this */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      1. Placement
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <FieldLabel>Position</FieldLabel>
                        <Segmented
                          options={LEGEND_POSITIONS.map((lp) => [lp.id, lp.name])}
                          value={design.legendPosition}
                          onChange={(v) => updateDesign({ legendPosition: v })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Alignment</FieldLabel>
                        <Segmented
                          options={[['start', 'Left'], ['center', 'Center'], ['end', 'Right']]}
                          value={design.legend?.align || 'end'}
                          onChange={(v) => updateLegend({ align: v })}
                          disabled={design.legendPosition !== 'bottom'}
                        />
                        {design.legendPosition !== 'bottom' && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Only applies when the legend is at the bottom.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {legendHidden && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                      The legend is hidden, so the options below have no effect.
                    </p>
                  )}

                  {/* 2. Item look: shape depends on the item style */}
                  <div className={`space-y-3 ${legendHidden ? 'opacity-50' : ''}`}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      2. Item appearance
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <FieldLabel>Item style</FieldLabel>
                        <Segmented
                          options={LEGEND_STYLES.map((ls) => [ls.id, ls.name])}
                          value={design.legendStyle}
                          onChange={(v) => updateDesign({ legendStyle: v })}
                          disabled={legendHidden}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Swatch shape</FieldLabel>
                        <Segmented
                          options={[['square', 'Square'], ['rounded', 'Rounded'], ['circle', 'Circle']]}
                          value={design.legend?.swatchShape || 'rounded'}
                          onChange={(v) => updateLegend({ swatchShape: v })}
                          disabled={legendHidden || design.legendStyle === 'filled'}
                        />
                        {design.legendStyle === 'filled' && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Filled items are solid pills, so they have no swatch.
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Size</FieldLabel>
                        <Segmented
                          options={[['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']]}
                          value={design.legend?.size || 'md'}
                          onChange={(v) => updateLegend({ size: v })}
                          disabled={legendHidden}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Spacing between items</FieldLabel>
                        <Segmented
                          options={[['tight', 'Tight'], ['normal', 'Normal'], ['loose', 'Loose']]}
                          value={design.legend?.gap || 'normal'}
                          onChange={(v) => updateLegend({ gap: v })}
                          disabled={legendHidden}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Container</FieldLabel>
                        <Segmented
                          options={[['boxed', 'Boxed'], ['none', 'No box']]}
                          value={design.legend?.frame || 'boxed'}
                          onChange={(v) => updateLegend({ frame: v })}
                          disabled={legendHidden}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabel>Label text</FieldLabel>
                        <Segmented
                          options={[['normal', 'As typed'], ['upper', 'UPPERCASE']]}
                          value={design.legend?.labelCase || 'normal'}
                          onChange={(v) => updateLegend({ labelCase: v })}
                          disabled={legendHidden}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Content: text inputs depend on their toggles */}
                  <div className={`space-y-3 ${legendHidden ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      3. Content
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-2">
                        <ToggleRow
                          icon={Eye}
                          tone="text-indigo-500"
                          title="Show legend title"
                          desc="A small heading before the items"
                          checked={design.legend?.showTitle !== false}
                          onChange={(v) => updateLegend({ showTitle: v })}
                          testId="config-legend-title"
                        />
                        <input
                          type="text"
                          value={design.legend?.title ?? 'Legend'}
                          onChange={(e) => updateLegend({ title: e.target.value })}
                          disabled={design.legend?.showTitle === false}
                          placeholder="Legend"
                          aria-label="Legend title text"
                          className={`${inputCls} ${
                            design.legend?.showTitle === false ? 'opacity-45' : ''
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <ToggleRow
                          icon={Diamond}
                          tone="text-amber-500"
                          title="Include milestone"
                          desc="List the milestone symbol too"
                          checked={design.legend?.includeMilestone !== false}
                          onChange={(v) => updateLegend({ includeMilestone: v })}
                          testId="config-legend-milestone"
                        />
                        <input
                          type="text"
                          value={design.legend?.milestoneLabel ?? 'Milestone'}
                          onChange={(e) => updateLegend({ milestoneLabel: e.target.value })}
                          disabled={design.legend?.includeMilestone === false}
                          placeholder="Milestone"
                          aria-label="Milestone legend label"
                          className={`${inputCls} ${
                            design.legend?.includeMilestone === false ? 'opacity-45' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONDENSED */}
              {showSection('condensed') && (
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Combine any modes you like.
                  </p>
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
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {mode.name}
                            </div>
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
              )}

              {/* GRID & DISPLAY */}
              {showSection('grid') && (
                <div className="space-y-4">
                  {panelTitle(Grid, 'text-indigo-600 dark:text-indigo-400', 'Canvas Grid & Display')}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <ToggleRow
                      icon={Rows}
                      tone="text-indigo-500"
                      title="Alt Row Highlighting"
                      desc="Zebra striping on alternate task rows"
                      checked={alternateRowHighlighting}
                      onChange={setAlternateRowHighlighting}
                      testId="config-alt-rows-checkbox"
                    />
                    <ToggleRow
                      icon={Grid}
                      tone="text-indigo-500"
                      title="Grid Lines"
                      desc="Period column and row divider lines"
                      checked={subtleGridDemarcations}
                      onChange={setSubtleGridDemarcations}
                      testId="config-grid-lines-checkbox"
                    />
                    <ToggleRow
                      icon={Columns}
                      tone="text-sky-500"
                      title="Alt Period Column Shading"
                      desc="Subtle contrast on even periods"
                      checked={Boolean(design.alternateColumnShading)}
                      onChange={(v) => updateDesign({ alternateColumnShading: v })}
                      testId="config-alt-cols-checkbox"
                    />
                    <ToggleRow
                      icon={Compass}
                      tone="text-rose-500"
                      title="This Period Marker"
                      desc="Shows when today falls inside the timeline"
                      checked={Boolean(design.todayMarker)}
                      onChange={(v) => updateDesign({ todayMarker: v })}
                      testId="config-today-marker-checkbox"
                    />
                    <ToggleRow
                      icon={Clock}
                      tone="text-purple-500"
                      title="Bar Duration Badges"
                      desc="Period span badge inside bars"
                      checked={Boolean(design.showBarDurationLabels)}
                      onChange={(v) => updateDesign({ showBarDurationLabels: v })}
                      testId="config-bar-duration-checkbox"
                    />
                    <ToggleRow
                      icon={Zap}
                      tone="text-fuchsia-500"
                      title="Accent Section Dividers"
                      desc="Section borders use the accent color"
                      checked={Boolean(design.sectionDividerGlow)}
                      onChange={(v) => updateDesign({ sectionDividerGlow: v })}
                      testId="config-section-glow-checkbox"
                    />
                  </div>
                </div>
              )}
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
              <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
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
              <span>
                {isCreatingNew ? 'Create Roadmap' : 'Apply Configuration'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
