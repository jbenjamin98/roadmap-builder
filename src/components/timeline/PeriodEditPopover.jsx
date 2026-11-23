import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X } from 'lucide-react';
import { MAX_PERIOD_LABEL, MAX_PERIOD_WEEKS } from '../../utils/periodOverrides';

const fieldClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white';

/**
 * Small popover anchored under a period header: rename the period, change its length in weeks, or
 * apply that length to every Nth period from here. Edits are live and undoable (coalesced).
 */
export default function PeriodEditPopover({
  period,
  defaultTitle,
  defaultWeeks,
  getAnchorEl,
  onUpdatePeriod,
  onBulkPeriods,
  onClose,
}) {
  const popoverRef = useRef(null);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });
  const [label, setLabel] = useState(period.isCustomLabel ? period.title : '');
  const [weeks, setWeeks] = useState(String(period.weeks));
  const [every, setEvery] = useState('3');

  useLayoutEffect(() => {
    const place = () => {
      const anchor = getAnchorEl();
      const pop = popoverRef.current;
      if (!anchor || !pop) return;
      const a = anchor.getBoundingClientRect();
      const p = pop.getBoundingClientRect();
      const margin = 12;
      const top = Math.min(a.bottom + 8, Math.max(margin, window.innerHeight - p.height - margin));
      const left = Math.max(margin, Math.min(a.left, window.innerWidth - p.width - margin));
      setCoords({ top, left });
    };
    place();
    const raf = requestAnimationFrame(place);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [getAnchorEl, period.index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    const onDown = (e) => {
      const anchor = getAnchorEl();
      if (popoverRef.current?.contains(e.target) || anchor?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [getAnchorEl, onClose]);

  const parsedWeeks = Number(weeks);
  const weeksValid =
    Number.isInteger(parsedWeeks) && parsedWeeks >= 1 && parsedWeeks <= MAX_PERIOD_WEEKS;

  const changeLabel = (value) => {
    setLabel(value);
    onUpdatePeriod(period.index, { label: value });
  };
  const changeWeeks = (value) => {
    setWeeks(value);
    const n = Number(value);
    if (Number.isInteger(n) && n >= 1 && n <= MAX_PERIOD_WEEKS) {
      // Same as the default length means "no override".
      onUpdatePeriod(period.index, { weeks: n === defaultWeeks ? null : n });
    }
  };
  const reset = () => {
    onUpdatePeriod(period.index, { label: '', weeks: null });
    setLabel('');
    setWeeks(String(defaultWeeks));
  };
  const everyN = Math.max(1, Math.min(52, Math.round(Number(every) || 1)));

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Edit ${period.title}`}
      data-testid="period-edit-popover"
      style={{ top: coords.top, left: coords.left }}
      className="fixed z-[400] w-72 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold">Edit period {period.index}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
        Name
        <input
          type="text"
          data-testid="period-edit-name"
          autoFocus
          value={label}
          maxLength={MAX_PERIOD_LABEL}
          placeholder={defaultTitle}
          onChange={(e) => changeLabel(e.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="mt-3 block text-xs font-semibold text-slate-600 dark:text-slate-300">
        Length (weeks)
        <input
          type="number"
          data-testid="period-edit-weeks"
          min={1}
          max={MAX_PERIOD_WEEKS}
          value={weeks}
          onChange={(e) => changeWeeks(e.target.value)}
          aria-invalid={!weeksValid}
          className={fieldClass}
        />
      </label>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {weeksValid
          ? `${period.startDate} – ${period.endDate}. Later periods shift to follow.`
          : `Enter a whole number from 1 to ${MAX_PERIOD_WEEKS}.`}
      </p>

      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          Apply this length to every
          <input
            type="number"
            min={1}
            max={52}
            value={every}
            data-testid="period-edit-every"
            onChange={(e) => setEvery(e.target.value)}
            className="mx-1.5 w-14 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-800"
          />
          period, starting here
        </p>
        <button
          type="button"
          data-testid="period-edit-apply-every"
          disabled={!weeksValid}
          onClick={() =>
            onBulkPeriods({
              mode: 'every',
              every: everyN,
              offset: period.index,
              weeks: parsedWeeks,
            })
          }
          className="mt-2 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <button
        type="button"
        data-testid="period-edit-reset"
        onClick={reset}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Reset name and length
      </button>
    </div>,
    document.body
  );
}
