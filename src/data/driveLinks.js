/**
 * Which Google Drive file each roadmap is linked to, kept OUTSIDE the roadmap document.
 *
 * The link is machine-local bookkeeping (it points at one person's Drive file), so it must not be
 * written into exported/backed-up JSON, where it would be stale and could make an imported copy
 * overwrite someone else's file. It is keyed by roadmap id and remembers the Google account.
 *
 * @typedef {object} DriveLink
 * @property {string} fileId
 * @property {string} [headRevisionId]
 * @property {string} [fileName]
 * @property {number} [lastSyncedAt]
 * @property {string | null} [accountId]  Google account email the file belongs to.
 */

export const DRIVE_LINKS_KEY = 'roadmap_builder_drive_links_v1';

const defaultStorage = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
};

function readAll(storage) {
  if (!storage) return {};
  try {
    const parsed = JSON.parse(storage.getItem(DRIVE_LINKS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** @returns {DriveLink | null} */
export function loadDriveLink(roadmapId, storage = defaultStorage()) {
  if (!roadmapId) return null;
  const link = readAll(storage)[roadmapId];
  return link && typeof link.fileId === 'string' ? link : null;
}

/** @param {string} roadmapId @param {DriveLink} link */
export function saveDriveLink(roadmapId, link, storage = defaultStorage()) {
  if (!roadmapId || !storage) return;
  const all = readAll(storage);
  all[roadmapId] = link;
  try {
    storage.setItem(DRIVE_LINKS_KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: the next sync will simply look the file up again.
  }
}

export function clearDriveLink(roadmapId, storage = defaultStorage()) {
  if (!roadmapId || !storage) return;
  const all = readAll(storage);
  if (!(roadmapId in all)) return;
  delete all[roadmapId];
  try {
    storage.setItem(DRIVE_LINKS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
