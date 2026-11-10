import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { getSingularPeriodLabel } from '../constants/themes';
import { getDensity, normalizeDesign } from '../constants/designOptions';
import { getBrandAccent } from '../constants/brandThemes';
import { LevelLabel, NumBadge } from './StyleParts';
import {
  INDENT,
  INDENT_SPINE,
  NO_WORD_BREAK,
  nbHyphen,
  resolveMilestoneDesign,
} from './styleHelpers';
import estimateItemHeight from './taskrow/estimateItemHeight';
import TaskRowTimelineItem from './taskrow/TaskRowTimelineItem';
import { useBarInteraction } from './taskrow/useBarInteraction';
import CellDragHighlight from './taskrow/CellDragHighlight';

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
  const [dragOverPeriod, setDragOverPeriod] = useState(null);
  const [moveHover, setMoveHover] = useState(null);
  const itemRefs = useRef({});
  const taskTextareaRef = useRef(null);
  const trackRef = useRef(null);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    if (!moveHover) return undefined;
    const handleUp = () => setMoveHover(null);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [moveHover]);

  const handleBarDragStart = useCallback((range) => {
    setMoveHover(range);
  }, []);

  const handleBarDragMove = useCallback((range) => {
    setMoveHover((prev) => {
      if (
        prev &&
        prev.start === range.start &&
        prev.end === range.end &&
        prev.itemId === range.itemId
      ) {
        return prev;
      }
      return range;
    });
  }, []);

  const handleBarDragEnd = useCallback(() => {
    setMoveHover(null);
  }, []);

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

  const {
    drawRange,
    resizeView,
    lastInteractionRef,
    handleCellPointerDown,
    handleCellPointerEnter,
    startResize,
  } = useBarInteraction({
    taskId: task.id,
    taskTitle: task.title,
    totalPeriods,
    colWidth,
    legend,
    isPreview,
    isPopoverOpen: activePopoverItemId != null,
    setActivePopoverItemId,
    onAddTimelineItem,
    onUpdateTimelineItem,
  });

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

  const isOddRow = alternateRowHighlighting && rowIndex % 2 === 1;
  const rowBgColor = isOddRow
    ? tokens?.rowBgOdd || 'rgba(15, 23, 42, 0.45)'
    : tokens?.rowBgEven || 'rgba(2, 6, 23, 0.25)';
  const stickyCellBg = isOddRow ? tokens?.stickyAltBg || '#0f172a' : tokens?.stickyBg || '#020617';
  const gridBorderColor = subtleGridDemarcations
    ? tokens?.gridSubtle || 'rgba(30, 41, 59, 0.65)'
    : 'transparent';

  const itemMetrics = items.map((item) => {
    const category = legend.find((l) => l.id === item.legendId) ||
      legend[0] || {
        id: 'default',
        label: 'General',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        hasBorder: false,
        borderColor: '#ffffff',
      };

    const baseStart = Math.max(1, Math.min(totalPeriods, Number(item.startPeriod) || 1));
    const maxPossibleDuration = Math.max(1, totalPeriods - baseStart + 1);
    const baseDuration = Math.max(1, Math.min(maxPossibleDuration, Number(item.duration) || 1));
    let clampedStart = baseStart;
    let clampedDuration = baseDuration;

    let xPos = (clampedStart - 1) * colWidth + barGap;
    let itemWidth = clampedDuration * colWidth - barGap * 2;
    let resizeTension = 0;

    if (resizeView && resizeView.id === item.id) {
      const rawDeltaX = resizeView.deltaX || 0;
      // Butter-smooth continuous elasticity with gentle magnetic detents (no stutter)
      const phase = (2 * Math.PI * rawDeltaX) / colWidth;
      // Gentle 10% detent depth ensures fluid, stutter-free movement (speed varies only 90%-110%)
      const elasticDeltaX = rawDeltaX - (colWidth / (2 * Math.PI)) * 0.1 * Math.sin(phase);

      const offsetFromCol = rawDeltaX - Math.round(rawDeltaX / colWidth) * colWidth;
      const halfCol = colWidth * 0.5;
      const normOffset = halfCol > 0 ? Math.max(-1, Math.min(1, offsetFromCol / halfCol)) : 0;
      resizeTension = resizeView.side === 'left' ? -normOffset : normOffset;

      const otherBars = items.filter((o) => o.type === 'bar' && o.id !== item.id);
      const baseX = (baseStart - 1) * colWidth + barGap;
      const baseWidth = baseDuration * colWidth - barGap * 2;
      const baseRight = baseX + baseWidth;

      if (resizeView.side === 'right') {
        const nextBar = otherBars
          .filter((o) => o.startPeriod > baseStart + baseDuration - 1)
          .sort((a, b) => a.startPeriod - b.startPeriod)[0];
        const maxRightPx = nextBar
          ? (nextBar.startPeriod - 1) * colWidth - barGap
          : totalPeriods * colWidth - barGap;
        const minWidth = Math.min(baseWidth, colWidth - barGap * 2);
        xPos = baseX;

        const maxAllowedWidth = maxRightPx - baseX;
        let candidateWidth = baseWidth + elasticDeltaX;
        if (candidateWidth > maxAllowedWidth) {
          const over = candidateWidth - maxAllowedWidth;
          candidateWidth = maxAllowedWidth + Math.pow(Math.max(0, over), 0.7) * 2;
        } else if (candidateWidth < minWidth) {
          const under = minWidth - candidateWidth;
          candidateWidth = minWidth - Math.pow(Math.max(0, under), 0.7) * 2;
        }
        itemWidth = Math.max(16, candidateWidth);
        clampedDuration = Math.max(
          1,
          Math.min(
            totalPeriods - baseStart + 1,
            Math.max(1, baseDuration + Math.round(elasticDeltaX / colWidth))
          )
        );
      } else if (resizeView.side === 'left') {
        const prevBar = otherBars
          .filter((o) => o.startPeriod + o.duration - 1 < baseStart)
          .sort((a, b) => b.startPeriod - a.startPeriod)[0];
        const minLeftPx = prevBar
          ? (prevBar.startPeriod + prevBar.duration - 1) * colWidth + barGap
          : barGap;
        const minWidth = Math.min(baseWidth, colWidth - barGap * 2);
        const maxLeftPx = baseRight - minWidth;

        let candidateLeft = baseX + elasticDeltaX;
        if (candidateLeft < minLeftPx) {
          const under = minLeftPx - candidateLeft;
          candidateLeft = minLeftPx - Math.pow(Math.max(0, under), 0.7) * 2;
        } else if (candidateLeft > maxLeftPx) {
          const over = candidateLeft - maxLeftPx;
          candidateLeft = maxLeftPx + Math.pow(Math.max(0, over), 0.7) * 2;
        }
        xPos = candidateLeft;
        itemWidth = Math.max(16, baseRight - xPos);
        clampedStart = Math.max(
          1,
          Math.min(baseStart + baseDuration - 1, baseStart + Math.round(elasticDeltaX / colWidth))
        );
        clampedDuration = Math.max(1, baseStart + baseDuration - clampedStart);
      }
    }
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
      resizeTension,
    };
  });

  let resizeTargetPeriod = null;
  if (resizeView) {
    const resizingMetric = itemMetrics.find((m) => m.item.id === resizeView.id);
    if (resizingMetric) {
      if (resizeView.side === 'right') {
        const rightEdgeX = resizingMetric.xPos + resizingMetric.itemWidth;
        resizeTargetPeriod = Math.max(
          1,
          Math.min(totalPeriods, Math.floor(rightEdgeX / colWidth) + 1)
        );
      } else if (resizeView.side === 'left') {
        resizeTargetPeriod = Math.max(
          1,
          Math.min(totalPeriods, Math.floor(resizingMetric.xPos / colWidth) + 1)
        );
      }
    }
  }

  const resizingMetric = resizeView ? itemMetrics.find((m) => m.item.id === resizeView.id) : null;
  const movingItem = moveHover ? items.find((i) => i.id === moveHover.itemId) : null;
  const movingCategory = movingItem ? legend.find((l) => l.id === movingItem.legendId) : null;
  const activeHighlightColor =
    resizingMetric?.category?.color ||
    movingCategory?.color ||
    sectionAccent ||
    tokens?.primary ||
    '#6366f1';

  const maxBarHeight = itemMetrics.reduce(
    (maxH, m) => Math.max(maxH, m.itemHeight),
    density.itemMin
  );
  const verticalSlack = density.singleLine ? Math.min(8, density.vSlack) : density.vSlack;
  const rowMinHeight = Math.max(density.rowMin, maxBarHeight + verticalSlack);
  const accentDotColor =
    getBrandAccent(design?.brandTheme) || sectionAccent || tokens?.primary || '#6366f1';
  const labelWrap = density.singleLine ? 'truncate whitespace-nowrap' : 'whitespace-normal wrap-ok';

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
          duckMode={Boolean(design?.duckMode)}
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
            drawRange && period.index >= drawRange.start && period.index <= drawRange.end;
          const isDropTarget = dragOverPeriod === period.index;
          const isAltCol = design.alternateColumnShading && period.index % 2 === 0;

          const isResizeTarget = resizeTargetPeriod === period.index;
          const isMoveTarget = Boolean(
            moveHover && period.index >= moveHover.start && period.index <= moveHover.end
          );
          const isDragTargetCell = isResizeTarget || isMoveTarget;

          return (
            <div
              key={period.index}
              onPointerDown={(e) => handleCellPointerDown(e, period.index)}
              onPointerEnter={() => handleCellPointerEnter(period.index)}
              onDragOver={(e) => handleCellDragOver(e, period.index)}
              onDragLeave={() => setDragOverPeriod(null)}
              onDrop={(e) => handleCellDrop(e, period.index)}
              style={{
                width: `${colWidth}px`,
                borderColor: gridBorderColor,
                backgroundColor: isAltCol ? tokens?.colShadeBg : undefined,
                touchAction: isPreview ? undefined : 'pan-y',
              }}
              data-testid={`cell-${task.id}-${period.index}`}
              data-cell-task={task.id}
              data-period-index={period.index}
              className={`h-full relative border-r ${
                !isPreview ? 'cursor-crosshair hover:bg-indigo-500/[0.05]' : ''
              } ${isBeingDrawn ? 'bg-indigo-500/15' : ''} ${
                isDropTarget ? 'bg-amber-500/20 ring-2 ring-inset ring-amber-400/60' : ''
              }`}
              title={
                !isPreview
                  ? `Click & drag to draw bar in ${period.title}, or drop a Milestone`
                  : undefined
              }
            >
              {isDragTargetCell && (
                <CellDragHighlight
                  color={activeHighlightColor}
                  testId={`drag-target-highlight-${period.index}`}
                />
              )}

              {!isPreview && items.length === 0 && period.index === 1 && !drawRange && (
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
              width: `${(drawRange.end - drawRange.start + 1) * colWidth - barGap * 2}px`,
            }}
          >
            <span className="whitespace-nowrap">
              {singularPeriod} {drawRange.start}
              {drawRange.end > drawRange.start ? ` – ${drawRange.end}` : ''} (
              {drawRange.end - drawRange.start + 1}{' '}
              {drawRange.end - drawRange.start + 1 === 1 ? 'period' : 'periods'})
            </span>
          </div>
        )}

        {/* Rendered Timeline Items (Bars & Milestones) via react-rnd */}
        {itemMetrics.map((metric) => {
          const isPopoverOpen = activePopoverItemId === metric.item.id && !isPreview;
          return (
            <TaskRowTimelineItem
              key={metric.item.id}
              metric={metric}
              getAnchorEl={() => itemRefs.current[metric.item.id]}
              itemRefCallback={(el) => {
                itemRefs.current[metric.item.id] = el;
              }}
              isPopoverOpen={isPopoverOpen}
              trackHeight={trackHeight}
              rowMinHeight={rowMinHeight}
              milestoneDesign={milestoneDesign}
              msBorderColor={msBorderColor}
              totalPeriods={totalPeriods}
              colWidth={colWidth}
              barGap={barGap}
              isPreview={isPreview}
              isResizing={resizeView?.id === metric.item.id}
              resizingSide={resizeView?.id === metric.item.id ? resizeView.side : null}
              resizeTension={metric.resizeTension || 0}
              lastInteractionRef={lastInteractionRef}
              design={design}
              tokens={tokens}
              density={density}
              shortUnit={shortUnit}
              labelWrap={labelWrap}
              legend={legend}
              singularPeriod={singularPeriod}
              onStartResize={(e, side) =>
                startResize(e, metric.item, metric.clampedStart, metric.clampedDuration, side)
              }
              onBarDragStart={handleBarDragStart}
              onBarDragMove={handleBarDragMove}
              onBarDragEnd={handleBarDragEnd}
              onUpdateTimelineItem={onUpdateTimelineItem}
              onDeleteTimelineItem={onDeleteTimelineItem}
              onTogglePopover={() => setActivePopoverItemId(isPopoverOpen ? null : metric.item.id)}
              onClosePopover={() => setActivePopoverItemId(null)}
            />
          );
        })}
      </div>
    </div>
  );
}
