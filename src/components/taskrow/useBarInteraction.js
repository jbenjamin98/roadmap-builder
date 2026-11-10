import { useState, useEffect, useRef } from 'react';

export function computeResize(base, steps, totalPeriods) {
  const rightEdge = base.start + base.duration - 1;
  if (base.side === 'left') {
    const start = Math.max(1, Math.min(rightEdge, base.start + steps));
    return { start, duration: rightEdge - start + 1 };
  }
  const duration = Math.max(1, Math.min(totalPeriods - base.start + 1, base.duration + steps));
  return { start: base.start, duration };
}

export function useBarInteraction({
  taskId,
  taskTitle,
  totalPeriods,
  colWidth,
  legend,
  isPreview,
  isPopoverOpen = false,
  setActivePopoverItemId,
  onAddTimelineItem,
  onUpdateTimelineItem,
}) {
  const [drawStart, setDrawStart] = useState(null);
  const [drawCurrent, setDrawCurrent] = useState(null);
  const lastInteractionRef = useRef(0);
  const latestResizeRef = useRef(null);
  const [resizeView, setResizeView] = useState(null);

  useEffect(() => {
    if (drawStart === null) return undefined;
    const handleGlobalPointerUp = () => {
      if (drawStart !== null && drawCurrent !== null) {
        const startPeriod = Math.min(drawStart, drawCurrent);
        const endPeriod = Math.max(drawStart, drawCurrent);
        const duration = Math.max(1, endPeriod - startPeriod + 1);
        const createdId = onAddTimelineItem({
          taskId,
          startPeriod,
          duration,
          type: 'bar',
          legendId: legend[0]?.id,
          label: taskTitle,
          hasEndMilestone: false,
        });
        if (createdId) {
          setTimeout(() => setActivePopoverItemId(createdId), 0);
        }
      }
      setDrawStart(null);
      setDrawCurrent(null);
    };

    const handlePointerMove = (e) => {
      if (e.pointerType === 'mouse') return;
      const cell = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest(`[data-cell-task="${taskId}"]`);
      const index = cell ? Number(cell.dataset.periodIndex) : null;
      if (index) setDrawCurrent(index);
    };

    const handleCancel = () => {
      setDrawStart(null);
      setDrawCurrent(null);
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointercancel', handleCancel);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointercancel', handleCancel);
    };
  }, [
    drawStart,
    drawCurrent,
    taskId,
    taskTitle,
    legend,
    onAddTimelineItem,
    setActivePopoverItemId,
  ]);

  const startResize = (e, item, start, duration, side) => {
    setResizeView({
      id: item.id,
      side,
      startX: e.clientX,
      start,
      duration,
      steps: 0,
      deltaX: 0,
    });
    setActivePopoverItemId(null);
  };

  useEffect(() => {
    latestResizeRef.current = resizeView;
  }, [resizeView]);

  const isResizing = Boolean(resizeView);
  useEffect(() => {
    if (!isResizing) return undefined;
    document.body.classList.add('is-resizing-horizontal');
    let rafId = null;

    const onMove = (e) => {
      const clientX = e.clientX;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setResizeView((prev) =>
          prev
            ? {
                ...prev,
                deltaX: clientX - prev.startX,
                steps: Math.round((clientX - prev.startX) / colWidth),
              }
            : prev
        );
      });
    };
    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove('is-resizing-horizontal');
      const base = latestResizeRef.current;
      const didMove = Math.abs(base?.deltaX || 0) > 4;
      if (didMove) {
        lastInteractionRef.current = Date.now();
      }
      if (base) {
        const steps = Math.round((base.deltaX || 0) / colWidth);
        if (steps !== 0) {
          const r = computeResize(base, steps, totalPeriods);
          onUpdateTimelineItem(base.id, {
            startPeriod: r.start,
            duration: r.duration,
          });
        }
      }
      setResizeView(null);
    };
    const onCancel = () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove('is-resizing-horizontal');
      setResizeView(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.body.classList.remove('is-resizing-horizontal');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [isResizing, colWidth, totalPeriods, onUpdateTimelineItem]);

  const handleCellPointerDown = (e, periodIndex) => {
    if (isPreview) return;
    if (e.button !== 0) return;
    if (
      e.target.closest('[data-rnd-item="true"]') ||
      e.target.closest('[data-item-popover="true"]')
    ) {
      return;
    }
    // While a bar's popover is open, a press on a cell only dismisses it. Starting a draw here
    // would create a new bar on pointer-up, which users then have to delete.
    if (isPopoverOpen) {
      setActivePopoverItemId(null);
      return;
    }
    setActivePopoverItemId(null);
    setDrawStart(periodIndex);
    setDrawCurrent(periodIndex);
  };

  const handleCellPointerEnter = (periodIndex) => {
    if (drawStart !== null) {
      setDrawCurrent(periodIndex);
    }
  };

  const drawRange =
    drawStart !== null && drawCurrent !== null
      ? {
          start: Math.min(drawStart, drawCurrent),
          end: Math.max(drawStart, drawCurrent),
        }
      : null;

  return {
    drawRange,
    resizeView,
    lastInteractionRef,
    handleCellPointerDown,
    handleCellPointerEnter,
    startResize,
  };
}
