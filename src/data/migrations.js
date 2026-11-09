/**
 * Roadmap document versioning.
 *
 * To change the saved shape: bump CURRENT_VERSION and add `migrations[<oldVersion>]`, a pure function
 * that takes a document at <oldVersion> and returns it at <oldVersion + 1>. Add a test for it.
 * Documents without a version are legacy v1 files.
 */
export const CURRENT_VERSION = 1;

/** @type {Record<number, (doc: any) => any>} */
export const migrations = {};

export function getDocumentVersion(raw) {
  const v = Number(raw?.version);
  return Number.isInteger(v) && v >= 1 ? v : 1;
}

/** True when the document was written by a newer app version than this one understands. */
export function isFromNewerVersion(raw) {
  return getDocumentVersion(raw) > CURRENT_VERSION;
}

/** Runs every pending migration in order. Never mutates its input. */
export function migrateRoadmap(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  let doc = { ...raw };
  let version = getDocumentVersion(doc);
  while (version < CURRENT_VERSION) {
    const step = migrations[version];
    if (!step) break;
    doc = { ...step(doc), version: version + 1 };
    version += 1;
  }
  return doc;
}
