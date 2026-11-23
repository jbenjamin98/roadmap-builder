import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { getSingularPeriodLabel } from '../constants/themes';
import { DATE_FORMATS } from '../constants/designOptions';
import { normalizePeriodOverrides } from './periodOverrides';

/**
 * Safely parses a YYYY-MM-DD date string in local time without timezone drift.
 */
export function parseSafeDate(dateString) {
  if (!dateString) return new Date(2026, 10, 9);
  if (dateString instanceof Date && isValid(dateString)) return dateString;
  const parts = String(dateString).split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const localDate = new Date(year, month, day);
    if (isValid(localDate)) return localDate;
  }
  const parsed = parseISO(String(dateString));
  return isValid(parsed) ? parsed : new Date(2026, 10, 9);
}

/**
 * Formats a Date object or YYYY-MM-DD string using the selected dateFormat pattern.
 */
export function formatDateWithPattern(dateInput, pattern = 'MM/dd/yyyy') {
  const validPattern = DATE_FORMATS.some((f) => f.id === pattern) ? pattern : 'MM/dd/yyyy';
  const d = parseSafeDate(dateInput);
  try {
    return format(d, validPattern);
  } catch {
    return format(d, 'MM/dd/yyyy');
  }
}

/**
 * Generates metadata for each relative period (Period 1..N) including
 * formatted date ranges honoring config.design.dateFormat.
 */
export function calculatePeriods(config) {
  const totalPeriods = Math.max(1, Math.min(52, Number(config?.totalPeriods) || 8));
  const weeksPerPeriod = Math.max(1, Math.min(52, Number(config?.weeksPerPeriod) || 2));
  const baseDate = parseSafeDate(config?.startDate);
  const singularLabel = getSingularPeriodLabel(config?.periodLabel || 'Sprints');
  const dateFormat = config?.design?.dateFormat || config?.dateFormat || 'MM/dd/yyyy';

  const overrides = normalizePeriodOverrides(config?.periodOverrides);

  const periods = [];
  let offsetDays = 0; // periods are laid end to end, so a custom length shifts every later period
  for (let i = 0; i < totalPeriods; i++) {
    const periodNumber = i + 1;
    const override = overrides[String(periodNumber)];
    const weeks = override?.weeks ?? weeksPerPeriod;
    const periodStart = addDays(baseDate, offsetDays);
    const periodEnd = addDays(periodStart, weeks * 7 - 1);
    offsetDays += weeks * 7;

    const startFormatted = formatDateWithPattern(periodStart, dateFormat);
    const endFormatted = formatDateWithPattern(periodEnd, dateFormat);
    const shortRange = `${format(periodStart, 'MMM d')} – ${format(periodEnd, 'MMM d')}`;
    const shortPrefix = singularLabel.slice(0, 1).toUpperCase();

    periods.push({
      index: periodNumber, // 1-based relative period index
      code: `${shortPrefix}${periodNumber}`,
      title: override?.label || `${singularLabel} ${periodNumber}`,
      weeks,
      isCustomLength: weeks !== weeksPerPeriod,
      isCustomLabel: Boolean(override?.label),
      dateRange: `${startFormatted} - ${endFormatted}`,
      shortRange,
      startDate: startFormatted,
      endDate: endFormatted,
      rawStart: periodStart,
      rawEnd: periodEnd,
    });
  }

  return periods;
}

/**
 * Period length for header summaries: "2" when every period is the same, "1–2" when overrides
 * make them differ. `unit` is the matching word ("Week" / "Weeks").
 */
export function getPeriodLengthSummary(config) {
  const weeks = calculatePeriods(config).map((p) => p.weeks);
  const min = Math.min(...weeks);
  const max = Math.max(...weeks);
  return { text: min === max ? `${min}` : `${min}–${max}`, unit: max === 1 ? 'Week' : 'Weeks' };
}

/** Total length of the horizon in weeks, honouring per-period length overrides. */
export function getTotalWeeks(config) {
  return calculatePeriods(config).reduce((sum, p) => sum + p.weeks, 0);
}

/**
 * Computes fractional horizontal offset (0..1 across total horizon) for the Today marker line.
 * If today falls outside the horizon, clamps to a visible demo position or returns fraction.
 */
export function getTodayMarkerInfo(config, periods) {
  if (!periods || periods.length === 0) return null;
  const today = new Date();
  const idx = periods.findIndex(
    (p) =>
      differenceInCalendarDays(today, p.rawStart) >= 0 &&
      differenceInCalendarDays(p.rawEnd, today) >= 0
  );
  if (idx === -1) return { inRange: false, periodIndex: null };
  // periodIndex is 1-based; the marker sits on the RIGHT edge of that period's column.
  return { inRange: true, periodIndex: idx + 1 };
}
