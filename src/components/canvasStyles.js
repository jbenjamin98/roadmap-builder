// Shared canvas theme & effect helpers used by TimelineGrid, TaskRow, Sidebar, and ConfigPreview.
import { PRESET_THEMES } from '../constants/themes';
import { normalizeDesign } from '../constants/designOptions';

/**
 * Returns the CSS background for a legend category, honoring `cat.isStriped` and gradient settings.
 */
export function getCategoryBackground(category, useGrad = true) {
  const baseColor = category?.color || '#6366f1';
  if (category?.isStriped) {
    return `repeating-linear-gradient(135deg, ${baseColor}, ${baseColor} 7px, ${baseColor}99 7px, ${baseColor}99 14px)`;
  }
  if (!useGrad) return baseColor;
  return (
    category?.gradient ||
    `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}bb 100%)`
  );
}

/**
 * Computes light/dark surface, border, and text tokens for a roadmap canvas.
 */
export function getCanvasTokens(config) {
  const preset = PRESET_THEMES.find((t) => t.id === config?.themeId);
  const primary = config?.theme?.primary || preset?.primary || '#6366f1';
  const secondary = config?.theme?.secondary || preset?.secondary || '#0f172a';
  const accents =
    Array.isArray(config?.theme?.accents) && config.theme.accents.length >= 4
      ? config.theme.accents
      : preset?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'];

  // Determine whether canvas is in light mode:
  // For custom theme, honor config.theme.baseMode ('light' | 'dark') first, otherwise luminance check
  let isLight = Boolean(preset?.isLight);
  if (config?.themeId === 'custom') {
    if (config?.theme?.baseMode === 'light') {
      isLight = true;
    } else if (config?.theme?.baseMode === 'dark') {
      isLight = false;
    } else if (secondary.startsWith('#') && secondary.length === 7) {
      const r = parseInt(secondary.slice(1, 3), 16);
      const g = parseInt(secondary.slice(3, 5), 16);
      const b = parseInt(secondary.slice(5, 7), 16);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      isLight = lum > 0.6;
    }
  }

  const design = normalizeDesign(config?.design);
  const effects = design.effects;
  const flat = Boolean(effects.flat);

  const surfaceBg = flat
    ? secondary
    : preset?.surfaceBg ||
      (isLight
        ? `linear-gradient(135deg, ${secondary} 0%, #ffffff 100%)`
        : `linear-gradient(135deg, ${secondary} 0%, #0f172a 100%)`);

  const headerGradient = flat
    ? isLight
      ? `${primary}14`
      : `${primary}22`
    : preset?.headerGradient ||
      `linear-gradient(90deg, ${primary}2e 0%, ${accents[0]}1a 50%, ${accents[1]}1a 100%)`;

  return {
    isLight,
    primary,
    secondary,
    accents,
    design,
    effects,
    surfaceBg,
    headerGradient,
    canvasBorder: effects.brutalist
      ? isLight
        ? '#0f172a'
        : '#f8fafc'
      : preset?.glassBorder || `${primary}44`,
    textMain: isLight ? '#0f172a' : '#f8fafc',
    textSecondary: isLight ? '#334155' : '#cbd5e1',
    textMuted: isLight ? '#64748b' : '#94a3b8',
    gridBorder: isLight
      ? 'rgba(148, 163, 184, 0.42)'
      : 'rgba(30, 41, 59, 0.85)',
    gridSubtle: isLight
      ? 'rgba(148, 163, 184, 0.28)'
      : 'rgba(30, 41, 59, 0.55)',
    stickyBg: isLight ? '#ffffff' : '#020617',
    stickyAltBg: isLight ? '#f1f5f9' : '#0f172a',
    subHeaderBg: isLight
      ? 'rgba(241, 245, 249, 0.9)'
      : 'rgba(15, 23, 42, 0.72)',
    rowBgEven: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(2, 6, 23, 0.28)',
    rowBgOdd: isLight ? 'rgba(226, 232, 240, 0.6)' : 'rgba(15, 23, 42, 0.48)',
    colShadeBg: isLight ? 'rgba(15, 23, 42, 0.035)' : 'rgba(255, 255, 255, 0.03)',
    chipBg: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 23, 42, 0.92)',
    chipBorder: isLight
      ? 'rgba(148, 163, 184, 0.48)'
      : 'rgba(255, 255, 255, 0.14)',
    legendBarBg: isLight
      ? 'rgba(255, 255, 255, 0.82)'
      : 'rgba(2, 6, 23, 0.68)',
  };
}

/**
 * Computes inline style for a timeline bar based on category, itemStyle, and effects.
 * Every effect has a clearly different look; itemStyle-specific rules are applied last
 * so bevel / bracket / chevron stay clean when combined with glass or other effects.
 */
export function getTimelineBarStyle(category, design, isLight = false, tokens = null) {
  const fx = design?.effects || {};
  const itemStyle = design?.itemStyle || 'pill-gradient';
  const flat = Boolean(fx.flat);
  const on = (k) => !flat && Boolean(fx[k]);

  const useGrad = !flat && (fx.gradients ?? true);
  const useShadow = !flat && (fx.shadows ?? true);
  const glass = on('glass');
  const neon = on('neon');
  const neu = on('neumorphic');
  const brut = on('brutalist');
  const metallic = on('metallic');
  const sketch = on('sketch');
  const duo = on('duotone');
  const water = on('watercolor');
  const stitch = on('stitched');
  const spot = on('spotlight');
  const holo = on('holographic');
  const halftone = on('halftone');
  const carbon = on('carbon');
  const aurora = on('aurora');
  const innerGlow = on('inner-glow');
  const dbl = on('double-outline');
  const linen = on('linen');
  const pastel = on('pastel');
  const pixel = on('pixel');
  const underglow = on('underglow');
  const sticker = on('sticker');
  const emboss = on('emboss');
  const boldOutline = on('bold-outline');
  const softOpacity = on('soft-opacity');
  const vivid = on('vivid');
  const scan = Boolean(fx['retro-scan']);

  const base = category?.color || '#6366f1';
  const striped = Boolean(category?.isStriped);
  const ink = isLight ? '#0f172a' : '#f8fafc';
  const acc2 = tokens?.accents?.[1] || '#ec4899';

  const glassBg = striped
    ? `repeating-linear-gradient(135deg, ${base}e6, ${base}e6 7px, ${base}99 7px, ${base}99 14px)`
    : `linear-gradient(180deg, rgba(15,23,42,0.14) 0%, rgba(15,23,42,0.30) 100%), linear-gradient(135deg, rgba(255,255,255,0.22) 0%, ${base}e0 38%, ${base}c4 100%)`;

  let background = getCategoryBackground(category, useGrad);
  let color = '#ffffff';
  let borderRadius = '11px';
  let border = category?.hasBorder
    ? `2px solid ${category.borderColor || '#ffffff'}`
    : '1px solid rgba(255, 255, 255, 0.25)';
  let outline;
  let outlineOffset;

  if (itemStyle === 'flat-rect') borderRadius = '3px';
  if (itemStyle === 'glow-capsule') borderRadius = '999px';
  if (itemStyle === 'chevron') borderRadius = '0px';

  if (glass) {
    background = glassBg;
    border = category?.hasBorder
      ? `2px solid ${category.borderColor || '#ffffff'}`
      : '1.5px solid rgba(255, 255, 255, 0.65)';
  }
  if (metallic) {
    if (!striped) {
      background = `linear-gradient(105deg, ${base} 0%, #ffffffcc 18%, ${base} 34%, ${base}aa 58%, #ffffff99 74%, ${base} 100%)`;
    }
    border = '1px solid rgba(255,255,255,0.75)';
  }
  if (duo) {
    if (!striped) {
      background = `linear-gradient(100deg, ${base} 0%, ${base} 64%, ${acc2} 64%, ${acc2} 100%)`;
    }
    border = 'none';
  }
  if (water) {
    if (!striped) {
      background = `radial-gradient(circle at 18% 30%, ${base}f0 0%, transparent 58%), radial-gradient(circle at 82% 70%, ${acc2}b0 0%, transparent 60%), ${base}66`;
    }
    border = `1px solid ${base}77`;
    color = isLight ? '#1e293b' : '#ffffff';
    borderRadius = itemStyle === 'chevron' ? '0px' : '16px';
  }
  if (sketch) {
    background = striped
      ? background
      : `repeating-linear-gradient(45deg, ${base}66 0px, ${base}66 1px, transparent 1px, transparent 5px), ${base}26`;
    border = `1.8px solid ${ink}`;
    color = ink;
    if (itemStyle !== 'chevron' && itemStyle !== 'glow-capsule') {
      borderRadius = '7px 4px 8px 5px';
    }
  }
  if (stitch) {
    if (!striped && !glass) background = base;
    border = `1px solid ${base}`;
    outline = '1.5px dashed rgba(255,255,255,0.8)';
    outlineOffset = '-4px';
  }

  if (holo) {
    if (!striped) {
      background = `linear-gradient(135deg, ${base}88 0%, transparent 60%), linear-gradient(115deg, #ff7ac6e6 0%, #7a8bffe6 22%, #52e5d6e6 44%, #fff176e6 66%, #ff9a76e6 88%, #ff7ac6e6 100%)`;
    }
    border = '1px solid rgba(255,255,255,0.8)';
  }
  if (halftone) {
    if (!striped) {
      background = `radial-gradient(circle, rgba(0,0,0,0.32) 1.3px, transparent 1.7px) 0 0 / 7px 7px, radial-gradient(circle, rgba(255,255,255,0.28) 1px, transparent 1.4px) 3.5px 3.5px / 7px 7px, ${base}`;
    }
  }

  if (carbon && !striped) {
    background = `repeating-linear-gradient(45deg, rgba(0,0,0,0.30) 0px, rgba(0,0,0,0.30) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.13) 0px, rgba(255,255,255,0.13) 2px, transparent 2px, transparent 4px), ${base}`;
  }
  if (aurora && !striped) {
    const a1 = tokens?.accents?.[0] || '#818cf8';
    const a2 = tokens?.accents?.[1] || '#ec4899';
    const a3 = tokens?.accents?.[2] || '#14b8a6';
    background = `radial-gradient(circle at 12% 25%, ${a1}d0 0%, transparent 55%), radial-gradient(circle at 88% 20%, ${a2}d0 0%, transparent 55%), radial-gradient(circle at 55% 105%, ${a3}b8 0%, transparent 60%), ${base}`;
  }

  if (linen && !striped) {
    background = `repeating-linear-gradient(0deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px), ${base}`;
  }
  if (pastel && !striped) {
    background = `${base}${isLight ? '40' : '55'}`;
    border = `1.5px solid ${base}`;
    color = isLight ? '#1e293b' : '#ffffff';
  }
  if (pixel && !striped) {
    background = `conic-gradient(rgba(0,0,0,0.24) 25%, transparent 0 50%, rgba(0,0,0,0.24) 0 75%, transparent 0) 0 0 / 8px 8px, ${base}`;
  }

  if (itemStyle === 'outlined') {
    background = striped
      ? `repeating-linear-gradient(135deg, ${base}28, ${base}28 7px, transparent 7px, transparent 14px)`
      : isLight
      ? `${base}18`
      : `${base}26`;
    color = isLight ? base : '#ffffff';
    border = `2px solid ${base}`;
  }

  if (itemStyle === 'gradient-edge' && !striped) {
    background = `linear-gradient(90deg, ${base} 0%, ${base} 55%, ${base}00 100%)`;
    border = 'none';
  }

  const shadows = [];
  if (itemStyle === 'soft-bevel') {
    shadows.push(
      glass
        ? 'inset 0 2px 3px rgba(255,255,255,0.7)'
        : 'inset 0 2px 1px rgba(255,255,255,0.55)'
    );
  }
  if (glass) shadows.push('inset 0 1.5px 0 rgba(255,255,255,0.75)');
  if (neu) {
    shadows.push(
      isLight
        ? '5px 5px 10px rgba(15,23,42,0.25), -4px -4px 8px rgba(255,255,255,0.9), inset 2px 2px 4px rgba(255,255,255,0.7), inset -2px -2px 4px rgba(0,0,0,0.2)'
        : '6px 6px 12px rgba(0,0,0,0.75), -3px -3px 8px rgba(255,255,255,0.12), inset 2px 2px 4px rgba(255,255,255,0.45), inset -3px -3px 5px rgba(0,0,0,0.55)'
    );
  }
  if (neon) {
    shadows.push(
      `0 0 18px ${base}, 0 0 6px #ffffffaa, inset 0 0 8px rgba(255,255,255,0.45)`
    );
    border = '1.5px solid #ffffffdd';
  }
  if (spot) shadows.push(`0 0 26px 2px ${base}99`);
  if (underglow) shadows.push(`0 4px 0 -1px ${base}, 0 8px 14px -2px ${base}cc`);
  if (sticker) {
    shadows.push('0 3px 8px rgba(0,0,0,0.35)');
    border = '3px solid #ffffff';
  }
  if (emboss) {
    shadows.push('inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(0,0,0,0.28)');
    border = '1px solid rgba(0,0,0,0.12)';
  }
  if (innerGlow) {
    shadows.push(`inset 0 0 14px 2px rgba(255,255,255,0.6), 0 0 0 1px ${base}`);
    border = '1px solid rgba(255,255,255,0.55)';
  }
  if (dbl) {
    shadows.push(`0 0 0 2px ${base}`);
    border = '2px solid rgba(255,255,255,0.92)';
  }
  if (metallic) shadows.push('inset 0 1px 0 rgba(255,255,255,0.9), 0 3px 8px rgba(0,0,0,0.35)');
  if (water) shadows.push(`0 6px 16px -4px ${base}55`);
  if (sketch) shadows.push(`2px 3px 0 ${ink}55`);
  if (brut) {
    border = `2.5px solid ${isLight ? '#090d16' : '#f8fafc'}`;
    shadows.push(isLight ? '4px 4px 0px #090d16' : '4px 4px 0px rgba(248,250,252,0.9)');
    if (itemStyle !== 'chevron' && itemStyle !== 'glow-capsule') borderRadius = '4px';
  } else if (useShadow && !neu && !neon && !spot && !water && !sketch && !innerGlow && !dbl && !underglow && !sticker && !emboss) {
    shadows.push(`0 10px 22px -4px ${base}88, 0 3px 6px -2px rgba(0,0,0,0.4)`);
  }

  if (boldOutline) {
    border = `2px solid ${isLight ? 'rgba(15,23,42,0.78)' : 'rgba(255,255,255,0.85)'}`;
  }

  if (flat) {
    border = category?.hasBorder
      ? `2px solid ${category.borderColor || '#ffffff'}`
      : `1px solid ${base}`;
  }

  if (scan && !striped) {
    background = `repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px), ${background}`;
  }

  const CLIPS = {
    chevron:
      'polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%, 8px 50%)',
    pentagon:
      'polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)',
    swallowtail:
      'polygon(0% 0%, 100% 0%, calc(100% - 12px) 50%, 100% 100%, 0% 100%)',
  };
  const clipPath = CLIPS[itemStyle];
  const clipped = Boolean(clipPath);

  const styleObj = {
    background,
    color,
    border: clipped ? 'none' : border,
    borderRadius,
    boxShadow: shadows.length ? shadows.join(', ') : 'none',
    clipPath,
    backdropFilter: glass ? 'blur(10px)' : undefined,
    outline,
    outlineOffset,
  };

  // itemStyle-specific edges applied last so they combine cleanly with glass etc.
  if (clipped) {
    styleObj.borderRadius = '0px';
    styleObj.boxShadow = 'none';
  }
  if (itemStyle === 'gradient-edge') styleObj.boxShadow = 'none';
  if (softOpacity) styleObj.opacity = 0.82;
  if (vivid) styleObj.filter = 'saturate(1.4) contrast(1.05)';
  if (glass || holo || halftone || metallic || carbon || aurora || pixel || linen) {
    styleObj.textShadow = '0 1px 2px rgba(0,0,0,0.45)';
  }
  if (itemStyle === 'soft-bevel') {
    styleObj.borderBottom = glass
      ? `3.5px solid ${base}`
      : '3.5px solid rgba(0,0,0,0.45)';
    styleObj.borderTop = '1.5px solid rgba(255,255,255,0.8)';
  }
  if (itemStyle === 'double-track') {
    styleObj.borderBottom = '3.5px solid rgba(255,255,255,0.88)';
  }
  if (itemStyle === 'bracket-bar') {
    styleObj.borderRadius = '1px';
  }
  return styleObj;
}
