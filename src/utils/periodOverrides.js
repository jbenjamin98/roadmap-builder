/**
 * Per-period overrides: `config.periodOverrides` maps a 1-based period index (string key) to
 * `{ label?, weeks? }`. They sit on top of the generated periods (`periodLabel`, `weeksPerPeriod`,
 * `totalPeriods`), so clearing an override returns that period to its generated name and length.
 * Everything here is pure so the reducer, normalizer and UI share one set of rules.
 */
export const MAX_PERIOD_INDEX = 52;
export const MAX_PERIOD_WEEKS = 52;
export const MAX_PERIOD_LABEL = 40;

const clampWeeks = (n) => Math.max(1, Math.min(MAX_PERIOD_WEEKS, Math.round(n)));

/** Cleans untrusted overrides (imports, old drafts): valid keys only, clamped, empties dropped. */
export function normalizePeriodOverrides(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 1 || index > MAX_PERIOD_INDEX) continue;
    if (!value || typeof value !== 'object') continue;
    const entry = {};
    const label =
      typeof value.label === 'string' ? value.label.trim().slice(0, MAX_PERIOD_LABEL) : '';
    if (label) entry.label = label;
    const weeks = Number(value.weeks);
    if (Number.isFinite(weeks) && weeks >= 1) entry.weeks = clampWeeks(weeks);
    if (entry.label || entry.weeks) out[String(index)] = entry;
  }
  return out;
}

/**
 * Applies `patch` to one period. A field set to `null`, `''` (label) or an invalid number is
 * cleared; an override with nothing left is removed entirely.
 */
export function patchPeriodOverride(overrides, index, patch) {
  const current = { ...(overrides?.[String(index)] || {}) };
  if ('label' in patch) {
    const label = typeof patch.label === 'string' ? patch.label.slice(0, MAX_PERIOD_LABEL) : '';
    if (label.trim()) current.label = label;
    else delete current.label;
  }
  if ('weeks' in patch) {
    const weeks = Number(patch.weeks);
    if (patch.weeks !== null && Number.isFinite(weeks) && weeks >= 1)
      current.weeks = clampWeeks(weeks);
    else delete current.weeks;
  }
  const next = { ...(overrides || {}) };
  if (current.label || current.weeks) next[String(index)] = current;
  else delete next[String(index)];
  return next;
}

/**
 * Bulk tools. Returns the config fields to merge:
 * - `all`:   every period becomes `weeks` long (changes the default, clears length overrides, keeps names)
 * - `every`: every `every`-th period (first at `offset`, 1-based) gets `weeks`
 * - `reset`: clears all names and lengths
 */
export function applyBulkPeriods(config, bulk) {
  const overrides = config?.periodOverrides || {};
  if (bulk.mode === 'reset') return { periodOverrides: {} };

  if (bulk.mode === 'all') {
    const weeks = clampWeeks(Number(bulk.weeks) || 1);
    const next = {};
    for (const [key, entry] of Object.entries(overrides)) {
      if (entry.label) next[key] = { label: entry.label };
    }
    return { weeksPerPeriod: weeks, periodOverrides: next };
  }

  if (bulk.mode === 'every') {
    const every = Math.max(1, Math.min(MAX_PERIOD_INDEX, Math.round(Number(bulk.every) || 1)));
    const offset = Math.max(
      1,
      Math.min(MAX_PERIOD_INDEX, Math.round(Number(bulk.offset) || every))
    );
    const total = Math.max(1, Math.min(MAX_PERIOD_INDEX, Number(config?.totalPeriods) || 8));
    let next = { ...overrides };
    for (let i = offset; i <= total; i += every) {
      next = patchPeriodOverride(next, i, { weeks: bulk.weeks });
    }
    return { periodOverrides: next };
  }

  return {};
}
