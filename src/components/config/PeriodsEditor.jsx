import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { getSingularPeriodLabel } from '../../constants/themes';
import {
  MAX_PERIOD_LABEL,
  MAX_PERIOD_WEEKS,
  applyBulkPeriods,
  patchPeriodOverride,
} from '../../utils/periodOverrides';
import { FieldLabel } from './primitives';
import { inputCls } from './navConfig';

const smallInput =
  'w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const applyBtn = 'rounded-lg bg-indigo-600 px-3 py-1 font-bold text-white hover:bg-indigo-500';
const num = (v) => Number(v) || 0;

/**
 * Names and lengths for every period, plus bulk tools. Works on the config modal's draft state:
 * `periodOverrides` / `weeksPerPeriod` are saved with the rest of the config.
 */
export default function PeriodsEditor({ ctx }) {
  const {
    periodLabel,
    periodOverrides,
    setPeriodOverrides,
    previewPeriods,
    totalPeriods,
    weeksPerPeriod,
    setWeeksPerPeriod,
  } = ctx;
  const [allWeeks, setAllWeeks] = useState('3');
  const [every, setEvery] = useState('3');
  const [offset, setOffset] = useState('3');
  const [everyWeeks, setEveryWeeks] = useState('1');

  const singular = getSingularPeriodLabel(periodLabel);
  const defaultWeeks = Math.max(1, Math.min(52, Number(weeksPerPeriod) || 2));
  const hasOverrides = Object.keys(periodOverrides || {}).length > 0;

  const applyBulk = (bulk) => {
    const next = applyBulkPeriods({ periodOverrides, totalPeriods, weeksPerPeriod }, bulk);
    if (next.periodOverrides) setPeriodOverrides(next.periodOverrides);
    if (next.weeksPerPeriod) setWeeksPerPeriod(next.weeksPerPeriod);
  };
  const patch = (index, change) =>
    setPeriodOverrides((cur) => patchPeriodOverride(cur, index, change));

  return (
    <div className="space-y-3" data-testid="periods-editor">
      <FieldLabel>Period names &amp; lengths</FieldLabel>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Rename a period or give it its own length. Later periods shift to follow, and bars stay on
        their periods. You can also click a period header on the roadmap.
      </p>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Set all periods to
          </span>
          <input
            type="number"
            min={1}
            max={MAX_PERIOD_WEEKS}
            value={allWeeks}
            onChange={(e) => setAllWeeks(e.target.value)}
            data-testid="periods-all-weeks"
            aria-label="Weeks for all periods"
            className={smallInput}
          />
          <span className="text-slate-600 dark:text-slate-400">weeks</span>
          <button
            type="button"
            data-testid="periods-all-apply"
            onClick={() => applyBulk({ mode: 'all', weeks: num(allWeeks) })}
            className={applyBtn}
          >
            Apply
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Every</span>
          <input
            type="number"
            min={1}
            max={52}
            value={every}
            onChange={(e) => setEvery(e.target.value)}
            data-testid="periods-every-n"
            aria-label="Every Nth period"
            className={smallInput}
          />
          <span className="text-slate-600 dark:text-slate-400">{singular}, starting at #</span>
          <input
            type="number"
            min={1}
            max={52}
            value={offset}
            onChange={(e) => setOffset(e.target.value)}
            data-testid="periods-every-offset"
            aria-label="First affected period"
            className={smallInput}
          />
          <span className="text-slate-600 dark:text-slate-400">is</span>
          <input
            type="number"
            min={1}
            max={MAX_PERIOD_WEEKS}
            value={everyWeeks}
            onChange={(e) => setEveryWeeks(e.target.value)}
            data-testid="periods-every-weeks"
            aria-label="Weeks for those periods"
            className={smallInput}
          />
          <span className="text-slate-600 dark:text-slate-400">weeks</span>
          <button
            type="button"
            data-testid="periods-every-apply"
            onClick={() =>
              applyBulk({
                mode: 'every',
                every: num(every),
                offset: num(offset),
                weeks: num(everyWeeks),
              })
            }
            className={applyBtn}
          >
            Apply
          </button>
        </div>

        <button
          type="button"
          data-testid="periods-reset-all"
          disabled={!hasOverrides}
          onClick={() => applyBulk({ mode: 'reset' })}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset all names and lengths
        </button>
      </div>

      <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1" data-testid="periods-list">
        {previewPeriods.map((p) => (
          <li key={p.index} className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-right font-mono text-[11px] text-slate-400">
              {p.index}
            </span>
            <input
              type="text"
              value={p.isCustomLabel ? p.title : ''}
              maxLength={MAX_PERIOD_LABEL}
              placeholder={`${singular} ${p.index}`}
              onChange={(e) => patch(p.index, { label: e.target.value })}
              data-testid={`period-name-${p.index}`}
              aria-label={`Name of period ${p.index}`}
              className={`${inputCls} min-w-0 flex-1 !py-1 text-xs`}
            />
            <input
              type="number"
              min={1}
              max={MAX_PERIOD_WEEKS}
              value={p.weeks}
              onChange={(e) =>
                patch(p.index, {
                  weeks: num(e.target.value) === defaultWeeks ? null : e.target.value,
                })
              }
              data-testid={`period-weeks-${p.index}`}
              aria-label={`Weeks in period ${p.index}`}
              className={`${smallInput} shrink-0`}
            />
            <span className="w-36 shrink-0 truncate text-[10px] text-slate-500 dark:text-slate-400">
              {p.shortRange}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
