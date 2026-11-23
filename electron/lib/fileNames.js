import path from 'node:path';

export const ROADMAP_EXT = '.roadmap.json';
export const HISTORY_DIR = '.history';

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

/** Turns a roadmap name into a safe file base name (no extension). */
export function sanitizeFileBase(name) {
  let base = String(name ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '')
    .replace(/[. ]+$/, '')
    .slice(0, 80)
    .trim();
  if (!base || WINDOWS_RESERVED.test(base)) base = 'roadmap';
  return base;
}

/** First `<base>.roadmap.json` not already in `taken` (a Set of lowercase file names). */
export function uniqueFileName(base, taken) {
  const safe = sanitizeFileBase(base);
  let candidate = `${safe}${ROADMAP_EXT}`;
  for (let n = 2; taken.has(candidate.toLowerCase()); n += 1) {
    candidate = `${safe} (${n})${ROADMAP_EXT}`;
  }
  return candidate;
}

export const isRoadmapFileName = (name) =>
  name.toLowerCase().endsWith(ROADMAP_EXT) && !name.startsWith('.');

/** True when `target` is `root` itself or somewhere inside it (after resolving `..`). */
export function isInside(root, target) {
  const rel = path.relative(path.resolve(root), path.resolve(target));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** Roadmap ids are `rm-...`; refuse anything that could escape a folder when used in a path. */
export const isSafeId = (id) => typeof id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(id);
