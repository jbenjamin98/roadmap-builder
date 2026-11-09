/**
 * Bars on the same task row may never overlap (milestones are exempt).
 * Pure helpers used by the reducer so every entry point (draw, drag, resize, import edits) is covered.
 */

const endOf = (it) => it.startPeriod + it.duration - 1;

/** Other bars on the same task, excluding `ignoreId`. */
function otherBars(items, taskId, ignoreId) {
  return items.filter((it) => it.type === 'bar' && it.taskId === taskId && it.id !== ignoreId);
}

export function barsOverlap(a, b) {
  return a.startPeriod <= endOf(b) && b.startPeriod <= endOf(a);
}

/**
 * Placement for a new bar: rejected (null) if it starts on an occupied period, otherwise trimmed so
 * it ends right before the next bar.
 */
export function placeNewBar(items, bar) {
  const others = otherBars(items, bar.taskId, null);
  if (others.some((o) => barsOverlap(o, { ...bar, duration: 1 }))) return null;
  const nextStart = others
    .filter((o) => o.startPeriod > bar.startPeriod)
    .reduce((min, o) => Math.min(min, o.startPeriod), Infinity);
  const duration = Math.max(1, Math.min(bar.duration, nextStart - bar.startPeriod));
  return { ...bar, duration };
}

/**
 * Resolve an update to a bar's position. A pure move that would overlap is rejected (null);
 * a resize is clamped against the neighbouring bars.
 */
export function resolveBarUpdate(items, item, updates) {
  if (item.type !== 'bar') return updates;
  const touchesStart = 'startPeriod' in updates;
  const touchesDuration = 'duration' in updates;
  if (!touchesStart && !touchesDuration) return updates;

  const others = otherBars(items, item.taskId, item.id);
  const next = { ...item, ...updates };

  if (touchesStart && !touchesDuration) {
    return others.some((o) => barsOverlap(o, next)) ? null : updates;
  }

  const origStart = item.startPeriod;
  const origEnd = endOf(item);
  let start = next.startPeriod;
  let end = endOf(next);
  if (start < origStart) {
    const floor = others
      .filter((o) => endOf(o) < origStart)
      .reduce((m, o) => Math.max(m, endOf(o)), 0);
    start = Math.max(start, floor + 1);
  }
  if (end > origEnd) {
    const ceil = others
      .filter((o) => o.startPeriod > origEnd)
      .reduce((m, o) => Math.min(m, o.startPeriod), Infinity);
    end = Math.min(end, ceil - 1);
  }
  return { ...updates, startPeriod: start, duration: Math.max(1, end - start + 1) };
}
