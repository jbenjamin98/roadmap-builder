import { describe, expect, it } from 'vitest';
import { placeNewBar, resolveBarUpdate } from './barOverlap';

const bar = (id, startPeriod, duration, taskId = 't1', type = 'bar') => ({
  id,
  taskId,
  startPeriod,
  duration,
  type,
});

describe('placeNewBar', () => {
  const items = [bar('a', 3, 2), bar('x', 1, 9, 't2')];
  it('rejects a bar starting on an occupied period', () => {
    expect(placeNewBar(items, bar('n', 4, 1))).toBeNull();
  });
  it('trims a bar that would run into the next one', () => {
    expect(placeNewBar(items, bar('n', 1, 5)).duration).toBe(2);
  });
  it('ignores other tasks and milestones', () => {
    expect(placeNewBar([bar('m', 1, 5, 't1', 'milestone')], bar('n', 2, 2)).duration).toBe(2);
  });
});

describe('resolveBarUpdate', () => {
  const items = [bar('a', 1, 2), bar('b', 5, 2)];
  it('rejects a move onto another bar', () => {
    expect(resolveBarUpdate(items, items[0], { startPeriod: 4 })).toBeNull();
  });
  it('allows a move into free space', () => {
    expect(resolveBarUpdate(items, items[0], { startPeriod: 3 })).toEqual({ startPeriod: 3 });
  });
  it('clamps a right-edge resize', () => {
    expect(resolveBarUpdate(items, items[0], { startPeriod: 1, duration: 8 })).toEqual({
      startPeriod: 1,
      duration: 4,
    });
  });
  it('clamps a left-edge resize', () => {
    expect(resolveBarUpdate(items, items[1], { startPeriod: 1, duration: 6 })).toEqual({
      startPeriod: 3,
      duration: 4,
    });
  });
  it('passes through label changes', () => {
    expect(resolveBarUpdate(items, items[0], { label: 'x' })).toEqual({ label: 'x' });
  });
});
