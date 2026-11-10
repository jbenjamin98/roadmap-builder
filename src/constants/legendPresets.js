import { LEGEND_PRESET_STYLES } from './themes';

const DEFAULT_ACCENTS = ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'];

function toRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return [99, 102, 241];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = (hex, a) => `rgba(${toRgb(hex).join(', ')}, ${a})`;

function mix(a, b) {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  const h = (v) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h((r1 + r2) / 2)}${h((g1 + g2) / 2)}${h((b1 + b2) / 2)}`;
}

/** The six legend presets, derived from a canvas theme so they always match it. */
export function getThemeLegendPresets(theme) {
  const primary = theme?.primary || '#6366f1';
  const accents =
    Array.isArray(theme?.accents) && theme.accents.length >= 4 ? theme.accents : DEFAULT_ACCENTS;
  const colors = [
    primary,
    accents[0],
    accents[1],
    accents[2],
    accents[3],
    mix(primary, accents[1]),
  ];
  const names = ['Primary', 'Accent 1', 'Accent 2', 'Accent 3', 'Accent 4', 'Blend'];
  return colors.map((color, i) => ({
    name: names[i],
    color,
    gradient: `linear-gradient(135deg, ${rgba(color, 0.9)} 0%, ${rgba(colors[(i + 1) % colors.length], 0.85)} 100%)`,
  }));
}

const same = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

/**
 * Recolour legend entries that still use a preset style (from the previous theme or the original
 * static presets) to the matching preset of the new theme. Custom colours are left alone.
 */
export function remapLegendForTheme(legend, oldTheme, newTheme) {
  if (!Array.isArray(legend)) return legend;
  const oldPresets = getThemeLegendPresets(oldTheme);
  const newPresets = getThemeLegendPresets(newTheme);
  return legend.map((entry) => {
    let idx = oldPresets.findIndex((p) => same(p.color, entry.color));
    if (idx < 0) idx = LEGEND_PRESET_STYLES.findIndex((p) => same(p.color, entry.color));
    if (idx < 0) return entry;
    const next = newPresets[idx];
    return { ...entry, color: next.color, gradient: next.gradient };
  });
}

/** Gradient used for a legend category that is a single solid color (swatch or custom pick). */
export const solidLegendGradient = (color) =>
  `linear-gradient(135deg, ${color}ee 0%, ${color}bb 100%)`;
