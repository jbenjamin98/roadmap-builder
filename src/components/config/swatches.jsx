import { BASE_DENSITY } from './navConfig';
import {
  BarVisual,
  CanvasHeaderVisual,
  CanvasOverlays,
  LevelLabel,
  NumBadge,
  PeriodHeaderCell,
  SectionNumber,
  SectionSpine,
} from '../StyleParts';
import {
  EFFECT_KIND_LABELS,
  EFFECT_RULES,
  getDefaultDesign,
  isRotatedSectionStyle,
} from '../../constants/designOptions';
import MilestoneMarker from '../MilestoneMarker';
import { PRESET_THEMES } from '../../constants/themes';
import { Zap } from 'lucide-react';
import { getSectionVisuals } from '../styleHelpers';
import { OptionCard, Stage } from './primitives';

export function createSwatches(ctx) {
  const {
    accent,
    design,
    numbering,
    resolvedMilestone,
    sampleCategory,
    samplePeriod,
    setThemeId,
    swatchDesign,
    themeId,
    toggleEffect,
    tokens,
  } = ctx;

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

  const sampleHeaderConfig = {
    name: 'Roadmap',
    periodLabel: 'Sprints',
    totalPeriods: 8,
    weeksPerPeriod: 2,
  };
  const sampleHeaderBanner = {
    subtitle: 'Strategic goals',
    owner: 'Platform Team',
    version: 'v2.0',
    logo: design?.banner?.logo || '',
  };

  const headerSwatch = (id) => (
    <Stage tokens={tokens} className="w-full">
      <CanvasHeaderVisual
        isSwatch
        styleId={id}
        config={sampleHeaderConfig}
        banner={sampleHeaderBanner}
        tokens={tokens}
        primaryColor={accent}
        singularPeriod="Sprint"
        periods={[]}
        legend={[]}
        design={design}
      />
    </Stage>
  );

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
              duckMode={Boolean(design?.duckMode)}
            />
            <div className="flex-1 px-2 flex flex-col justify-center gap-1.5">
              <div className="h-2 rounded" style={{ backgroundColor: tokens.gridBorder }} />
              <div className="h-2 w-2/3 rounded" style={{ backgroundColor: tokens.gridBorder }} />
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
              className={`flex items-center gap-2 ${v.pill ? 'px-2.5 py-0.5 rounded-full' : ''}`}
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
            backgroundColor: level === 'sub' ? tokens.subHeaderBg : tokens.stickyBg,
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
        <CanvasOverlays effects={fxDesign.effects} tokens={tokens} radiusClass="rounded-lg" />
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
          <span className="text-xs font-bold text-slate-900 dark:text-white">{eff.name}</span>
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
        <div className="text-[10px] text-slate-500 dark:text-slate-400">{eff.desc}</div>
      </label>
    );
  };

  return {
    darkThemes,
    lightThemes,
    neutralThemes,
    renderThemeCard,
    headerSwatch,
    periodSwatch,
    sectionSwatch,
    levelSwatch,
    numberSwatch,
    barSwatch,
    effectSwatch,
    renderEffectCard,
  };
}
