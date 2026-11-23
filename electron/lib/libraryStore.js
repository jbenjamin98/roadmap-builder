import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isInside, isRoadmapFileName, isSafeId, uniqueFileName } from './fileNames.js';

/** Hash of the document content, ignoring the bookkeeping timestamp. */
export function contentHash(state) {
  const rest = { ...state };
  delete rest.updatedAt;
  return crypto.createHash('sha1').update(JSON.stringify(rest)).digest('hex');
}

/** Writes via a temp file + rename so a crash never leaves a half-written roadmap behind. */
export async function writeFileAtomic(file, text) {
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, text, 'utf8');
  try {
    await fs.rename(tmp, file);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
}

/**
 * One `<name>.roadmap.json` per roadmap in a folder. Files are matched to roadmaps by the `id`
 * stored inside them, so renaming a roadmap in the app never loses its file.
 * @param {{ getDir: () => string, trash?: (file: string) => Promise<void> }} deps
 */
export function createLibrary({ getDir, trash }) {
  /** @type {Map<string, {file:string, mtimeMs:number, size:number, meta:object}>} */
  const cache = new Map();

  const dir = () => getDir();

  async function ensureDir() {
    await fs.mkdir(dir(), { recursive: true });
  }

  async function readMeta(file) {
    const stat = await fs.stat(file);
    const hit = cache.get(file);
    if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.meta;
    const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || !isSafeId(parsed.id)) throw new Error('No id');
    const meta = {
      id: parsed.id,
      name: parsed.config?.name || path.basename(file, '.roadmap.json'),
      file: path.basename(file),
      updatedAt: stat.mtimeMs,
      sections: Array.isArray(parsed.sections) ? parsed.sections.length : 0,
      items: Array.isArray(parsed.timelineItems) ? parsed.timelineItems.length : 0,
      periods: Number(parsed.config?.totalPeriods) || 0,
      periodLabel: String(parsed.config?.periodLabel || ''),
      colors: [
        parsed.config?.theme?.primary,
        ...(parsed.config?.theme?.accents || []).slice(0, 2),
      ].filter((c) => typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c)),
    };
    cache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, meta });
    return meta;
  }

  /** All readable roadmaps, newest first. Unreadable files are reported, not hidden. */
  async function list() {
    await ensureDir();
    const names = (await fs.readdir(dir())).filter(isRoadmapFileName);
    const items = [];
    const unreadable = [];
    for (const name of names) {
      const file = path.join(dir(), name);
      try {
        items.push(await readMeta(file));
      } catch {
        unreadable.push(name);
      }
    }
    items.sort((a, b) => b.updatedAt - a.updatedAt);
    return { items, unreadable };
  }

  async function fileForId(id) {
    if (!isSafeId(id)) return null;
    const { items } = await list();
    const hit = items.find((i) => i.id === id);
    return hit ? path.join(dir(), hit.file) : null;
  }

  async function read(id) {
    const file = await fileForId(id);
    if (!file) throw new Error('Roadmap not found in the library.');
    return JSON.parse(await fs.readFile(file, 'utf8'));
  }

  /** Writes the roadmap to its file, creating `<name>.roadmap.json` the first time. */
  async function save(state) {
    if (!state || !isSafeId(state.id)) throw new Error('Roadmap has no valid id.');
    await ensureDir();
    let file = await fileForId(state.id);
    if (!file) {
      const taken = new Set((await fs.readdir(dir())).map((n) => n.toLowerCase()));
      file = path.join(dir(), uniqueFileName(state.config?.name, taken));
    }
    await writeFileAtomic(file, JSON.stringify(state, null, 2));
    return { id: state.id, file: path.basename(file) };
  }

  async function remove(id) {
    const file = await fileForId(id);
    if (!file || !isInside(dir(), file)) return false;
    if (trash) await trash(file);
    else await fs.rm(file, { force: true });
    cache.delete(file);
    return true;
  }

  /** Copies a roadmap under a fresh id; `makeId` is injected so ids match the app's format. */
  async function duplicate(id, makeId) {
    const state = await read(id);
    const copy = {
      ...state,
      id: makeId(),
      config: { ...state.config, name: `${state.config?.name || 'Roadmap'} (copy)` },
    };
    await save(copy);
    return copy;
  }

  /** Stores text from a file the user picked. A clashing id gets a new one so nothing is overwritten. */
  async function importText(text, makeId) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') throw new Error('Not a roadmap file.');
    const exists = isSafeId(parsed.id) && (await fileForId(parsed.id));
    if (!isSafeId(parsed.id) || exists) parsed.id = makeId();
    await save(parsed);
    return parsed;
  }

  return { list, read, save, remove, duplicate, importText, fileForId, ensureDir };
}
