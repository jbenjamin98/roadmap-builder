import { beforeEach, describe, expect, it } from 'vitest';
import {
  KEYS,
  fingerprint,
  loadBackupMeta,
  loadDraft,
  readQuarantined,
  restoreLastGood,
  saveBackupMeta,
  saveDraft,
} from './persistence';
import { createBlankRoadmapState } from './defaultState';

function memoryStorage({ failWrites = null } = {}) {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      if (failWrites) throw failWrites;
      map.set(k, String(v));
    },
  };
}

let storage;
beforeEach(() => {
  storage = memoryStorage();
});

describe('loadDraft', () => {
  it('returns the sample in memory without writing anything on first visit', () => {
    const r = loadDraft(storage);
    expect(r.isSample).toBe(true);
    expect(storage.map.size).toBe(0);
  });

  it('round-trips a saved draft', () => {
    const state = createBlankRoadmapState({ name: 'Mine' });
    expect(saveDraft(state, storage).ok).toBe(true);
    const r = loadDraft(storage);
    expect(r.isSample).toBe(false);
    expect(r.state.config.name).toBe('Mine');
  });

  it('keeps a last-good snapshot after a successful load', () => {
    saveDraft(createBlankRoadmapState({ name: 'Good' }), storage);
    loadDraft(storage);
    expect(restoreLastGood(storage).config.name).toBe('Good');
  });

  it('quarantines unreadable data instead of overwriting it', () => {
    storage.setItem(KEYS.draft, '{not json');
    const r = loadDraft(storage);
    expect(r.isSample).toBe(true);
    expect(r.recovery.kind).toBe('corrupt');
    expect(readQuarantined(r.recovery.corruptKey, storage)).toBe('{not json');
    // the original is untouched, so nothing was lost
    expect(storage.getItem(KEYS.draft)).toBe('{not json');
  });

  it('offers the last-good copy when one exists', () => {
    saveDraft(createBlankRoadmapState({ name: 'Good' }), storage);
    loadDraft(storage);
    storage.setItem(KEYS.draft, '###');
    expect(loadDraft(storage).recovery.lastGoodAvailable).toBe(true);
  });

  it('survives blocked storage', () => {
    expect(loadDraft(null).isSample).toBe(true);
  });
});

describe('saveDraft', () => {
  it('reports quota errors', () => {
    const err = Object.assign(new Error('full'), { name: 'QuotaExceededError' });
    const r = saveDraft(createBlankRoadmapState(), memoryStorage({ failWrites: err }));
    expect(r).toMatchObject({ ok: false, reason: 'quota' });
  });

  it('reports unavailable storage', () => {
    expect(saveDraft(createBlankRoadmapState(), null)).toMatchObject({
      ok: false,
      reason: 'unavailable',
    });
  });

  it('reports unknown errors with a message', () => {
    const r = saveDraft(
      createBlankRoadmapState(),
      memoryStorage({ failWrites: new Error('boom') })
    );
    expect(r).toMatchObject({ ok: false, reason: 'unknown', message: 'boom' });
  });
});

describe('fingerprint', () => {
  it('ignores updatedAt but detects real changes', () => {
    const a = createBlankRoadmapState({ name: 'A' });
    expect(fingerprint({ ...a, updatedAt: 'x' })).toBe(fingerprint({ ...a, updatedAt: 'y' }));
    const b = { ...a, tasks: [...a.tasks, { id: 'z', subSectionId: 'q', title: 'new' }] };
    expect(fingerprint(a)).not.toBe(fingerprint(b));
  });
});

describe('fingerprint across reloads', () => {
  it('is identical before and after a save/load round trip', () => {
    const state = createBlankRoadmapState({ name: 'Round trip' });
    // un-normalized shape, exactly what reducers produce (no `collapsed` on new sections)
    state.sections.push({ id: 's9', title: 'New', subSections: [] });
    saveDraft(state, storage);
    const reloaded = loadDraft(storage).state;
    expect(fingerprint(reloaded)).toBe(fingerprint(state));
  });
});

describe('backup meta', () => {
  it('round-trips and has safe defaults', () => {
    expect(loadBackupMeta(storage).lastBackupAt).toBe(null);
    saveBackupMeta({ lastBackupAt: 5, backedUpFingerprint: 'f', method: 'download' }, storage);
    expect(loadBackupMeta(storage)).toMatchObject({ lastBackupAt: 5, method: 'download' });
  });
});
