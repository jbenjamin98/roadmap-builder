import { getSampleRoadmapState, normalizeRoadmapState } from './defaultState';

/**
 * Browser-side "draft" persistence. This is a TEMPORARY working copy that lives only in this
 * browser profile (it can be evicted, cleared, or blocked), never a substitute for a real backup.
 * All functions accept an injectable `storage` so they can be unit tested.
 */
export const KEYS = {
  draft: 'roadmap_builder_state_v1',
  lastGood: 'roadmap_builder_state_v1_lastgood',
  corruptPrefix: 'roadmap_builder_state_v1_corrupt_',
  backupMeta: 'roadmap_builder_backup_meta_v1',
  noticeSeen: 'roadmap_builder_draft_notice_v1',
};

function defaultStorage() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null; // accessing localStorage can throw when blocked
  }
}

/** Stable, cheap content hash that ignores volatile fields. Used to tell "changed since backup". */
export function fingerprint(state) {
  // Normalize first: loading always normalizes, so a fresh in-memory edit and the same document
  // reloaded from storage must hash identically.
  const rest = { ...normalizeRoadmapState(state) };
  delete rest.updatedAt;
  const text = JSON.stringify(rest);
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${text.length}:${(h >>> 0).toString(36)}`;
}

/**
 * @returns {{ state: object, isSample: boolean,
 *   recovery: null | { kind: 'corrupt', corruptKey: string | null, lastGoodAvailable: boolean } }}
 */
export function loadDraft(storage = defaultStorage()) {
  const sample = () => ({ state: getSampleRoadmapState(), isSample: true, recovery: null });
  if (!storage) return sample();

  let raw;
  try {
    raw = storage.getItem(KEYS.draft);
  } catch {
    return sample();
  }
  // Nothing saved yet: show the sample in memory only. It is persisted on the first real edit.
  if (!raw) return sample();

  try {
    const state = normalizeRoadmapState(JSON.parse(raw));
    try {
      storage.setItem(KEYS.lastGood, raw); // snapshot of the last readable session
    } catch {
      /* ignore */
    }
    return { state, isSample: false, recovery: null };
  } catch (err) {
    console.warn('Saved roadmap draft is unreadable; quarantining it.', err);
    // Never overwrite the unreadable data: park it under its own key so it can be downloaded.
    let corruptKey = `${KEYS.corruptPrefix}${Date.now()}`;
    try {
      storage.setItem(corruptKey, raw);
    } catch {
      corruptKey = null;
    }
    let lastGoodAvailable = false;
    try {
      lastGoodAvailable = Boolean(storage.getItem(KEYS.lastGood));
    } catch {
      /* ignore */
    }
    return {
      state: getSampleRoadmapState(),
      isSample: true,
      recovery: { kind: 'corrupt', corruptKey, lastGoodAvailable },
    };
  }
}

/** @returns {{ ok: true } | { ok: false, reason: 'quota' | 'unavailable' | 'unknown', message: string }} */
export function saveDraft(state, storage = defaultStorage()) {
  if (!storage)
    return { ok: false, reason: 'unavailable', message: 'Browser storage is disabled.' };
  try {
    storage.setItem(KEYS.draft, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
    return { ok: true };
  } catch (err) {
    const quota =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014;
    return {
      ok: false,
      reason: quota ? 'quota' : 'unknown',
      message: quota ? 'Browser storage is full.' : String(err?.message || err),
    };
  }
}

export function restoreLastGood(storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(KEYS.lastGood);
    return raw ? normalizeRoadmapState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Raw draft text (even if corrupt) for "download my data" in error screens. */
export function readRawDraft(storage = defaultStorage()) {
  try {
    return storage?.getItem(KEYS.draft) ?? null;
  } catch {
    return null;
  }
}

export function readQuarantined(corruptKey, storage = defaultStorage()) {
  try {
    return corruptKey ? (storage?.getItem(corruptKey) ?? null) : null;
  } catch {
    return null;
  }
}

/** Backup bookkeeping: when the document was last backed up and what it looked like then. */
export function loadBackupMeta(storage = defaultStorage()) {
  try {
    const parsed = JSON.parse(storage?.getItem(KEYS.backupMeta) || 'null');
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    /* ignore */
  }
  return { lastBackupAt: null, backedUpFingerprint: null, method: null };
}

export function saveBackupMeta(meta, storage = defaultStorage()) {
  try {
    storage?.setItem(KEYS.backupMeta, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
}

export function hasSeenDraftNotice(storage = defaultStorage()) {
  try {
    return storage?.getItem(KEYS.noticeSeen) === '1';
  } catch {
    return true; // storage blocked: do not nag on every load
  }
}

export function markDraftNoticeSeen(storage = defaultStorage()) {
  try {
    storage?.setItem(KEYS.noticeSeen, '1');
  } catch {
    /* ignore */
  }
}
