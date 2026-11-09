import { useState } from 'react';
import useFont from '../hooks/useFont';
import { calculatePeriods, getTodayMarkerInfo } from '../utils/dateUtils';
import { FONT_STYLES, getSingularPeriodLabel } from '../constants/themes';
import { getDensity, isRotatedSectionStyle, normalizeDesign } from '../constants/designOptions';
import { getCanvasTokens } from './canvasStyles';
import { CanvasOverlays } from './StyleParts';
import { computeLeftWidth } from './styleHelpers';
import LegendBar from './timeline/LegendBar';
import TimelineHeader from './timeline/TimelineHeader';
import TimelineStickyHeader from './timeline/TimelineStickyHeader';
import TimelineSection from './timeline/TimelineSection';

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

  const fontObj = FONT_STYLES.find((f) => f.id === config?.fontStyle) || FONT_STYLES[0];
  useFont(fontObj.id);

  const primaryColor = tokens.primary;
  const accents = tokens.accents;

  const alternateRowHighlighting = config?.previewSettings?.alternateRowHighlighting ?? true;
  const subtleGridDemarcations = config?.previewSettings?.subtleGridDemarcations ?? true;

  const periodHeaderStyle = design.periodHeaderStyle || 'accent-bar';
  const sectionStyle = design.sectionStyle || 'gradient-banner';
  const subSectionStyle = design.subSectionStyle || 'dot';
  const legendPosition = design.legendPosition || 'top';
  const banner = design.banner || {};
  const todayInfo = design.todayMarker ? getTodayMarkerInfo(config, periods) : null;
  const todayVisible = Boolean(todayInfo && todayInfo.inRange);
  const rotated = isRotatedSectionStyle(sectionStyle);
  const leftW = computeLeftWidth({ density, sections, tasks, design, rotated });
  const numbering = design.numbering || {};
  const numStyle = design.numberingStyle || 'soft-tint';
  const singularPeriod = getSingularPeriodLabel(config.periodLabel);

  let globalTaskCounter = 0;
  const getTaskRowIndex = () => globalTaskCounter++;

  return (
    <div
      className="roadmap-scroll flex-1 min-w-0 overflow-auto bg-slate-100 dark:bg-slate-950 transition-colors"
      onClick={() => setActivePopoverItemId(null)}
      style={{
        '--scrollbar-primary': primaryColor,
        '--scrollbar-accent': accents?.[0] || primaryColor,
        '--scrollbar-track': tokens.isLight
          ? 'rgba(15, 23, 42, 0.08)'
          : 'rgba(255, 255, 255, 0.08)',
        scrollbarColor: `${primaryColor} ${tokens.isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
      }}
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

          {/* Top Roadmap Banner */}
          <TimelineHeader
            config={config}
            banner={banner}
            tokens={tokens}
            primaryColor={primaryColor}
            singularPeriod={singularPeriod}
            periods={periods}
            legend={legend}
            design={design}
            legendPosition={legendPosition}
          />

          {/* Canvas Grid Body */}
          <div className="relative">
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

            {/* Frozen Period Headers */}
            <TimelineStickyHeader
              leftW={leftW}
              periods={periods}
              colWidth={colWidth}
              todayVisible={todayVisible}
              todayInfo={todayInfo}
              singularPeriod={singularPeriod}
              periodHeaderStyle={periodHeaderStyle}
              accents={accents}
              primaryColor={primaryColor}
              tokens={tokens}
              density={density}
              design={design}
              subtleGridDemarcations={subtleGridDemarcations}
            />

            {/* Sections -> Sub-sections -> Tasks */}
            <div>
              {sections.map((section, secIdx) => (
                <TimelineSection
                  key={section.id}
                  section={section}
                  secIdx={secIdx}
                  sectionsCount={sections.length}
                  tasks={tasks}
                  timelineItems={timelineItems}
                  legend={legend}
                  design={design}
                  tokens={tokens}
                  density={density}
                  periods={periods}
                  colWidth={colWidth}
                  leftW={leftW}
                  rotated={rotated}
                  sectionStyle={sectionStyle}
                  subSectionStyle={subSectionStyle}
                  numbering={numbering}
                  numStyle={numStyle}
                  legendPosition={legendPosition}
                  alternateRowHighlighting={alternateRowHighlighting}
                  subtleGridDemarcations={subtleGridDemarcations}
                  periodLabel={config.periodLabel}
                  primaryColor={primaryColor}
                  accents={accents}
                  isPreview={isPreview}
                  activePopoverItemId={activePopoverItemId}
                  setActivePopoverItemId={setActivePopoverItemId}
                  onUpdateSectionTitle={onUpdateSectionTitle}
                  onUpdateSubSectionTitle={onUpdateSubSectionTitle}
                  onUpdateTaskTitle={onUpdateTaskTitle}
                  onAddTimelineItem={onAddTimelineItem}
                  onUpdateTimelineItem={onUpdateTimelineItem}
                  onDeleteTimelineItem={onDeleteTimelineItem}
                  getTaskRowIndex={getTaskRowIndex}
                />
              ))}
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
