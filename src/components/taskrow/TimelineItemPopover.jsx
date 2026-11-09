import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Tag, X, Check } from 'lucide-react';
import { getCategoryBackground } from '../canvasStyles';
import MilestoneMarker from '../MilestoneMarker';

export default function TimelineItemPopover({
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

  // Escape closes the popover (it is a small non-modal dialog; focus is not trapped).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      ref={popoverRef}
      data-item-popover="true"
      data-testid="timeline-item-popover"
      role="dialog"
      aria-label="Item settings"
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
          aria-label="Close item settings"
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
          onChange={(e) => onUpdateTimelineItem(item.id, { label: e.target.value })}
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
                    onClick={() => onUpdateTimelineItem(item.id, { legendId: cat.id })}
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
          {clampedDuration > 1 ? `–${clampedStart + clampedDuration - 1}` : ''}
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
