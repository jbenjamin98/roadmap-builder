import { useEffect, useState } from 'react';
import { subscribeCursorTheme } from '../utils/cursorTheme';

const LANDING_PALETTE = {
  light: {
    from: '#0d9488',
    to: '#0284c7',
    outline: '#0f172a',
    surface: '#ffffff',
    pointer: '#f59e0b',
  },
  dark: {
    from: '#818cf8',
    to: '#38bdf8',
    outline: '#ffffff',
    surface: '#0f172a',
    pointer: '#fbbf24',
  },
};

function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Outline that keeps the arrow visible whatever the theme colours are. */
function pickOutline(from, to, isDark) {
  const lum = (luminance(from) + luminance(to)) / 2;
  if (lum > 0.45) return '#0f172a';
  if (lum < 0.08) return '#ffffff';
  return isDark ? '#ffffff' : '#0f172a';
}

const svgUrl = (svg) => encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

export default function CustomCursor({
  themeMode = 'dark',
  isWorkspace = false,
  roadmapTheme = null,
}) {
  const [pulses, setPulses] = useState([]);
  const [draftTheme, setDraftTheme] = useState(null);
  const isDark = themeMode === 'dark';

  useEffect(() => subscribeCursorTheme(setDraftTheme), []);

  // Landing page: pond colours for day/night. Editor: live canvas theme (draft while settings are open).
  // The draft also applies while creating a new roadmap, when the landing page is still the current view.
  const theme = draftTheme || (isWorkspace ? roadmapTheme : null);
  const landing = LANDING_PALETTE[isDark ? 'dark' : 'light'];
  const primaryColor = theme ? theme.primary || '#6366f1' : landing.from;
  const accentColor = theme ? theme.accents?.[0] || '#818cf8' : landing.to;
  const pointerColor = theme ? accentColor : landing.pointer;
  const outlineColor = theme ? pickOutline(primaryColor, accentColor, isDark) : landing.outline;
  const innerSurface = outlineColor === '#ffffff' ? '#0f172a' : '#ffffff';

  const gradient = (id, a, b) => `
    <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${a}" /><stop offset="100%" stop-color="${b}" />
    </linearGradient></defs>`;

  // Two-tone outline: a thin inner line inside a wider outer one stays visible on any background.
  const innerLine = outlineColor === '#ffffff' ? '#0f172a' : '#ffffff';
  const shape = (id, paths, outerW = 4) => `
    ${gradient(id, primaryColor, accentColor)}
    ${paths.map((d) => `<path d="${d}" fill="none" stroke="${outlineColor}" stroke-width="${outerW}" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
    ${paths.map((d) => `<path d="${d}" fill="url(#${id})" stroke="${innerLine}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}`;
  const badge = (cx, cy, r) =>
    `<circle cx="${cx}" cy="${cy}" r="${r + 1}" fill="${outlineColor}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${innerSurface}" stroke="${pointerColor}" stroke-width="1.8"/>`;
  const svg = (size, body) =>
    svgUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`
    );

  const defaultCursorSvg = svg(26, shape('cg', ['M4 3 L21 10.5 L13.5 13.5 L10.5 21 Z']));

  // Arrow with a small dot badge signals "clickable" (same on the landing page and in the editor).
  const pointerCursorSvg = svg(
    28,
    `${shape('pg', ['M4 3 L22 10.5 L14 14 L10.5 22 Z'])}${badge(19, 19, 3.2)}`
  );

  const url = (data, x, y, fallback) => `url("data:image/svg+xml,${data}") ${x} ${y}, ${fallback}`;

  useEffect(() => {
    const root = document.documentElement;
    root.style.cursor = 'default';
    const raf = requestAnimationFrame(() => {
      root.style.cursor = '';
    });
    return () => cancelAnimationFrame(raf);
  }, [primaryColor, accentColor, outlineColor]);

  useEffect(() => {
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    const handleMouseDown = (e) => {
      const id = `${Date.now()}-${Math.random()}`;
      setPulses((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setPulses((prev) => prev.filter((p) => p.id !== id));
      }, 550);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return (
    <>
      {/* Dynamic CSS cursor rules matching active mode & roadmap theme */}
      <style>{`
        @media (pointer: fine) {
          html, body, * {
            cursor: ${url(defaultCursorSvg, 4, 3, 'auto')} !important;
          }
          a, button, [role="button"], .cursor-pointer, input[type="checkbox"], input[type="color"], select, label, [data-rnd-item="true"], [draggable="true"], .cursor-grab, .resize-grip,
          a *, button *, [role="button"] *, .cursor-pointer *, [data-rnd-item="true"] *, [draggable="true"] *, .cursor-grab *, .resize-grip * {
            cursor: ${url(pointerCursorSvg, 4, 3, 'pointer')} !important;
          }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden hidden sm:block"
        aria-hidden="true"
      >
        {/* Click ripples: accent ring + softer primary ring */}
        {pulses.map((p) => (
          <span key={p.id}>
            <span
              style={{ left: p.x, top: p.y, borderColor: accentColor }}
              className="fixed -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 opacity-75 animate-ping"
            />
            <span
              style={{ left: p.x, top: p.y, borderColor: primaryColor, animationDelay: '90ms' }}
              className="fixed -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border opacity-50 animate-ping"
            />
          </span>
        ))}
      </div>
    </>
  );
}
