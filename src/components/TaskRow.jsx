import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import {
  Trash2,
  Tag,
  X,
  Check,
  Plus,
} from 'lucide-react';
import { getSingularPeriodLabel } from '../constants/themes';
import { getDensity, normalizeDesign } from '../constants/designOptions';
import { getCategoryBackground } from './canvasStyles';
import MilestoneMarker from './MilestoneMarker';
import { BarVisual, LevelLabel, NumBadge } from './StyleParts';
import {
  INDENT,
  INDENT_SPINE,
  NO_WORD_BREAK,
  nbHyphen,
  resolveMilestoneDesign,
} from './styleHelpers';

function estimateItemHeight(
  labelText,
  itemWidth,
  isMilestone,
  hasEndMilestone,
  density
) {
  const minH = density?.itemMin || 38;
  if (density?.singleLine) return minH;

  const text = String(labelText || '').trim();
  if (!text) return minH;
  const chromePadding = isMilestone ? 56 : hasEndMilestone ? 52 : 26;
  const availablePx = Math.max(48, itemWidth - chromePadding);
  const avgCharPx = density?.charPx || 6.8;
  const charsPerLine = Math.max(6, Math.floor(availablePx / avgCharPx));

  const words = text.split(/\s+/);
  let lines = 1;
  let currentLineLen = 0;
  for (const word of words) {
    if (word.length > charsPerLine) {
      // Words are never broken mid-word: a long word just gets its own line.
      if (currentLineLen > 0) lines += 1;
      currentLineLen = word.length;
    } else if (
      currentLineLen + (currentLineLen > 0 ? 1 : 0) + word.length >
      charsPerLine
    ) {
      lines += 1;
      currentLineLen = word.length;
    } else {
      currentLineLen += (currentLineLen > 0 ? 1 : 0) + word.length;
    }
  }

  const itemPad = density?.itemPad ?? 20;
  const lineH = density?.lineH ?? 16;
  return Math.max(minH, itemPad + lines * lineH);
}

function TimelineItemPopover({
  getAnchorEl,
  item,
  legend,
  milestoneDesign,
  singularPeriod,
  clampedStart,
  clampedDuration,
  onClose,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
}) {
  const popoverRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    const anchorEl = getAnchorEl?.();
    if (!anchorEl || !popoverRef.current) return;

    const updatePosition = () => {
      const currentAnchor = getAnchorEl?.();
      if (!currentAnchor || !popoverRef.current) return;
      const anchorRect = currentAnchor.getBoundingClientRect();
      const popRect = popoverRef.current.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const margin = 12;

      let top = anchorRect.bottom + 8;
      if (top + popRect.height > viewportH - margin) {
        const aboveTop = anchorRect.top - popRect.height - 8;
        if (aboveTop >= margin) {
          top = aboveTop;
        } else {
          top = Math.max(margin, viewportH - popRect.height - margin);
        }
      }

      let left = anchorRect.left;
      if (left + popRect.width > viewportW - margin) {
        left = Math.max(margin, viewportW - popRect.width - margin);
      }
      if (left < margin) {
        left = margin;
      }

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [getAnchorEl, item]);

  return createPortal(
    <div
      ref={popoverRef}
      data-item-popover="true"
      data-testid="timeline-item-popover"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-3.5 space-y-3 text-left cursor-default text-slate-900 dark:text-slate-100"
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Style & Item Settings</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Item Label */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
          Display Label
        </label>
        <input
          type="text"
          value={item.label || ''}
          onChange={(e) =>
            onUpdateTimelineItem(item.id, { label: e.target.value })
          }
          placeholder="Bar or milestone label..."
          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* End-of-line Milestone Toggle when type === 'bar' */}
      {item.type === 'bar' && (
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <MilestoneMarker milestoneDesign={milestoneDesign} size={13} isLight />
            <span>End-of-Line Milestone</span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(item.hasEndMilestone)}
            onChange={(e) =>
              onUpdateTimelineItem(item.id, {
                hasEndMilestone: e.target.checked,
              })
            }
            className="rounded border-slate-300 dark:border-slate-700 text-indigo-600"
          />
        </label>
      )}

      {item.type === 'bar' && (
        <>
      {/* Assign Style from Predefined Legend */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
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
                    ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-400 dark:border-white/40 text-slate-900 dark:text-white font-semibold'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0"
                    style={{
                      background: getCategoryBackground(cat),
                      border: cat.hasBorder
                        ? `2px solid ${cat.borderColor || '#ffffff'}`
                        : '1px solid rgba(148, 163, 184, 0.35)',
                    }}
                  />
                  <span className="truncate">{cat.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

        </>
      )}

      {/* Period Span Controls + Delete */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {singularPeriod} {clampedStart}
          {clampedDuration > 1
            ? `–${clampedStart + clampedDuration - 1}`
            : ''}
        </div>

        <button
          type="button"
          onClick={() => {
            onDeleteTimelineItem(item.id);
            onClose();
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function TaskRow({
  task,
  rowIndex,
  taskNumberLabel,
  sectionAccent,
  periods,
  colWidth,
  items,
  legend,
  design: rawDesign,
  tokens,
  leftWidth,
  stickyLeft = 0,
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
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);
  const [dragOverPeriod, setDragOverPeriod] = useState(null);

  const itemRefs = useRef({});
  const taskTextareaRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const trackRef = useRef(null);
  const [trackHeight, setTrackHeight] = useState(0);
  const latestResizeRef = useRef(null);
  const [resizeView, setResizeView] = useState(null);

  const design = normalizeDesign(rawDesign);
  const density = getDensity(design);
  const milestoneDesign = resolveMilestoneDesign(design.milestone, tokens);
  const taskStyle = design.taskStyle || 'dot';
  const barGap = density.barGap;
  const msBorderColor =
    milestoneDesign.borderColor === 'auto' || !milestoneDesign.borderColor
      ? tokens?.isLight
        ? '#0f172a'
        : '#ffffff'
      : milestoneDesign.borderColor;
  const labelColWidth = leftWidth ?? density.leftW;

  const totalPeriods = periods.length;
  const singularPeriod = getSingularPeriodLabel(periodLabel);
  const shortUnit = singularPeriod.slice(0, 1).toUpperCase();

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => setTrackHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = taskTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [task.title, isPreview, density.id]);

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
          // Defer so the click that follows mouse-up doesn't immediately close it.
          setTimeout(() => setActivePopoverItemId(createdId), 0);
        }
      }
      setDrawStart(null);
      setDrawCurrent(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [
    drawStart,
    drawCurrent,
    task.id,
    task.title,
    legend,
    onAddTimelineItem,
    setActivePopoverItemId,
  ]);

  const computeResize = (base, steps) => {
    const rightEdge = base.start + base.duration - 1;
    if (base.side === 'left') {
      const start = Math.max(1, Math.min(rightEdge, base.start + steps));
      return { start, duration: rightEdge - start + 1 };
    }
    const duration = Math.max(
      1,
      Math.min(totalPeriods - base.start + 1, base.duration + steps)
    );
    return { start: base.start, duration };
  };

  const startResize = (e, item, start, duration, side) => {
    setResizeView({
      id: item.id,
      side,
      startX: e.clientX,
      start,
      duration,
      steps: 0,
    });
    setActivePopoverItemId(null);
  };

  useEffect(() => {
    latestResizeRef.current = resizeView;
  }, [resizeView]);

  const isResizing = Boolean(resizeView);
  useEffect(() => {
    if (!isResizing) return undefined;
    const onMove = (e) => {
      setResizeView((prev) =>
        prev
          ? { ...prev, steps: Math.round((e.clientX - prev.startX) / colWidth) }
          : prev
      );
    };
    const onUp = () => {
      const base = latestResizeRef.current;
      lastInteractionRef.current = Date.now();
      if (base && base.steps !== 0) {
        const r = computeResize(base, base.steps);
        onUpdateTimelineItem(base.id, {
          startPeriod: r.start,
          duration: r.duration,
        });
      }
      setResizeView(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, colWidth, totalPeriods, onUpdateTimelineItem]);

  const handleCellMouseDown = (e, periodIndex) => {
    if (isPreview) return;
    if (e.button !== 0) return;
    if (
      e.target.closest('[data-rnd-item="true"]') ||
      e.target.closest('[data-item-popover="true"]')
    ) {
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
    const droppedType =
      e.dataTransfer.getData('application/roadmap-item-type') || 'milestone';
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

  const isOddRow = alternateRowHighlighting && rowIndex % 2 === 1;
  const rowBgColor = isOddRow
    ? tokens?.rowBgOdd || 'rgba(15, 23, 42, 0.45)'
    : tokens?.rowBgEven || 'rgba(2, 6, 23, 0.25)';
  const stickyCellBg = isOddRow
    ? tokens?.stickyAltBg || '#0f172a'
    : tokens?.stickyBg || '#020617';
  const gridBorderColor = subtleGridDemarcations
    ? tokens?.gridSubtle || 'rgba(30, 41, 59, 0.65)'
    : 'transparent';

  // Calculate dynamic heights for each timeline item
  const itemMetrics = items.map((item) => {
    const category =
      legend.find((l) => l.id === item.legendId) ||
      legend[0] || {
        id: 'default',
        label: 'General',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        hasBorder: false,
        borderColor: '#ffffff',
      };

    let clampedStart = Math.max(
      1,
      Math.min(totalPeriods, Number(item.startPeriod) || 1)
    );
    const maxPossibleDuration = Math.max(1, totalPeriods - clampedStart + 1);
    let clampedDuration = Math.max(
      1,
      Math.min(maxPossibleDuration, Number(item.duration) || 1)
    );
    if (resizeView && resizeView.id === item.id) {
      const r = computeResize(resizeView, resizeView.steps);
      clampedStart = r.start;
      clampedDuration = r.duration;
    }
    const xPos = (clampedStart - 1) * colWidth + barGap;
    const itemWidth = clampedDuration * colWidth - barGap * 2;
    const displayLabel = item.label || category.label;
    const itemHeight = estimateItemHeight(
      displayLabel,
      itemWidth,
      item.type === 'milestone',
      Boolean(item.hasEndMilestone),
      density
    );

    return {
      item,
      category,
      clampedStart,
      clampedDuration,
      xPos,
      itemWidth,
      itemHeight,
    };
  });

  const maxBarHeight = itemMetrics.reduce(
    (maxH, m) => Math.max(maxH, m.itemHeight),
    density.itemMin
  );
  const verticalSlack = density.singleLine ? Math.min(8, density.vSlack) : density.vSlack;
  const rowMinHeight = Math.max(density.rowMin, maxBarHeight + verticalSlack);
  const accentDotColor = sectionAccent || tokens?.primary || '#6366f1';

  const labelWrap = density.singleLine
    ? 'truncate whitespace-nowrap'
    : 'whitespace-normal wrap-ok';

  return (
    <div
      className="group/row flex items-stretch border-b"
      style={{
        backgroundColor: rowBgColor,
        borderColor: gridBorderColor,
      }}
      data-testid={`task-row-${task.id}`}
    >
      {/* Left Frozen Task Label Column */}
      <div
        className="shrink-0 flex items-center sticky z-[46] border-r"
        style={{
          width: `${labelColWidth}px`,
          left: `${stickyLeft}px`,
          paddingLeft: (stickyLeft > 0 ? INDENT_SPINE : INDENT).task,
          paddingRight: 14,
          backgroundColor: stickyCellBg,
          borderColor: subtleGridDemarcations
            ? tokens?.gridBorder || 'rgba(30, 41, 59, 0.8)'
            : 'transparent',
          paddingTop: density.singleLine ? '3px' : '7px',
          paddingBottom: density.singleLine ? '3px' : '7px',
        }}
      >
        <LevelLabel
          styleId={taskStyle}
          level="task"
          accent={accentDotColor}
          badge={
            taskNumberLabel ? (
              <NumBadge
                label={taskNumberLabel}
                accent={accentDotColor}
                numStyle={design.numberingStyle}
              />
            ) : null
          }
        >
          {isPreview ? (
            <span
              data-export-text="true"
              style={{
                color: tokens?.textSecondary || '#e2e8f0',
                fontSize: `${density.labelPx}px`,
                ...NO_WORD_BREAK,
              }}
              className={`font-medium leading-snug ${labelWrap}`}
            >
              {nbHyphen(task.title)}
            </span>
          ) : (
            <textarea
              ref={taskTextareaRef}
              rows={1}
              value={task.title}
              onChange={(e) => onUpdateTaskTitle(task.id, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              style={{
                color: tokens?.textSecondary || '#e2e8f0',
                fontSize: `${density.labelPx}px`,
                ...NO_WORD_BREAK,
              }}
              className="w-full resize-none overflow-hidden bg-transparent font-medium whitespace-normal leading-snug focus:outline-none focus:ring-1 focus:ring-indigo-500/50 px-1.5 py-0.5 rounded"
            />
          )}
        </LevelLabel>
      </div>

      {/* Right Timeline Cells + Rnd Track */}
      <div
        ref={trackRef}
        className="relative flex items-stretch select-none"
        style={{
          width: `${totalPeriods * colWidth}px`,
          minHeight: `${rowMinHeight}px`,
        }}
      >
        {/* Background Period Grid Cells */}
        {periods.map((period) => {
          const isBeingDrawn =
            drawRange &&
            period.index >= drawRange.start &&
            period.index <= drawRange.end;
          const isDropTarget = dragOverPeriod === period.index;
          const isAltCol =
            design.alternateColumnShading && period.index % 2 === 0;

          return (
            <div
              key={period.index}
              onMouseDown={(e) => handleCellMouseDown(e, period.index)}
              onMouseEnter={() => handleCellMouseEnter(period.index)}
              onDragOver={(e) => handleCellDragOver(e, period.index)}
              onDragLeave={() => setDragOverPeriod(null)}
              onDrop={(e) => handleCellDrop(e, period.index)}
              style={{
                width: `${colWidth}px`,
                borderColor: gridBorderColor,
                backgroundColor: isAltCol ? tokens?.colShadeBg : undefined,
              }}
              data-testid={`cell-${task.id}-${period.index}`}
              className={`h-full relative border-r ${
                !isPreview ? 'cursor-crosshair hover:bg-indigo-500/[0.05]' : ''
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
              {!isPreview &&
                items.length === 0 &&
                period.index === 1 &&
                !drawRange && (
                  <span
                    data-editor-control="true"
                    style={{ color: tokens?.textMuted || '#64748b' }}
                    className="pointer-events-none opacity-0 group-hover/row:opacity-75 transition-opacity absolute inset-y-0 left-3 flex items-center text-[10px] gap-1 whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" /> Drag across periods to draw bar
                  </span>
                )}
            </div>
          );
        })}

        {/* Active Click-and-Drag Rubberband Preview Bar */}
        {drawRange && (
          <div
            className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl bg-indigo-500/35 border-2 border-dashed border-indigo-400 z-20 flex items-center justify-center text-[11px] font-semibold text-white shadow-lg"
            style={{
              left: `${(drawRange.start - 1) * colWidth + barGap}px`,
              width: `${
                (drawRange.end - drawRange.start + 1) * colWidth - barGap * 2
              }px`,
            }}
          >
            <span className="whitespace-nowrap">
              {singularPeriod} {drawRange.start}
              {drawRange.end > drawRange.start ? ` – ${drawRange.end}` : ''} (
              {drawRange.end - drawRange.start + 1}{' '}
              {drawRange.end - drawRange.start + 1 === 1 ? 'period' : 'periods'}
              )
            </span>
          </div>
        )}

        {/* Rendered Timeline Items (Bars & Milestones) via react-rnd */}
        {itemMetrics.map(
          ({
            item,
            category,
            clampedStart,
            clampedDuration,
            xPos,
            itemWidth,
            itemHeight,
          }) => {
            const isPopoverOpen = activePopoverItemId === item.id && !isPreview;
            const yOffset = Math.max(
              2,
              Math.floor((Math.max(rowMinHeight, trackHeight) - itemHeight) / 2)
            );
            const msColor = milestoneDesign.color || '#f59e0b';

            return (
              <Rnd
                key={item.id}
                size={{
                  width: itemWidth,
                  height: itemHeight,
                }}
                position={{
                  x: xPos,
                  y: yOffset,
                }}
                dragAxis="x"
                bounds="parent"
                dragGrid={[colWidth, 0]}
                disableDragging={isPreview || Boolean(resizeView)}
                enableResizing={false}
                cancel=".resize-grip"
                className="group/item"
                onDragStop={(e, d) => {
                  // Only a real move should swallow the click that follows mouse-up.
                  if (Math.abs(d.x - xPos) > 1) {
                    lastInteractionRef.current = Date.now();
                    const newStartPeriod = Math.max(
                      1,
                      Math.min(
                        totalPeriods - clampedDuration + 1,
                        Math.round((d.x - barGap) / colWidth) + 1
                      )
                    );
                    if (newStartPeriod !== item.startPeriod) {
                      onUpdateTimelineItem(item.id, {
                        startPeriod: newStartPeriod,
                      });
                    }
                  }
                }}
                style={{
                  zIndex: isPopoverOpen ? 45 : 20,
                }}
              >
                <div
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  data-rnd-item="true"
                  data-testid={`timeline-item-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (Date.now() - lastInteractionRef.current < 250) return;
                    if (!isPreview) {
                      setActivePopoverItemId(
                        activePopoverItemId === item.id ? null : item.id
                      );
                    }
                  }}
                  className="w-full h-full relative flex items-center select-none group/item"
                >
                  {item.type === 'milestone' ? (
                    /* Isolated Milestone: rests on the RIGHT side of the selected period */
                    <div
                      className={`w-full h-full flex items-center justify-end relative px-1.5 rounded-xl transition-all ${
                        !isPreview ? 'hover:bg-slate-500/15 cursor-grab' : ''
                      } ${
                        isPopoverOpen
                          ? 'ring-2 ring-amber-400/70 bg-slate-900/40'
                          : ''
                      }`}
                    >
                      <span
                        data-export-text="true"
                        style={{
                          fontSize: `${Math.max(9.5, density.labelPx - 1)}px`,
                          backgroundColor:
                            tokens?.chipBg || 'rgba(15, 23, 42, 0.9)',
                          color: tokens?.textMain || '#ffffff',
                          border:
                            milestoneDesign.borderStyle === 'none'
                              ? `1px solid ${
                                  tokens?.chipBorder || 'rgba(51, 65, 85, 0.8)'
                                }`
                              : `1.5px ${milestoneDesign.borderStyle} ${
                                  msBorderColor
                                }`,
                          ...NO_WORD_BREAK,
                        }}
                        className={`mr-2 font-bold px-2 py-0.5 rounded-md shadow-sm leading-snug text-right min-w-0 ${labelWrap}`}
                      >
                        {nbHyphen(item.label || category.label)}
                      </span>

                      <div
                        className="h-0.5 w-2.5 shrink-0 rounded-full mr-1"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${msColor} 100%)`,
                        }}
                      />

                      <MilestoneMarker
                        milestoneDesign={milestoneDesign}
                        size={density.msSize}
                        effects={design.effects}
                        isLight={tokens?.isLight}
                        className="transition-transform group-hover/item:scale-110 mr-0.5"
                      />
                    </div>
                  ) : (
                    <div
                      className={`relative w-full h-full ${
                        !isPreview ? 'cursor-grab active:cursor-grabbing' : ''
                      }`}
                    >
                      {!isPreview &&
                        ['left', 'right'].map((side) => (
                          <span
                            key={side}
                            className="resize-grip absolute top-0 bottom-0 w-4 z-10 flex items-center justify-center cursor-ew-resize"
                            style={{ [side]: -6 }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              startResize(e, item, clampedStart, clampedDuration, side);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="block w-1.5 h-5 rounded-full bg-white ring-1 ring-black/40 shadow opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </span>
                        ))}
                      <BarVisual
                        label={item.label || category.label}
                        hasEndMilestone={Boolean(item.hasEndMilestone)}
                        category={category}
                        design={design}
                        tokens={tokens}
                        density={density}
                        duration={clampedDuration}
                        shortUnit={shortUnit}
                        isPopoverOpen={isPopoverOpen}
                        isPreview={isPreview}
                      />
                    </div>
                  )}

                  {isPopoverOpen && (
                    <TimelineItemPopover
                      getAnchorEl={() => itemRefs.current[item.id]}
                      item={item}
                      legend={legend}
                      milestoneDesign={milestoneDesign}
                      singularPeriod={singularPeriod}
                      clampedStart={clampedStart}
                      clampedDuration={clampedDuration}
                      onClose={() => setActivePopoverItemId(null)}
                      onUpdateTimelineItem={onUpdateTimelineItem}
                      onDeleteTimelineItem={onDeleteTimelineItem}
                    />
                  )}
                </div>
              </Rnd>
            );
          }
        )}
      </div>
    </div>
  );
}
