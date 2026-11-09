import { inputCls } from './navConfig';
import { Calendar } from 'lucide-react';
import { DATE_FORMATS } from '../../constants/designOptions';
import { PERIOD_TYPES } from '../../constants/themes';
import { formatDateWithPattern } from '../../utils/dateUtils';
import { OptionCard, FieldLabel } from './primitives';

export default function TimelineTab({ ctx }) {
  const {
    design,
    handlePeriodTypeChange,
    isCreatingNew,
    isPeriodLengthDisabled,
    name,
    panelTitle,
    periodLabel,
    previewPeriods,
    setName,
    setStartDate,
    setTotalPeriods,
    setWeeksPerPeriod,
    startDate,
    totalPeriods,
    updateDesign,
    weeksPerPeriod,
  } = ctx;

  return (
    <div className="space-y-5">
      {panelTitle(
        Calendar,
        'text-indigo-600 dark:text-indigo-400',
        'Timeline Cadence & Date Formatting'
      )}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        <div className="sm:col-span-7">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Roadmap Name
          </label>
          <input
            type="text"
            required
            autoFocus={isCreatingNew}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter roadmap name..."
            data-testid="config-roadmap-name"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Period Type Name
          </label>
          <select
            value={periodLabel}
            onChange={(e) => handlePeriodTypeChange(e.target.value)}
            data-testid="config-period-type"
            className={inputCls}
          >
            {PERIOD_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.value} (Default: {pt.defaultWeeks} {pt.defaultWeeks === 1 ? 'wk' : 'wks'})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            data-testid="config-start-date"
            aria-label="Start date"
            className={inputCls}
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Weeks per Period{' '}
            {isPeriodLengthDisabled && (
              <span className="text-[10px] font-normal text-slate-400">(Fixed)</span>
            )}
          </label>
          <input
            type="number"
            min={1}
            max={52}
            required
            disabled={isPeriodLengthDisabled}
            value={weeksPerPeriod}
            onChange={(e) => setWeeksPerPeriod(e.target.value)}
            data-testid="config-weeks-per-period"
            aria-label="Weeks per period"
            className={`${inputCls} ${
              isPeriodLengthDisabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Total Periods
          </label>
          <input
            type="number"
            min={1}
            max={36}
            required
            value={totalPeriods}
            onChange={(e) => setTotalPeriods(e.target.value)}
            data-testid="config-total-periods"
            aria-label="Number of periods"
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel>Date Format</FieldLabel>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
          {DATE_FORMATS.map((fmt) => (
            <OptionCard
              key={fmt.id}
              selected={design.dateFormat === fmt.id}
              onClick={() => updateDesign({ dateFormat: fmt.id })}
              testId={`date-format-${fmt.id}`}
              title={fmt.name}
            >
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {formatDateWithPattern(startDate, fmt.id)}
              </span>
              <span className="text-[9px] font-mono text-slate-400">{fmt.id}</span>
            </OptionCard>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="text-slate-600 dark:text-slate-300">
          <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
            Calculated Horizon:
          </span>{' '}
          {previewPeriods.length} {periodLabel} ({Number(weeksPerPeriod) * previewPeriods.length}{' '}
          weeks)
        </div>
        {previewPeriods.length > 0 && (
          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            {previewPeriods[0].title}: {previewPeriods[0].dateRange} →{' '}
            {previewPeriods[previewPeriods.length - 1].title}:{' '}
            {previewPeriods[previewPeriods.length - 1].dateRange}
          </div>
        )}
      </div>
    </div>
  );
}
