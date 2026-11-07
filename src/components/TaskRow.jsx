import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import {
  Diamond,
  Trash2,
  Tag,
  Sparkles,
  X,
  Check,
  Plus,
} from 'lucide-react';
import { getSingularPeriodLabel } from '../constants/themes';

export default function TaskRow({
  task,
  rowIndex,
  periods,
  colWidth,
  items,
  legend,
  isPreview,
  alternateRowHighlighting,
  subtleGridDemarcations,
  periodLabel,
  activePopoverItemId,
  setActivePopoverItemId,
  onAddTimelineItem,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
  onUpdateTaskTitle,
}) {
  // Click-and-drag drawing state for creating a new bar across cells
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);
  const [dragOverPeriod, setDragOverPeriod] = useState(null);

  const totalPeriods = periods.length;
  const singularPeriod = getSingularPeriodLabel(periodLabel);

  useEffect(() => {
    if (drawStart === null) return;
    const handleGlobalMouseUp = () => {
      if (drawStart !== null && drawCurrent !== null) {
        const startPeriod = Math.min(drawStart, drawCurrent);
        const endPeriod = Math.max(drawStart, drawCurrent);
        const duration = Math.max(1, endPeriod - startPeriod + 1);
        const createdId = onAddTimelineItem({
          taskId: task.id,
          startPeriod,
          duration,
          type: 'bar',
          legendId: legend[0]?.id,
          label: task.title,
          hasEndMilestone: false,
        });
        if (createdId) {
          setActivePopoverItemId(createdId);
        }
      }
      setDrawStart(null);
      setDrawCurrent(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [drawStart, drawCurrent, task.id, task.title, legend, onAddTimelineItem, setActivePopoverItemId]);

  const handleCellMouseDown = (e, periodIndex) => {
    if (isPreview) return;
    if (e.button !== 0) return;
    // Ignore if clicking inside an existing Rnd item or popover
    if (e.target.closest('[data-rnd-item="true"]') || e.target.closest('[data-item-popover="true"]')) {
      return;
    }
    setActivePopoverItemId(null);
    setDrawStart(periodIndex);
    setDrawCurrent(periodIndex);
  };

  const handleCellMouseEnter = (periodIndex) => {
    if (drawStart !== null) {
      setDrawCurrent(periodIndex);
    }
  };

  const handleCellDragOver = (e, periodIndex) => {
    if (isPreview) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverPeriod !== periodIndex) {
      setDragOverPeriod(periodIndex);
    }
  };

  const handleCellDrop = (e, periodIndex) => {
    if (isPreview) return;
    e.preventDefault();
    setDragOverPeriod(null);
    const droppedType = e.dataTransfer.getData('application/roadmap-item-type') || 'milestone';
    const isMilestone = droppedType === 'milestone';
    const createdId = onAddTimelineItem({
      taskId: task.id,
      startPeriod: periodIndex,
      duration: 1,
      type: isMilestone ? 'milestone' : 'bar',
      legendId: legend[legend.length - 1]?.id || legend[0]?.id,
      label: isMilestone ? `${singularPeriod} ${periodIndex} Gate` : task.title,
      hasEndMilestone: false,
    });
    if (createdId) {
      setActivePopoverItemId(createdId);
    }
  };

  const drawRange =
    drawStart !== null && drawCurrent !== null
      ? {
          start: Math.min(drawStart, drawCurrent),
          end: Math.max(drawStart, drawCurrent),
        }
      : null;

  const rowBgClass =
    alternateRowHighlighting && rowIndex % 2 === 1
      ? 'bg-slate-900/45'
      : 'bg-slate-950/25';

  return (
    <div
      className={`group/row flex items-stretch transition-colors ${rowBgClass} ${
        subtleGridDemarcations ? 'border-b border-slate-800/65' : 'border-b border-transparent'
      }`}
      data-testid={`task-row-${task.id}`}
    >
      {/* Left Sticky Task Label Column */}
      <div
        className={`w-64 sm:w-72 shrink-0 px-4 py-2.5 flex items-center justify-between gap-2 sticky left-0 z-10 backdrop-blur-md ${
          alternateRowHighlighting && rowIndex % 2 === 1
            ? 'bg-slate-900/95'
            : 'bg-slate-950/95'
        } ${subtleGridDemarcations ? 'border-r border-slate-800/80' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70 shrink-0" />
          {isPreview ? (
            <span className="text-xs font-medium text-slate-200 truncate" title={task.title}>
              {task.title}
            </span>
          ) : (
            <input
              type="text"
              value={task.title}
              onChange={(e) => onUpdateTaskTitle(task.id, e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-200 focus:outline-none focus:bg-slate-900 px-1.5 py-0.5 rounded truncate"
              title={task.title}
            />
          )}
        </div>

        {/* Quick-add Milestone button in Editor Mode */}
        {!isPreview && (
          <button
            type="button"
            onClick={() => {
              const createdId = onAddTimelineItem({
                taskId: task.id,
                startPeriod: 1,
                duration: 1,
                type: 'milestone',
                legendId: legend[legend.length - 1]?.id || legend[0]?.id,
                label: 'Milestone',
                hasEndMilestone: false,
              });
              if (createdId) setActivePopoverItemId(createdId);
            }}
            className="opacity-0 group-hover/row:opacity-100 focus:opacity-100 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-opacity shrink-0"
            title="Drop a Milestone onto this row"
          >
            <Diamond className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>+MS</span>
          </button>
        )}
      </div>

      {/* Right Timeline Cells + Rnd Track */}
      <div
        className="relative flex items-stretch select-none"
        style={{
          width: `${totalPeriods * colWidth}px`,
          minHeight: '52px',
        }}
      >
        {/* Background Period Grid Cells */}
        {periods.map((period) => {
          const isBeingDrawn =
            drawRange &&
            period.index >= drawRange.start &&
            period.index <= drawRange.end;
          const isDropTarget = dragOverPeriod === period.index;

          return (
            <div
              key={period.index}
              onMouseDown={(e) => handleCellMouseDown(e, period.index)}
              onMouseEnter={() => handleCellMouseEnter(period.index)}
              onDragOver={(e) => handleCellDragOver(e, period.index)}
              onDragLeave={() => setDragOverPeriod(null)}
              onDrop={(e) => handleCellDrop(e, period.index)}
              style={{ width: `${colWidth}px` }}
              data-testid={`cell-${task.id}-${period.index}`}
              className={`h-full relative transition-colors ${
                !isPreview ? 'cursor-crosshair hover:bg-indigo-500/[0.04]' : ''
              } ${
                subtleGridDemarcations ? 'border-r border-slate-800/50' : ''
              } ${isBeingDrawn ? 'bg-indigo-500/15' : ''} ${
                isDropTarget
                  ? 'bg-amber-500/20 ring-2 ring-inset ring-amber-400/60'
                  : ''
              }`}
              title={
                !isPreview
                  ? `Click & drag to draw bar in ${period.title}, or drop a Milestone`
                  : undefined
              }
            >
              {/* Subtle cell hover helper in editor mode when row is empty */}
              {!isPreview && items.length === 0 && period.index === 1 && !drawRange && (
                <span className="pointer-events-none opacity-0 group-hover/row:opacity-70 transition-opacity absolute inset-y-0 left-3 flex items-center text-[10px] text-slate-500 gap-1 whitespace-nowrap">
                  <Plus className="w-3 h-3" /> Drag across periods to draw bar
                </span>
              )}
            </div>
          );
        })}

        {/* Active Click-and-Drag Rubberband Preview Bar */}
        {drawRange && (
          <div
            className="pointer-events-none absolute top-2 bottom-2 rounded-xl bg-indigo-500/35 border-2 border-dashed border-indigo-400 z-20 flex items-center justify-center text-[11px] font-semibold text-indigo-100 shadow-lg"
            style={{
              left: `${(drawRange.start - 1) * colWidth + 4}px`,
              width: `${(drawRange.end - drawRange.start + 1) * colWidth - 8}px`,
            }}
          >
            <span>
              {singularPeriod} {drawRange.start}
              {drawRange.end > drawRange.start ? ` – ${drawRange.end}` : ''} (
              {drawRange.end - drawRange.start + 1}{' '}
              {drawRange.end - drawRange.start + 1 === 1 ? 'period' : 'periods'})
            </span>
          </div>
        )}

        {/* Rendered Timeline Items (Bars & Milestones) via react-rnd */}
        {items.map((item) => {
          const category =
            legend.find((l) => l.id === item.legendId) ||
            legend[0] || {
              id: 'default',
              label: 'General',
              color: '#6366f1',
              gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            };

          const clampedStart = Math.max(
            1,
            Math.min(totalPeriods, Number(item.startPeriod) || 1)
          );
          const maxPossibleDuration = Math.max(1, totalPeriods - clampedStart + 1);
          const clampedDuration =
            item.type === 'milestone'
              ? Math.max(1, Math.min(maxPossibleDuration, Number(item.duration) || 1))
              : Math.max(1, Math.min(maxPossibleDuration, Number(item.duration) || 1));

          const xPos = (clampedStart - 1) * colWidth + 4;
          const itemWidth = clampedDuration * colWidth - 8;
          const isPopoverOpen = activePopoverItemId === item.id && !isPreview;

          return (
            <Rnd
              key={item.id}
              size={{
                width: itemWidth,
                height: 36,
              }}
              position={{
                x: xPos,
                y: 8,
              }}
              dragAxis="x"
              bounds="parent"
              dragGrid={[colWidth, 0]}
              resizeGrid={[colWidth, 0]}
              disableDragging={isPreview}
              enableResizing={
                isPreview
                  ? false
                  : {
                      left: true,
                      right: true,
                      top: false,
                      bottom: false,
                      topLeft: false,
                      topRight: false,
                      bottomLeft: false,
                      bottomRight: false,
                    }
              }
              onDragStop={(e, d) => {
                const newStartPeriod = Math.max(
                  1,
                  Math.min(
                    totalPeriods - clampedDuration + 1,
                    Math.round(d.x / colWidth) + 1
                  )
                );
                if (newStartPeriod !== item.startPeriod) {
                  onUpdateTimelineItem(item.id, { startPeriod: newStartPeriod });
                }
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newStartPeriod = Math.max(
                  1,
                  Math.min(totalPeriods, Math.round(position.x / colWidth) + 1)
                );
                const newDuration = Math.max(
                  1,
                  Math.min(
                    totalPeriods - newStartPeriod + 1,
                    Math.round(ref.offsetWidth / colWidth)
                  )
                );
                onUpdateTimelineItem(item.id, {
                  startPeriod: newStartPeriod,
                  duration: newDuration,
                });
              }}
              style={{
                zIndex: isPopoverOpen ? 45 : 20,
              }}
            >
              <div
                data-rnd-item="true"
                data-testid={`timeline-item-${item.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isPreview) {
                    setActivePopoverItemId(
                      activePopoverItemId === item.id ? null : item.id
                    );
                  }
                }}
                className="w-full h-full relative flex items-center select-none group/item"
              >
                {item.type === 'milestone' ? (
                  /* Milestone Presentation: Standalone Diamond or Line-End Diamond */
                  <div
                    className={`w-full h-full flex items-center justify-center relative px-2 rounded-xl transition-all ${
                      !isPreview
                        ? 'hover:bg-slate-800/40 cursor-pointer'
                        : ''
                    } ${isPopoverOpen ? 'ring-2 ring-amber-400/70 bg-slate-900/60' : ''}`}
                  >
                    {/* Line connecting across duration if milestone spans > 1 period or has line */}
                    <div
                      className="h-0.5 flex-1 rounded-full mr-1.5"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${category.color} 100%)`,
                      }}
                    />

                    {/* Diamond Icon */}
                    <div
                      className="w-6 h-6 rotate-45 rounded-[5px] flex items-center justify-center shadow-lg border border-white/40 shrink-0 transition-transform group-hover/item:scale-110"
                      style={{
                        background: category.gradient || category.color,
                        boxShadow: `0 4px 14px -2px ${category.color}88`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-[1px] bg-white/90" />
                    </div>

                    {/* Milestone Label Pill */}
                    <span
                      className="ml-2.5 text-[11px] font-bold text-white px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 truncate max-w-[130px] shadow-sm"
                      title={item.label || category.label}
                    >
                      {item.label || category.label}
                    </span>
                  </div>
                ) : (
                  /* Standard Task Bar (with optional End-of-Line Milestone Diamond) */
                  <div
                    className={`w-full h-full rounded-xl px-3 flex items-center justify-between gap-2 text-white shadow-md border transition-all ${
                      !isPreview ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      isPopoverOpen
                        ? 'ring-2 ring-white border-white shadow-xl'
                        : 'border-white/20 hover:border-white/45'
                    }`}
                    style={{
                      background: category.gradient || category.color,
                      boxShadow: `0 6px 18px -4px ${category.color}55`,
                    }}
                  >
                    {/* Left Resize Handle Indicator */}
                    {!isPreview && (
                      <span className="w-1 h-4 rounded-full bg-white/30 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                    )}

                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className="text-xs font-semibold tracking-tight truncate drop-shadow-sm"
                        title={item.label || category.label}
                      >
                        {item.label || category.label}
                      </span>
                    </div>

                    {/* Optional End-of-Line Milestone Diamond */}
                    {item.hasEndMilestone && (
                      <div
                        className="w-4 h-4 rotate-45 rounded-[3px] bg-white/95 flex items-center justify-center shadow-sm shrink-0 mr-0.5"
                        title="End-of-Line Milestone Gate"
                      >
                        <div
                          className="w-2 h-2 rounded-[1px]"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    )}

                    {/* Right Resize Handle Indicator */}
                    {!isPreview && (
                      <span className="w-1 h-4 rounded-full bg-white/30 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>
                )}

                {/* Popover to assign Legend Category, edit Label, or toggle Milestone */}
                {isPopoverOpen && (
                  <div
                    data-item-popover="true"
                    data-testid="timeline-item-popover"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute left-0 top-11 z-50 w-72 rounded-2xl bg-slate-900/98 border border-slate-700 shadow-2xl shadow-black/80 p-3.5 space-y-3 backdrop-blur-xl text-left cursor-default"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Style & Item Settings</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePopoverItemId(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Item Label */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Display Label
                      </label>
                      <input
                        type="text"
                        value={item.label || ''}
                        onChange={(e) =>
                          onUpdateTimelineItem(item.id, { label: e.target.value })
                        }
                        placeholder="Bar or milestone label..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Item Type Toggle: Bar vs Milestone */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Timeline Type
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateTimelineItem(item.id, { type: 'bar' })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                            item.type === 'bar'
                              ? 'bg-indigo-600/25 border-indigo-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Task Bar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateTimelineItem(item.id, {
                              type: 'milestone',
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                            item.type === 'milestone'
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Diamond className="w-3 h-3" />
                          <span>Milestone</span>
                        </button>
                      </div>
                    </div>

                    {/* End-of-line Milestone Diamond Toggle when type === 'bar' */}
                    {item.type === 'bar' && (
                      <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 cursor-pointer text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Diamond className="w-3.5 h-3.5 text-amber-400" />
                          <span>End-of-Line Milestone Diamond</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(item.hasEndMilestone)}
                          onChange={(e) =>
                            onUpdateTimelineItem(item.id, {
                              hasEndMilestone: e.target.checked,
                            })
                          }
                          className="rounded border-slate-700 bg-slate-900 text-indigo-500"
                        />
                      </label>
                    )}

                    {/* Assign Style from Predefined Legend */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Legend Category Style
                      </label>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {legend.map((cat) => {
                          const isSelected = cat.id === item.legendId;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() =>
                                onUpdateTimelineItem(item.id, { legendId: cat.id })
                              }
                              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all border ${
                                isSelected
                                  ? 'bg-slate-800 border-white/40 text-white font-semibold'
                                  : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className="w-3.5 h-3.5 rounded-md shrink-0 border border-white/25"
                                  style={{
                                    background: cat.gradient || cat.color,
                                  }}
                                />
                                <span className="truncate">{cat.label}</span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Period Span Controls + Delete */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-slate-400">
                        {singularPeriod} {clampedStart}
                        {clampedDuration > 1
                          ? `–${clampedStart + clampedDuration - 1}`
                          : ''}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTimelineItem(item.id);
                          setActivePopoverItemId(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}
