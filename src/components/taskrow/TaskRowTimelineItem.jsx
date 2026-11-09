import { useState } from 'react';
import { Rnd } from 'react-rnd';
import MilestoneMarker from '../MilestoneMarker';
import { BarVisual } from '../StyleParts';
import { NO_WORD_BREAK, nbHyphen } from '../styleHelpers';
import TimelineItemPopover from './TimelineItemPopover';

export default function TaskRowTimelineItem({
  metric,
  getAnchorEl,
  itemRefCallback,
  isPopoverOpen,
  trackHeight,
  rowMinHeight,
  milestoneDesign,
  msBorderColor,
  totalPeriods,
  colWidth,
  barGap,
  isPreview,
  isResizing,
  resizingSide,
  resizeTension = 0,
  lastInteractionRef,
  design,
  tokens,
  density,
  shortUnit,
  labelWrap,
  legend,
  singularPeriod,
  onStartResize,
  onBarDragStart,
  onBarDragMove,
  onBarDragEnd,
  onUpdateTimelineItem,
  onDeleteTimelineItem,
  onTogglePopover,
  onClosePopover,
}) {
  const { item, category, clampedStart, clampedDuration, xPos, itemWidth, itemHeight } = metric;
  const [hoveredEnd, setHoveredEnd] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  const isActiveBar = isResizing || isMoving;
  const activeSide = isResizing ? resizingSide : isMoving || isPopoverOpen ? null : hoveredEnd;

  const yOffset = Math.max(2, Math.floor((Math.max(rowMinHeight, trackHeight) - itemHeight) / 2));
  const msColor = milestoneDesign.color || '#f59e0b';
  const primaryColor = tokens?.primary || '#6366f1';
  const accentColor = tokens?.accents?.[0] || primaryColor;
  const ringColor =
    primaryColor.startsWith('#') && primaryColor.length === 7 ? `${primaryColor}66` : primaryColor;

  return (
    <Rnd
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
      disableDragging={isPreview || isResizing}
      enableResizing={false}
      cancel=".resize-grip"
      className={`group/item ${isActiveBar ? 'is-active-bar' : ''}`}
      onDragStart={(e, d) => {
        setIsMoving(true);
        setHoveredEnd(null);
        document.body.classList.add('is-resizing-horizontal');
        const targetStart = Math.max(
          1,
          Math.min(totalPeriods - clampedDuration + 1, Math.round((d.x - barGap) / colWidth) + 1)
        );
        onBarDragStart?.({
          start: targetStart,
          end: targetStart + clampedDuration - 1,
          itemId: item.id,
        });
      }}
      onDrag={(e, d) => {
        const targetStart = Math.max(
          1,
          Math.min(totalPeriods - clampedDuration + 1, Math.round((d.x - barGap) / colWidth) + 1)
        );
        onBarDragMove?.({
          start: targetStart,
          end: targetStart + clampedDuration - 1,
          itemId: item.id,
        });
      }}
      onDragStop={(e, d) => {
        setIsMoving(false);
        document.body.classList.remove('is-resizing-horizontal');
        onBarDragEnd?.();
        if (e && typeof e.clientX === 'number') {
          const barEl = e.target?.closest?.('[data-rnd-item="true"]');
          if (barEl) {
            const rect = barEl.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const endThreshold = Math.min(48, Math.max(28, rect.width * 0.3));
            if (x <= endThreshold) setHoveredEnd('left');
            else if (x >= rect.width - endThreshold) setHoveredEnd('right');
          }
        }
        if (Math.abs(d.x - xPos) > 1) {
          lastInteractionRef.current = Date.now();
          const newStartPeriod = Math.max(
            1,
            Math.min(totalPeriods - clampedDuration + 1, Math.round((d.x - barGap) / colWidth) + 1)
          );
          if (newStartPeriod !== item.startPeriod) {
            onUpdateTimelineItem(item.id, {
              startPeriod: newStartPeriod,
            });
          }
        }
      }}
      style={{
        zIndex: isPopoverOpen ? 60 : isResizing ? 45 : 20,
      }}
    >
      <div
        ref={itemRefCallback}
        data-rnd-item="true"
        data-testid={`timeline-item-${item.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (Date.now() - lastInteractionRef.current < 250) return;
          if (!isPreview) {
            onTogglePopover();
          }
        }}
        className={`w-full h-full relative flex items-center select-none group/item ${
          isActiveBar ? 'is-active-bar' : ''
        }`}
      >
        {item.type === 'milestone' ? (
          <div
            className={`w-full h-full flex items-center justify-end relative px-1.5 rounded-xl transition-all ${
              !isPreview ? 'hover:bg-slate-500/15 cursor-grab' : ''
            } ${isPopoverOpen ? 'ring-2 ring-amber-400/70 bg-slate-900/40' : ''}`}
          >
            <span
              data-export-text="true"
              style={{
                fontSize: `${Math.max(9.5, density.labelPx - 1)}px`,
                backgroundColor: tokens?.chipBg || 'rgba(15, 23, 42, 0.9)',
                color: tokens?.textMain || '#ffffff',
                border:
                  milestoneDesign.borderStyle === 'none'
                    ? `1px solid ${tokens?.chipBorder || 'rgba(51, 65, 85, 0.8)'}`
                    : `1.5px ${milestoneDesign.borderStyle} ${msBorderColor}`,
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
            } ${isActiveBar ? 'is-active-bar' : ''}`}
            onPointerMove={(e) => {
              if (
                isPreview ||
                isMoving ||
                (typeof document !== 'undefined' &&
                  document.body.classList.contains('is-resizing-horizontal') &&
                  !isActiveBar)
              )
                return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const width = rect.width;
              if (width <= 60) {
                setHoveredEnd(x < width / 2 ? 'left' : 'right');
                return;
              }
              const endThreshold = Math.min(48, Math.max(28, width * 0.3));
              if (x <= endThreshold) {
                setHoveredEnd('left');
              } else if (x >= width - endThreshold) {
                setHoveredEnd('right');
              } else {
                setHoveredEnd(null);
              }
            }}
            onPointerLeave={() => {
              if (!isResizing) {
                setHoveredEnd(null);
              }
            }}
          >
            {!isPreview &&
              ['left', 'right'].map((side) => {
                const isDragging = resizingSide === side;
                const tension = isDragging ? resizeTension : 0;
                return (
                  <span
                    key={side}
                    className={`resize-grip grip-${side} group/grip absolute top-0 bottom-0 z-30 select-none touch-none overflow-visible ${
                      isDragging ? 'is-dragging z-40' : ''
                    }`}
                    style={{
                      [side]: -28,
                      width: 56,
                      '--handle-theme': primaryColor,
                      '--handle-accent': accentColor,
                      '--handle-theme-ring': ringColor,
                      '--drag-tension': tension,
                      transform: side === 'left' ? 'scaleX(-1)' : undefined,
                      transformOrigin: '28px center',
                    }}
                    onPointerEnter={() => {
                      if (
                        !isPreview &&
                        typeof document !== 'undefined' &&
                        !document.body.classList.contains('is-resizing-horizontal')
                      ) {
                        setHoveredEnd(side);
                      }
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setHoveredEnd(side);
                      onStartResize(e, side);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-full h-full relative pointer-events-none"
                      style={{ color: primaryColor }}
                    >
                      {/* Upper corner bracket at actual top corner of the task bar (refined compact scale) */}
                      <svg
                        width="56"
                        height="16"
                        viewBox="0 0 56 16"
                        fill="none"
                        className={`corner-bracket-svg absolute top-0 left-0 overflow-visible transition-opacity duration-150 ${
                          isResizing || isMoving || activeSide === side
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/item:opacity-100'
                        }`}
                      >
                        <path
                          d="M 17 1.5 H 28 V 9.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="corner-bracket-top"
                        />
                      </svg>

                      {/* Center handle: Refined boundary line + Bold triangle (compact & elegant) */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 left-0 w-full h-8 flex items-center handle-center transition-opacity duration-150 ${
                          activeSide === side ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <svg
                          width="56"
                          height="32"
                          viewBox="0 0 56 32"
                          fill="none"
                          className="pull-handle-svg overflow-visible"
                        >
                          {/* Vertical line on the outside of the task bar (6px spacing from bar edge) */}
                          <line
                            x1="34"
                            y1="7"
                            x2="34"
                            y2="25"
                            stroke="currentColor"
                            strokeWidth="2.75"
                            strokeLinecap="round"
                            className="boundary-line"
                          />
                          {/* Outward triangle (18px tall, 10px wide, 6px spacing from line) */}
                          <polygon
                            points="40,7 50,16 40,25"
                            fill="currentColor"
                            className="bold-triangle"
                          />
                        </svg>
                      </div>

                      {/* Lower corner bracket at actual bottom corner of the task bar (refined compact scale) */}
                      <svg
                        width="56"
                        height="16"
                        viewBox="0 0 56 16"
                        fill="none"
                        className={`corner-bracket-svg absolute bottom-0 left-0 overflow-visible transition-opacity duration-150 ${
                          isResizing || isMoving || activeSide === side
                            ? 'opacity-100'
                            : 'opacity-0 group-hover/item:opacity-100'
                        }`}
                      >
                        <path
                          d="M 17 14.5 H 28 V 6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="corner-bracket-bottom"
                        />
                      </svg>
                    </div>
                  </span>
                );
              })}
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
            getAnchorEl={getAnchorEl}
            item={item}
            legend={legend}
            milestoneDesign={milestoneDesign}
            singularPeriod={singularPeriod}
            clampedStart={clampedStart}
            clampedDuration={clampedDuration}
            onClose={onClosePopover}
            onUpdateTimelineItem={onUpdateTimelineItem}
            onDeleteTimelineItem={onDeleteTimelineItem}
          />
        )}
      </div>
    </Rnd>
  );
}
