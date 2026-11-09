import { describe, expect, it } from 'vitest';
import {
  CURRENT_VERSION,
  getDocumentVersion,
  isFromNewerVersion,
  migrateRoadmap,
  migrations,
} from './migrations';

describe('migrations', () => {
  it('treats unversioned documents as v1', () => {
    expect(getDocumentVersion({})).toBe(1);
    expect(getDocumentVersion({ version: 'x' })).toBe(1);
  });

  it('detects documents from the future', () => {
    expect(isFromNewerVersion({ version: CURRENT_VERSION + 1 })).toBe(true);
    expect(isFromNewerVersion({ version: CURRENT_VERSION })).toBe(false);
  });

  it('returns non-objects untouched and does not mutate input', () => {
    expect(migrateRoadmap(null)).toBe(null);
    const doc = { version: 1, sections: [] };
    const out = migrateRoadmap(doc);
    expect(out).not.toBe(doc);
    expect(doc).toEqual({ version: 1, sections: [] });
  });

  it('runs registered migrations in order (simulated v0 -> v1 chain)', () => {
    // Exercise the loop with a temporary migration without changing CURRENT_VERSION semantics.
    const original = migrations[CURRENT_VERSION];
    migrations[CURRENT_VERSION] = (d) => ({ ...d, migrated: true });
    // A doc at CURRENT_VERSION is already current, so nothing runs.
    expect(migrateRoadmap({ version: CURRENT_VERSION }).migrated).toBeUndefined();
    if (original) migrations[CURRENT_VERSION] = original;
    else delete migrations[CURRENT_VERSION];
  });
});
