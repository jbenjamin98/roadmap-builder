import { useState, useRef, useLayoutEffect } from 'react';
import { Calendar, Sparkles, User, Tag as TagIcon } from 'lucide-react';
import TaskRow from './TaskRow';
import MilestoneMarker from './MilestoneMarker';
import { calculatePeriods, getTodayMarkerInfo } from '../utils/dateUtils';
import { FONT_STYLES, getSingularPeriodLabel } from '../constants/themes';
import {
  SPINE_WIDTH,
  getDensity,
  isRotatedSectionStyle,
  normalizeDesign,
} from '../constants/designOptions';
import { getCanvasTokens, getCategoryBackground } from './canvasStyles';
import {
  CanvasOverlays,
  LevelLabel,
  NumBadge,
  PeriodHeaderCell,
  SectionNumber,
  SectionSpine,
} from './StyleParts';
import {
  INDENT,
  INDENT_SPINE,
  NO_WORD_BREAK,
  computeLeftWidth,
  resolveMilestoneDesign,
  getSectionVisuals,
  nbHyphen,
} from './styleHelpers';

function WrappingTitleInput({ value, onChange, className, style }) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      style={{ ...NO_WORD_BREAK, ...style }}
      className={`resize-none overflow-hidden whitespace-normal leading-snug ${className}`}
    />
  );
}

function LegendBar({ legend, design, tokens }) {
  const opt = design?.legend || {};
  const legendStyle = design?.legendStyle || 'chips';
  const md = resolveMilestoneDesign(design?.milestone, tokens);
  const msColor = md.color;
  const msBorder = md.borderColor;
  const swatchPx = { sm: 11, md: 14, lg: 18 }[opt.size] ?? 14;
  const textCls = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[opt.size] ?? 'text-xs';
  const gapCls = { tight: 'gap-1', normal: 'gap-2', loose: 'gap-3.5' }[opt.gap] || 'gap-2';
  const caseCls = opt.labelCase === 'upper' ? 'uppercase tracking-wide' : '';
  const framed = opt.frame !== 'none';
  const titleText = String(opt.title ?? 'Legend').trim();
  const shapeCls =
    opt.swatchShape === 'square'
      ? 'rounded-[2px]'
      : opt.swatchShape === 'circle'
      ? 'rounded-full'
      : 'rounded-md';

  const swatch = (cat) => (
    <span
      className={`shrink-0 ${shapeCls}`}
      style={{
        width: swatchPx,
        height: swatchPx,
        background: getCategoryBackground(cat),
        border: cat.hasBorder
          ? `2px solid ${cat.borderColor || '#ffffff'}`
          : '1px solid rgba(255, 255, 255, 0.3)',
      }}
    />
  );

  const itemShell = (key, children, extra = {}) => {
    if (legendStyle === 'swatches') {
      return (
        <div
          key={key}
          style={{ color: tokens?.textMain }}
          className={`inline-flex items-center gap-1.5 px-1 py-0.5 font-medium ${textCls}`}
        >
          {children}
        </div>
      );
    }
    if (legendStyle === 'filled') {
      return (
        <div
          key={key}
          style={extra.filled}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-white shadow-sm ${textCls}`}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        key={key}
        style={{
          backgroundColor: tokens?.chipBg,
          borderColor: extra.chipBorder || tokens?.chipBorder,
          color: tokens?.textMain,
        }}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border font-medium shadow-sm ${textCls}`}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      style={
        framed
          ? {
              backgroundColor: tokens?.legendBarBg,
              borderColor: tokens?.chipBorder,
            }
          : undefined
      }
      className={`flex ${gapCls} ${
        framed ? 'backdrop-blur-md px-4 py-2.5 rounded-2xl border' : ''
      } flex-wrap items-center`}
      data-testid="canvas-legend-bar"
    >
      {opt.showTitle !== false && titleText && (
        <span
          data-export-text="true"
          style={{ color: tokens?.textMuted }}
          className="text-[10px] font-bold uppercase tracking-wider mr-1"
        >
          {titleText}
        </span>
      )}

      {legend.map((cat) =>
        itemShell(
          cat.id,
          <>
            {legendStyle !== 'filled' && swatch(cat)}
            <span data-export-text="true" className={`leading-snug ${caseCls}`}>
              {cat.label}
            </span>
          </>,
          {
            filled: {
              background: getCategoryBackground(cat),
              border: cat.hasBorder
                ? `2px solid ${cat.borderColor || '#ffffff'}`
                : '1px solid rgba(255,255,255,0.28)',
            },
          }
        )
      )}

      {opt.includeMilestone !== false &&
        itemShell(
          'milestone',
          <>
            <MilestoneMarker
              milestoneDesign={md}
              size={swatchPx}
              effects={design?.effects}
              isLight={tokens?.isLight}
            />
            <span data-export-text="true" className={`leading-snug ${caseCls}`}>
              {opt.milestoneLabel || 'Milestone'}
            </span>
          </>,
          {
            chipBorder: `${msColor}66`,
            filled: {
              background: `linear-gradient(135deg, ${msColor} 0%, ${msColor}cc 100%)`,
              border:
                md?.borderStyle && md.borderStyle !== 'none'
                  ? `1.5px ${md.borderStyle} ${msBorder}`
                  : '1px solid rgba(255,255,255,0.35)',
            },
          }
        )}
    </div>
  );
}

export default function TimelineGrid({
  exportRef,
  config,
  legend,
  sections,
  tasks,
  timelineItems,
  isPreview,
  onUpdateSectionTitle,
  onUpdateSubSectionTitle,
  onUpdateTaskTitle,
  onAddTimelineItem,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
}) {
  const [activePopoverItemId, setActivePopoverItemId] = useState(null);

  const design = normalizeDesign(config?.design);
  const density = getDensity(design);
  const tokens = getCanvasTokens(config);
  const periods = calculatePeriods(config);
  const colWidth = density.colWidth;

  const fontObj =
    FONT_STYLES.find((f) => f.id === config?.fontStyle) || FONT_STYLES[0];

  const primaryColor = tokens.primary;
  const accents = tokens.accents;

  const alternateRowHighlighting =
    config?.previewSettings?.alternateRowHighlighting ?? true;
  const subtleGridDemarcations =
    config?.previewSettings?.subtleGridDemarcations ?? true;

  const periodHeaderStyle = design.periodHeaderStyle || 'accent-bar';
  const sectionStyle = design.sectionStyle || 'gradient-banner';
  const subSectionStyle = design.subSectionStyle || 'dot';
  const legendPosition = design.legendPosition || 'top';
  const banner = design.banner || {};
  const todayInfo = design.todayMarker
    ? getTodayMarkerInfo(config, periods)
    : null;
  const todayVisible = Boolean(todayInfo && todayInfo.inRange);
  const rotated = isRotatedSectionStyle(sectionStyle);
  // Frozen column grows just enough for the longest word in any title to fit.
  const leftW = computeLeftWidth({ density, sections, tasks, design, rotated });
  const numbering = design.numbering || {};
  const numStyle = design.numberingStyle || 'soft-tint';
  const singularPeriod = getSingularPeriodLabel(config.periodLabel);

  let globalTaskCounter = 0;

  const periodTrack = () =>
    periods.map((period) => {
      const isAltCol = design.alternateColumnShading && period.index % 2 === 0;
      return (
        <div
          key={period.index}
          style={{
            width: `${colWidth}px`,
            borderColor: subtleGridDemarcations
              ? tokens.gridSubtle
              : 'transparent',
            backgroundColor: isAltCol ? tokens.colShadeBg : undefined,
          }}
          className="h-full border-r"
        />
      );
    });

  // Sub-section header + its task rows. labelWidth/stickyLeft let rotated-spine
  // sections reserve room on the left for the vertical cap.
  const renderSubSectionBlock = (
    section,
    secIdx,
    sub,
    subIdx,
    sectionAccent,
    labelWidth,
    stickyLeft
  ) => {
    const subTasks = tasks.filter((t) => t.subSectionId === sub.id);

    return (
      <div key={sub.id}>
        <div
          className="flex items-stretch"
          style={{
            minHeight: `${density.subMin}px`,
            backgroundColor: tokens.subHeaderBg,
          }}
        >
          <div
            style={{
              width: `${labelWidth}px`,
              left: `${stickyLeft}px`,
              paddingLeft: (stickyLeft > 0 ? INDENT_SPINE : INDENT).sub,
              paddingRight: 14,
              backgroundColor: tokens.stickyAltBg,
              borderColor: subtleGridDemarcations
                ? tokens.gridBorder
                : 'transparent',
            }}
            className="shrink-0 py-1 flex items-center sticky z-[46] border-r"
          >
            <LevelLabel
              styleId={subSectionStyle}
              level="sub"
              accent={sectionAccent}
              badge={
                numbering.subSections ? (
                  <NumBadge
                    label={`${secIdx + 1}.${subIdx + 1}`}
                    accent={sectionAccent}
                    numStyle={numStyle}
                  />
                ) : null
              }
            >
              {isPreview ? (
                <span
                  data-export-text="true"
                  style={{ color: tokens.textSecondary, ...NO_WORD_BREAK }}
                  className="text-[11px] font-bold uppercase tracking-wider whitespace-normal leading-snug"
                >
                  {nbHyphen(sub.title)}
                </span>
              ) : (
                <WrappingTitleInput
                  value={sub.title}
                  onChange={(val) =>
                    onUpdateSubSectionTitle(section.id, sub.id, val)
                  }
                  style={{ color: tokens.textSecondary }}
                  className="w-full bg-transparent text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/40 px-1.5 py-0.5 rounded"
                />
              )}
            </LevelLabel>
          </div>

          <div
            className="flex items-stretch"
            style={{ width: `${periods.length * colWidth}px` }}
          >
            {periodTrack()}
          </div>
        </div>

        {subTasks.map((task, tIdx) => {
          const currentRowIdx = globalTaskCounter++;
          const rowItems = timelineItems.filter(
            (item) => item.taskId === task.id
          );

          return (
            <TaskRow
              key={task.id}
              task={task}
              rowIndex={currentRowIdx}
              taskNumberLabel={
                numbering.tasks
                  ? `${secIdx + 1}.${subIdx + 1}.${tIdx + 1}`
                  : null
              }
              sectionAccent={sectionAccent}
              periods={periods}
              colWidth={colWidth}
              items={rowItems}
              legend={legend}
              design={design}
              tokens={tokens}
              leftWidth={labelWidth}
              stickyLeft={stickyLeft}
              isPreview={isPreview}
              alternateRowHighlighting={alternateRowHighlighting}
              subtleGridDemarcations={subtleGridDemarcations}
              periodLabel={config.periodLabel}
              activePopoverItemId={activePopoverItemId}
              setActivePopoverItemId={setActivePopoverItemId}
              onAddTimelineItem={onAddTimelineItem}
              onUpdateTimelineItem={onUpdateTimelineItem}
              onDeleteTimelineItem={onDeleteTimelineItem}
              onUpdateTaskTitle={onUpdateTaskTitle}
            />
          );
        })}
      </div>
    );
  };

  const showRight = Boolean(banner.owner) || legendPosition === 'top';

  return (
    <div
      className="roadmap-scroll flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 transition-colors"
      onClick={() => setActivePopoverItemId(null)}
    >
      <div className="p-4 sm:p-6 w-max">
      {/* Export target. overflow-clip rounds the corners without breaking sticky. */}
      <div
        ref={exportRef}
        data-testid="roadmap-export-canvas"
        style={{
          fontFamily: fontObj.fontFamily,
          background: tokens.surfaceBg,
          borderColor: tokens.canvasBorder,
          borderWidth: design.effects?.brutalist ? '3px' : '1px',
          boxShadow: design.effects?.brutalist
            ? `8px 8px 0px ${tokens.isLight ? '#090d16' : '#f8fafc'}`
            : undefined,
          color: tokens.textMain,
          width: `${leftW + periods.length * colWidth}px`,
          minWidth: 'max-content',
        }}
        className="relative isolate rounded-3xl border shadow-2xl overflow-clip"
      >
        <CanvasOverlays effects={design.effects} tokens={tokens} />

        {/* Header */}
        <div
          className="px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4"
          style={{
            background: tokens.headerGradient,
            borderColor: tokens.gridBorder,
          }}
        >
          <div className="space-y-1 self-center">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: primaryColor }}
              />
              <span
                data-export-text="true"
                style={{ color: tokens.isLight ? primaryColor : '#a5b4fc' }}
              >
                {config.totalPeriods} {config.periodLabel} •{' '}
                {config.weeksPerPeriod}{' '}
                {Number(config.weeksPerPeriod) === 1 ? 'Week' : 'Weeks'} /{' '}
                {singularPeriod}
              </span>
              {banner.version && (
                <span
                  data-export-text="true"
                  style={{
                    backgroundColor: `${primaryColor}22`,
                    color: primaryColor,
                    borderColor: `${primaryColor}55`,
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono"
                >
                  <TagIcon className="w-2.5 h-2.5" />
                  {banner.version}
                </span>
              )}
            </div>

            <h1
              data-export-text="true"
              style={{ color: tokens.textMain, ...NO_WORD_BREAK }}
              className="text-2xl font-extrabold tracking-tight leading-snug"
            >
              {config.name}
            </h1>
            {banner.subtitle && (
              <p
                data-export-text="true"
                style={{ color: tokens.textSecondary, ...NO_WORD_BREAK }}
                className="text-xs font-medium leading-snug"
              >
                {banner.subtitle}
              </p>
            )}

            {periods.length > 0 && (
              <div
                style={{ color: tokens.textSecondary }}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <Calendar
                  className="w-3.5 h-3.5"
                  style={{ color: tokens.textMuted }}
                />
                <span data-export-text="true">
                  {periods[0].startDate} —{' '}
                  {periods[periods.length - 1].endDate}
                </span>
              </div>
            )}
          </div>

          {showRight && (
            <div className="flex flex-col items-end justify-between gap-3">
              {banner.owner ? (
                <span
                  data-export-text="true"
                  style={{ color: tokens.textSecondary }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-right"
                >
                  <User className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  {banner.owner}
                </span>
              ) : (
                <span />
              )}
              {legendPosition === 'top' && (
                <LegendBar legend={legend} design={design} tokens={tokens} />
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="relative">
          {/* "This period" line: above rows and bars, below the frozen column */}
          {todayVisible && periods.length > 0 && (
            <div
              data-testid="today-marker-line"
              style={{
                left: `${leftW + todayInfo.periodIndex * colWidth}px`,
              }}
              className="pointer-events-none absolute top-0 bottom-0 z-30"
            >
              <div className="h-full w-0 border-l-2 border-dashed border-rose-500/85" />
            </div>
          )}

          {/* FROZEN header: sticky top, blank sticky-left corner */}
          <div
            data-sticky-header="true"
            style={{
              backgroundColor: tokens.stickyBg,
              borderColor: subtleGridDemarcations
                ? tokens.gridBorder
                : 'transparent',
            }}
            className="flex items-stretch sticky top-0 z-[60] border-b shadow-sm"
          >
            <div
              style={{
                width: `${leftW}px`,
                backgroundColor: tokens.stickyBg,
                borderColor: subtleGridDemarcations
                  ? tokens.gridBorder
                  : 'transparent',
              }}
              className="shrink-0 sticky left-0 z-50 border-r"
            />

            <div
              className="flex flex-col relative"
              style={{ width: `${periods.length * colWidth}px` }}
            >
              {/* Strip above the period headers so the flag never covers a header */}
              {todayVisible && (
                <div
                  className="relative h-5 shrink-0"
                  style={{ backgroundColor: tokens.stickyBg }}
                >
                  <span
                    data-export-text="true"
                    style={{
                      left: `${todayInfo.periodIndex * colWidth}px`,
                    }}
                    className="pointer-events-none absolute top-0.5 -translate-x-full -ml-1 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md whitespace-nowrap"
                  >
                    This {singularPeriod}
                  </span>
                </div>
              )}

              <div className="flex items-stretch">
                {periods.map((period, idx) => (
                  <PeriodHeaderCell
                    key={period.index}
                    styleId={periodHeaderStyle}
                    period={period}
                    accent={accents[idx % accents.length] || primaryColor}
                    tokens={tokens}
                    density={density}
                    isAltCol={
                      design.alternateColumnShading && period.index % 2 === 0
                    }
                    subtleGrid={subtleGridDemarcations}
                    width={`${colWidth}px`}
                    testId={`period-header-${period.index}`}
                  />
                ))}
              </div>

              {/* Dotted line continues from the flag down through the header */}
              {todayVisible && (
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-10 w-0 border-l-2 border-dashed border-rose-500/85"
                  style={{ left: `${todayInfo.periodIndex * colWidth}px` }}
                />
              )}
            </div>
          </div>

          {/* Sections -> Sub-sections -> Tasks */}
          <div>
            {sections.map((section, secIdx) => {
              const sectionAccent =
                accents[secIdx % accents.length] || primaryColor;
              const isLastSection = secIdx === sections.length - 1;
              const dividerColor = isLastSection
                ? 'transparent'
                : design.sectionDividerGlow
                ? sectionAccent
                : subtleGridDemarcations
                ? tokens.gridBorder
                : 'transparent';

              // Rotated spine: vertical cap sits to the LEFT of the section's rows.
              // Spine (40px) + label column (leftW - 40px) = leftW, so periods stay aligned.
              if (rotated) {
                // Enough room for the vertical title to wrap onto two lines; rows
                // normally make the section taller than this.
                const minHeight = Math.min(
                  220,
                  Math.max(84, 56 + String(section.title || '').length * 3.4)
                );
                return (
                  <div
                    key={section.id}
                    style={{ borderColor: dividerColor, minHeight }}
                    className="border-b-2 relative flex items-stretch"
                  >
                    <SectionSpine
                      styleId={sectionStyle}
                      accent={sectionAccent}
                      tokens={tokens}
                      number={numbering.sections ? secIdx + 1 : null}
                      title={section.title}
                      roundBottomLeft={
                        secIdx === sections.length - 1 &&
                        legendPosition !== 'bottom'
                          ? 24 - (design.effects?.brutalist ? 3 : 1)
                          : 0
                      }
                    />
                    <div className="flex-1">
                      {section.subSections.map((sub, subIdx) =>
                        renderSubSectionBlock(
                          section,
                          secIdx,
                          sub,
                          subIdx,
                          sectionAccent,
                          leftW - SPINE_WIDTH,
                          SPINE_WIDTH
                        )
                      )}
                    </div>
                  </div>
                );
              }

              const visuals = getSectionVisuals(
                sectionStyle,
                sectionAccent,
                tokens,
                subtleGridDemarcations
              );

              return (
                <div
                  key={section.id}
                  style={{ borderColor: dividerColor }}
                  className="border-b-2"
                >
                  <div
                    className="flex items-stretch"
                    style={{
                      minHeight: `${density.sectionMin}px`,
                      background: visuals.bannerBg,
                    }}
                  >
                    <div
                      style={{
                        width: `${leftW}px`,
                        paddingLeft: INDENT.section,
                        paddingRight: 14,
                        ...visuals.leftCell,
                      }}
                      className="shrink-0 py-2 flex items-center sticky left-0 z-[46] border-r"
                    >
                      <div
                        style={
                          visuals.pill
                            ? {
                                backgroundColor: `${sectionAccent}22`,
                                border: `1.5px solid ${sectionAccent}77`,
                              }
                            : undefined
                        }
                        className={`flex items-center gap-2 min-w-0 flex-1 ${
                          visuals.pill ? 'px-2.5 py-1 rounded-full' : ''
                        }`}
                      >
                        <SectionNumber
                          show={numbering.sections}
                          label={`${secIdx + 1}`}
                          accent={sectionAccent}
                          visuals={visuals}
                          numStyle={numStyle}
                        />

                        {isPreview ? (
                          <span
                            data-export-text="true"
                            style={{ color: visuals.titleColor, ...NO_WORD_BREAK }}
                            className="text-xs font-extrabold uppercase tracking-wider whitespace-normal leading-snug"
                          >
                            {nbHyphen(section.title)}
                          </span>
                        ) : (
                          <WrappingTitleInput
                            value={section.title}
                            onChange={(val) =>
                              onUpdateSectionTitle(section.id, val)
                            }
                            style={{ color: visuals.titleColor }}
                            className="w-full bg-transparent text-xs font-extrabold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/40 px-1.5 py-0.5 rounded"
                          />
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-stretch"
                      style={{ width: `${periods.length * colWidth}px` }}
                    >
                      {periodTrack()}
                    </div>
                  </div>

                  {section.subSections.map((sub, subIdx) =>
                    renderSubSectionBlock(
                      section,
                      secIdx,
                      sub,
                      subIdx,
                      sectionAccent,
                      leftW,
                      0
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {legendPosition === 'bottom' && (
          <div
            style={{
              background: tokens.headerGradient,
              borderColor: tokens.gridBorder,
            }}
            className={`px-6 py-4 border-t rounded-b-3xl flex items-center ${
              { start: 'justify-start', center: 'justify-center', end: 'justify-end' }[
                design.legend?.align
              ] || 'justify-end'
            }`}
          >
            <LegendBar legend={legend} design={design} tokens={tokens} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
