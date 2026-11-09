import { describe, expect, it } from 'vitest';
import { calculatePeriods, formatDateWithPattern, parseSafeDate } from './dateUtils';

describe('parseSafeDate', () => {
  it('parses YYYY-MM-DD', () => {
    const d = parseSafeDate('2026-03-02');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 2, 2]);
  });

  it('falls back to a valid date on garbage input', () => {
    expect(Number.isNaN(parseSafeDate('nope').getTime())).toBe(false);
  });
});

describe('formatDateWithPattern', () => {
  it('formats with a supported pattern', () => {
    expect(formatDateWithPattern('2026-03-02', 'MM/dd/yyyy')).toBe('03/02/2026');
  });

  it('falls back to the default pattern when unsupported', () => {
    expect(formatDateWithPattern('2026-03-02', 'not-a-pattern')).toBe('03/02/2026');
  });
});

describe('calculatePeriods', () => {
  const config = {
    startDate: '2026-01-05',
    weeksPerPeriod: 2,
    totalPeriods: 3,
    periodLabel: 'Sprints',
  };

  it('returns totalPeriods contiguous periods', () => {
    const periods = calculatePeriods(config);
    expect(periods).toHaveLength(3);
    expect(periods.map((p) => p.index)).toEqual([1, 2, 3]);
    expect(periods[0].title).toBe('Sprint 1');
    expect(periods[0].code).toBe('S1');
  });

  it('makes each period end the day before the next starts', () => {
    const [p1, p2] = calculatePeriods(config);
    const dayMs = 24 * 60 * 60 * 1000;
    expect(Math.round((p2.rawStart - p1.rawEnd) / dayMs)).toBe(1);
    expect(Math.round((p1.rawEnd - p1.rawStart) / dayMs)).toBe(13);
  });

  it('clamps out-of-range values', () => {
    expect(calculatePeriods({ ...config, totalPeriods: 999 })).toHaveLength(52);
    expect(calculatePeriods({ ...config, totalPeriods: 0 })).toHaveLength(8);
  });
});
