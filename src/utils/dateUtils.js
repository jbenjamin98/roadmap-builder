import { addDays, addWeeks, format, isValid, parseISO } from 'date-fns';
import { getSingularPeriodLabel } from '../constants/themes';

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
 * Generates metadata for each relative period (Period 1..N) including
 * formatted date ranges (mm/dd/yyyy - mm/dd/yyyy).
 */
export function calculatePeriods(config) {
  const totalPeriods = Math.max(1, Math.min(52, Number(config?.totalPeriods) || 8));
  const weeksPerPeriod = Math.max(1, Math.min(52, Number(config?.weeksPerPeriod) || 2));
  const baseDate = parseSafeDate(config?.startDate);
  const singularLabel = getSingularPeriodLabel(config?.periodLabel || 'Sprints');

  const periods = [];
  for (let i = 0; i < totalPeriods; i++) {
    const periodNumber = i + 1;
    const periodStart = addWeeks(baseDate, i * weeksPerPeriod);
    const periodEnd = addDays(addWeeks(periodStart, weeksPerPeriod), -1);

    const startFormatted = format(periodStart, 'MM/dd/yyyy');
    const endFormatted = format(periodEnd, 'MM/dd/yyyy');
    const shortRange = `${format(periodStart, 'MMM d')} – ${format(periodEnd, 'MMM d')}`;

    periods.push({
      index: periodNumber, // 1-based relative period index
      title: `${singularLabel} ${periodNumber}`,
      dateRange: `${startFormatted} - ${endFormatted}`,
      shortRange,
      startDate: startFormatted,
      endDate: endFormatted,
    });
  }

  return periods;
}
