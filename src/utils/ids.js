/**
 * Single source of truth for entity ids (roadmaps, sections, tasks, ...).
 * Uses crypto.randomUUID (collision-safe even within one millisecond) and falls back to a
 * time+random id in non-secure contexts or old browsers.
 */
export function createId(prefix) {
  const unique =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 12)
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${unique}`;
}
