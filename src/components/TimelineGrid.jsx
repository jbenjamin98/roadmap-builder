import { useState, useRef, useLayoutEffect } from 'react';
import {
  Calendar,
  Plus,
  Layers,
  Diamond,
  Sparkles,
} from 'lucide-react';
import TaskRow from './TaskRow';
import { calculatePeriods } from '../utils/dateUtils';
import { FONT_STYLES, PRESET_THEMES } from '../constants/themes';

function WrappingTitleInput({ value, onChange, className }) {
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
      className={`resize-none overflow-hidden whitespace-normal break-words leading-snug ${className}`}
    />
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
  onAddSubSection,
  onAddTask,
  onUpdateSectionTitle,
  onUpdateSubSectionTitle,
  onUpdateTaskTitle,
  onAddTimelineItem,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
}) {
  const [activePopoverItemId, setActivePopoverItemId] = useState(null);

  const periods = calculatePeriods(config);
  const colWidth = 164; // Crisp width in px per period column for snapping

  const fontObj =
    FONT_STYLES.find((f) => f.id === config?.fontStyle) || FONT_STYLES[0];
  const presetTheme = PRESET_THEMES.find((t) => t.id === config?.themeId);

  const primaryColor = config?.theme?.primary || presetTheme?.primary || '#6366f1';
  const secondaryColor =
    config?.theme?.secondary || presetTheme?.secondary || '#0f172a';
  const accents = config?.theme?.accents ||
    presetTheme?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'];

  const alternateRowHighlighting =
    config?.previewSettings?.alternateRowHighlighting ?? true;
  const subtleGridDemarcations =
    config?.previewSettings?.subtleGridDemarcations ?? true;

  let globalTaskCounter = 0;

  return (
    <div
      className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 transition-colors"
      onClick={() => setActivePopoverItemId(null)}
    >
      {/* Target DOM Node for html2canvas PNG Export (contains Legend + Timeline Grid) */}
      <div
        ref={exportRef}
        data-testid="roadmap-export-canvas"
        style={{
          fontFamily: fontObj.fontFamily,
          background:
            presetTheme?.surfaceBg ||
            `linear-gradient(135deg, ${secondaryColor} 0%, #0f172a 100%)`,
          borderColor: presetTheme?.glassBorder || `${primaryColor}44`,
          minWidth: `${288 + periods.length * colWidth}px`,
        }}
        className="rounded-3xl border shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Top Presentation Header & Integrated Legend Bar */}
        <div
          className="px-6 py-5 border-b border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          style={{
            background:
              presetTheme?.headerGradient ||
              `linear-gradient(90deg, ${primaryColor}30 0%, ${accents[0]}18 50%, ${accents[1]}18 100%)`,
          }}
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span data-export-text="true">
                {config.totalPeriods} {config.periodLabel} • {config.weeksPerPeriod}{' '}
                {Number(config.weeksPerPeriod) === 1 ? 'Week' : 'Weeks'} / Period
              </span>
            </div>
            <h1
              data-export-text="true"
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug"
            >
              {config.name}
            </h1>
            {periods.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-300/90 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span data-export-text="true">
                  {periods[0].startDate} — {periods[periods.length - 1].endDate}
                </span>
              </div>
            )}
          </div>

          {/* Integrated Legend Strip (Captured in PNG export & Preview) */}
          <div
            className="flex flex-wrap items-center gap-2 bg-slate-950/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10"
            data-testid="canvas-legend-bar"
          >
            <span
              data-export-text="true"
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1"
            >
              Legend:
            </span>
            {legend.map((cat) => (
              <div
                key={cat.id}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-medium text-slate-100 shadow-sm"
              >
                <span
                  className="w-3.5 h-3.5 rounded-md shrink-0"
                  style={{
                    background: cat.gradient || cat.color,
                    border: cat.hasBorder
                      ? `2px solid ${cat.borderColor || '#ffffff'}`
                      : '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
                <span data-export-text="true" className="leading-snug">
                  {cat.label}
                </span>
              </div>
            ))}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs font-medium text-amber-200">
              <Diamond className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span data-export-text="true" className="leading-snug">
                Milestone
              </span>
            </div>
          </div>
        </div>

        {/* Main Timeline Table Header (Sticky Left Hierarchy Column + Period Columns) */}
        <div
          className={`flex items-stretch bg-slate-950/80 backdrop-blur-md border-b ${
            subtleGridDemarcations ? 'border-slate-800/90' : 'border-transparent'
          }`}
        >
          {/* Left Sticky Header Cell */}
          <div
            className={`w-64 sm:w-72 shrink-0 px-5 py-3.5 flex items-center justify-between sticky left-0 z-20 bg-slate-950/95 border-r ${
              subtleGridDemarcations ? 'border-slate-800/90' : 'border-transparent'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Layers className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
              <span data-export-text="true">Initiative / Activity</span>
            </div>
          </div>

          {/* Dynamic Period Column Headers */}
          <div
            className="flex items-stretch"
            style={{ width: `${periods.length * colWidth}px` }}
          >
            {periods.map((period, idx) => {
              const accentColor = accents[idx % accents.length] || primaryColor;
              return (
                <div
                  key={period.index}
                  style={{ width: `${colWidth}px` }}
                  data-testid={`period-header-${period.index}`}
                  className={`px-3 py-3 flex flex-col justify-center relative border-r ${
                    subtleGridDemarcations ? 'border-slate-800/70' : 'border-transparent'
                  }`}
                >
                  <div
                    className="h-1 w-10 rounded-full mb-1.5 opacity-80"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div
                    data-export-text="true"
                    className="text-xs font-bold text-white tracking-tight leading-snug"
                  >
                    {period.title}
                  </div>
                  <div
                    data-export-text="true"
                    className="text-[10px] font-mono text-slate-400 mt-0.5 leading-snug"
                  >
                    {period.dateRange}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hierarchical Sections -> Sub-sections -> Tasks Rows */}
        <div>
          {sections.map((section, secIdx) => {
            const sectionAccent = accents[secIdx % accents.length] || primaryColor;

            return (
              <div
                key={section.id}
                className={`border-b-2 ${
                  subtleGridDemarcations
                    ? 'border-slate-800/80'
                    : 'border-transparent'
                }`}
              >
                {/* Section Banner Row */}
                <div
                  className="flex items-stretch min-h-[42px]"
                  style={{
                    background: `linear-gradient(90deg, ${sectionAccent}26 0%, ${sectionAccent}08 60%, transparent 100%)`,
                  }}
                >
                  <div
                    className={`w-64 sm:w-72 shrink-0 px-4 py-2.5 flex items-center justify-between gap-2 sticky left-0 z-10 backdrop-blur-md bg-slate-900/90 border-r ${
                      subtleGridDemarcations ? 'border-slate-800/80' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span
                        data-export-text="true"
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white shadow-sm shrink-0 mt-0.5"
                        style={{ backgroundColor: sectionAccent }}
                      >
                        0{secIdx + 1}
                      </span>
                      {isPreview ? (
                        <span
                          data-export-text="true"
                          className="text-xs font-extrabold uppercase tracking-wider text-white whitespace-normal break-words leading-snug"
                        >
                          {section.title}
                        </span>
                      ) : (
                        <WrappingTitleInput
                          value={section.title}
                          onChange={(val) => onUpdateSectionTitle(section.id, val)}
                          className="w-full bg-transparent text-xs font-extrabold uppercase tracking-wider text-white focus:outline-none focus:bg-slate-950 px-1.5 py-0.5 rounded"
                        />
                      )}
                    </div>

                    {!isPreview && (
                      <button
                        type="button"
                        data-editor-control="true"
                        onClick={() => onAddSubSection(section.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0"
                        title="Add Sub-section"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Sub</span>
                      </button>
                    )}
                  </div>

                  {/* Section Horizontal Track Span */}
                  <div
                    className="flex items-stretch"
                    style={{ width: `${periods.length * colWidth}px` }}
                  >
                    {periods.map((period) => (
                      <div
                        key={period.index}
                        style={{ width: `${colWidth}px` }}
                        className={`h-full border-r ${
                          subtleGridDemarcations ? 'border-slate-800/35' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-sections inside Section */}
                {section.subSections.map((sub) => {
                  const subTasks = tasks.filter((t) => t.subSectionId === sub.id);

                  return (
                    <div key={sub.id}>
                      {/* Sub-section Header Row */}
                      <div className="flex items-stretch min-h-[34px] bg-slate-900/60">
                        <div
                          className={`w-64 sm:w-72 shrink-0 px-4 py-1.5 pl-6 flex items-center justify-between gap-2 sticky left-0 z-10 bg-slate-900/95 border-r ${
                            subtleGridDemarcations
                              ? 'border-slate-800/80'
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <span
                              className="w-2 h-2 rounded-sm rotate-45 shrink-0 mt-1.5"
                              style={{ backgroundColor: sectionAccent }}
                            />
                            {isPreview ? (
                              <span
                                data-export-text="true"
                                className="text-[11px] font-bold uppercase tracking-wider text-slate-300 whitespace-normal break-words leading-snug"
                              >
                                {sub.title}
                              </span>
                            ) : (
                              <WrappingTitleInput
                                value={sub.title}
                                onChange={(val) =>
                                  onUpdateSubSectionTitle(section.id, sub.id, val)
                                }
                                className="w-full bg-transparent text-[11px] font-bold uppercase tracking-wider text-slate-300 focus:outline-none focus:bg-slate-950 px-1.5 py-0.5 rounded"
                              />
                            )}
                          </div>

                          {!isPreview && (
                            <button
                              type="button"
                              data-editor-control="true"
                              onClick={() => onAddTask(sub.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 shrink-0"
                              title="Add Task to Sub-section"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>Task</span>
                            </button>
                          )}
                        </div>

                        <div
                          className="flex items-stretch"
                          style={{ width: `${periods.length * colWidth}px` }}
                        >
                          {periods.map((period) => (
                            <div
                              key={period.index}
                              style={{ width: `${colWidth}px` }}
                              className={`h-full border-r ${
                                subtleGridDemarcations
                                  ? 'border-slate-800/40'
                                  : 'border-transparent'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Task Rows inside Sub-section */}
                      {subTasks.map((task) => {
                        const currentRowIdx = globalTaskCounter++;
                        const rowItems = timelineItems.filter(
                          (item) => item.taskId === task.id
                        );

                        return (
                          <TaskRow
                            key={task.id}
                            task={task}
                            rowIndex={currentRowIdx}
                            periods={periods}
                            colWidth={colWidth}
                            items={rowItems}
                            legend={legend}
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
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
