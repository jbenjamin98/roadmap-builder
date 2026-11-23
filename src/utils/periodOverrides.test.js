import { describe, expect, it } from 'vitest';
import { roadmapReducer } from '../state/roadmapReducer';
import { applyBulkPeriods, normalizePeriodOverrides, patchPeriodOverride } from './periodOverrides';

describe('normalizePeriodOverrides', () => {
  it('drops bad keys, clamps weeks, trims labels, removes empties', () => {
    expect(
      normalizePeriodOverrides({
        0: { weeks: 2 },
        99: { weeks: 2 },
        x: { weeks: 2 },
        3: { weeks: 999, label: '  hi  ' },
        4: {},
      })
    ).toEqual({ 3: { weeks: 52, label: 'hi' } });
    expect(normalizePeriodOverrides(null)).toEqual({});
    expect(normalizePeriodOverrides([1, 2])).toEqual({});
  });
});

describe('patchPeriodOverride', () => {
  it('sets, clears fields and removes an empty override', () => {
    let o = patchPeriodOverride({}, 4, { label: 'X', weeks: 3 });
    o = patchPeriodOverride(o, 4, { label: '' });
    expect(o).toEqual({ 4: { weeks: 3 } });
    expect(patchPeriodOverride(o, 4, { weeks: null })).toEqual({});
  });
});

describe('applyBulkPeriods', () => {
  const base = { weeksPerPeriod: 2, totalPeriods: 6 };
  it('every Nth period gets a length', () => {
    const next = applyBulkPeriods(base, { mode: 'every', every: 3, offset: 3, weeks: 1 });
    expect(Object.keys(next.periodOverrides)).toEqual(['3', '6']);
  });
  it('"all" changes the default, keeps names, drops length overrides', () => {
    const cfg = { ...base, periodOverrides: { 2: { label: 'Hardening', weeks: 1 } } };
    expect(applyBulkPeriods(cfg, { mode: 'all', weeks: 3 })).toEqual({
      weeksPerPeriod: 3,
      periodOverrides: { 2: { label: 'Hardening' } },
    });
  });
  it('reset clears everything', () => {
    expect(applyBulkPeriods(base, { mode: 'reset' })).toEqual({ periodOverrides: {} });
  });
});

describe('period reducer actions', () => {
  it('leave bars where they are', () => {
    const state = {
      config: { ...{ weeksPerPeriod: 2, totalPeriods: 6 } },
      legend: [],
      timelineItems: [{ id: 'i', startPeriod: 3, duration: 2 }],
    };
    const next = roadmapReducer(state, { type: 'PERIOD_UPDATE', index: 2, patch: { weeks: 1 } });
    expect(next.config.periodOverrides[2].weeks).toBe(1);
    expect(next.timelineItems).toEqual(state.timelineItems);
    expect(
      roadmapReducer(next, { type: 'PERIODS_BULK', bulk: { mode: 'reset' } }).config.periodOverrides
    ).toEqual({});
  });
});
