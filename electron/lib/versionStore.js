import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { HISTORY_DIR, isSafeId } from './fileNames.js';
import { contentHash, writeFileAtomic } from './libraryStore.js';
import { selectVersionsToPrune, shouldAutoSnapshot } from './versionPolicy.js';

/**
 * Version history kept beside the library: `<library>/.history/<roadmapId>/`.
 * Holds one JSON snapshot per version plus an `index.json` with labels and pins.
 * Pinned ("master") versions are never pruned.
 * @param {{ getDir: () => string }} deps
 */
export function createVersionStore({ getDir }) {
  const roadmapDir = (id) => {
    if (!isSafeId(id)) throw new Error('Invalid roadmap id.');
    return path.join(getDir(), HISTORY_DIR, id);
  };
  const indexFile = (id) => path.join(roadmapDir(id), 'index.json');
  const versionFile = (id, versionId) => {
    if (!isSafeId(versionId)) throw new Error('Invalid version id.');
    return path.join(roadmapDir(id), `${versionId}.json`);
  };

  async function readIndex(id) {
    try {
      const parsed = JSON.parse(await fs.readFile(indexFile(id), 'utf8'));
      return Array.isArray(parsed.versions) ? parsed.versions : [];
    } catch {
      return [];
    }
  }

  async function writeIndex(id, versions) {
    await fs.mkdir(roadmapDir(id), { recursive: true });
    await writeFileAtomic(indexFile(id), JSON.stringify({ versions }, null, 2));
  }

  /** Newest first. */
  async function list(id) {
    return (await readIndex(id)).sort((a, b) => b.createdAt - a.createdAt);
  }

  async function prune(id, versions) {
    const doomed = new Set(selectVersionsToPrune(versions));
    if (!doomed.size) return versions;
    await Promise.all([...doomed].map((v) => fs.rm(versionFile(id, v), { force: true })));
    return versions.filter((v) => !doomed.has(v.id));
  }

  /** @param {{label?:string, pinned?:boolean, auto?:boolean}} [opts] */
  async function create(id, state, opts = {}, now = Date.now()) {
    const versions = await readIndex(id);
    const versionId = `${now}-${crypto.randomBytes(3).toString('hex')}`;
    const text = JSON.stringify(state, null, 2);
    await fs.mkdir(roadmapDir(id), { recursive: true });
    await writeFileAtomic(versionFile(id, versionId), text);
    const entry = {
      id: versionId,
      createdAt: now,
      label: opts.label?.trim() || '',
      pinned: Boolean(opts.pinned),
      auto: Boolean(opts.auto),
      hash: contentHash(state),
      size: Buffer.byteLength(text),
      name: state.config?.name || '',
    };
    await writeIndex(id, await prune(id, [...versions, entry]));
    return entry;
  }

  /**
   * Called on every autosave: snapshots only when the policy says it is time. `force` (used when
   * the app closes) snapshots whenever the content differs from the newest version.
   */
  async function maybeAutoSnapshot(id, state, { now = Date.now(), force = false } = {}) {
    const [newest] = await list(id);
    const hash = contentHash(state);
    if (newest && newest.hash === hash) return null;
    if (!force && !shouldAutoSnapshot(newest, hash, now)) return null;
    return create(id, state, { auto: true }, now);
  }

  async function read(id, versionId) {
    return JSON.parse(await fs.readFile(versionFile(id, versionId), 'utf8'));
  }

  async function update(id, versionId, patch) {
    const versions = await readIndex(id);
    const entry = versions.find((v) => v.id === versionId);
    if (!entry) throw new Error('Version not found.');
    if (typeof patch.label === 'string') entry.label = patch.label.trim().slice(0, 120);
    if (typeof patch.pinned === 'boolean') entry.pinned = patch.pinned;
    await writeIndex(id, versions);
    return entry;
  }

  async function remove(id, versionId) {
    const versions = await readIndex(id);
    await fs.rm(versionFile(id, versionId), { force: true });
    await writeIndex(
      id,
      versions.filter((v) => v.id !== versionId)
    );
  }

  return { list, create, maybeAutoSnapshot, read, update, remove };
}
