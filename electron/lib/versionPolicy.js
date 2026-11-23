export const AUTO_SNAPSHOT_INTERVAL_MS = 10 * 60 * 1000;
export const MAX_UNPINNED_VERSIONS = 50;

/**
 * Decides whether a save should also create an automatic snapshot: the very first save, or the
 * content changed and the newest version is older than the interval.
 * @param {{createdAt:number, hash:string}|undefined} newest
 */
export function shouldAutoSnapshot(newest, hash, now = Date.now()) {
  if (!newest) return true;
  if (newest.hash === hash) return false;
  return now - newest.createdAt >= AUTO_SNAPSHOT_INTERVAL_MS;
}

/**
 * Returns the ids to delete so at most `max` unpinned versions remain (newest kept).
 * Pinned "master" versions are never returned.
 * @param {{id:string, createdAt:number, pinned?:boolean}[]} versions
 */
export function selectVersionsToPrune(versions, max = MAX_UNPINNED_VERSIONS) {
  const unpinned = versions
    .filter((v) => !v.pinned)
    .sort((a, b) => b.createdAt - a.createdAt || (a.id < b.id ? 1 : -1));
  return unpinned.slice(max).map((v) => v.id);
}
