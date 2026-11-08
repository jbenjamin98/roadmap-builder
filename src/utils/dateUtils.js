import { addDays, addWeeks, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { getSingularPeriodLabel } from '../constants/themes';
import { DATE_FORMATS } from '../constants/designOptions';

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

  const periods = [];
  for (let i = 0; i < totalPeriods; i++) {
    const periodNumber = i + 1;
    const periodStart = addWeeks(baseDate, i * weeksPerPeriod);
    const periodEnd = addDays(addWeeks(periodStart, weeksPerPeriod), -1);

    const startFormatted = formatDateWithPattern(periodStart, dateFormat);
    const endFormatted = formatDateWithPattern(periodEnd, dateFormat);
    const shortRange = `${format(periodStart, 'MMM d')} – ${format(periodEnd, 'MMM d')}`;
    const shortPrefix = singularLabel.slice(0, 1).toUpperCase();

    periods.push({
      index: periodNumber, // 1-based relative period index
      code: `${shortPrefix}${periodNumber}`,
      title: `${singularLabel} ${periodNumber}`,
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
