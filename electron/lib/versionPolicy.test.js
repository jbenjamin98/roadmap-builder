import { describe, expect, it } from 'vitest';
import {
  AUTO_SNAPSHOT_INTERVAL_MS,
  selectVersionsToPrune,
  shouldAutoSnapshot,
} from './versionPolicy';

describe('shouldAutoSnapshot', () => {
  const newest = { createdAt: 1_000, hash: 'a' };
  it('snapshots the first save', () => {
    expect(shouldAutoSnapshot(undefined, 'a')).toBe(true);
  });
  it('skips unchanged content', () => {
    expect(shouldAutoSnapshot(newest, 'a', 1_000 + AUTO_SNAPSHOT_INTERVAL_MS * 2)).toBe(false);
  });
  it('waits for the interval when content changed', () => {
    expect(shouldAutoSnapshot(newest, 'b', 1_000 + AUTO_SNAPSHOT_INTERVAL_MS - 1)).toBe(false);
    expect(shouldAutoSnapshot(newest, 'b', 1_000 + AUTO_SNAPSHOT_INTERVAL_MS)).toBe(true);
  });
});

describe('selectVersionsToPrune', () => {
  const make = (n, pinned = false) => ({ id: `v${n}`, createdAt: n, pinned });
  it('keeps the newest N unpinned and never prunes pinned masters', () => {
    const versions = [make(1, true), make(2), make(3), make(4), make(5)];
    expect(selectVersionsToPrune(versions, 2).sort()).toEqual(['v2', 'v3']);
  });
  it('returns nothing under the limit', () => {
    expect(selectVersionsToPrune([make(1), make(2)], 5)).toEqual([]);
  });
});
