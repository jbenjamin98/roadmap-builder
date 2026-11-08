/** Words never break mid-word; text only wraps between words (sentences wrap). */
export const NO_WORD_BREAK = {
  wordBreak: 'normal',
  overflowWrap: 'normal',
  hyphens: 'none',
};

/** Left padding (px) for each hierarchy level: none, a little, more. */
export const INDENT = { section: 16, sub: 24, task: 40 };
/** Tighter indents when a vertical spine already uses horizontal room. */
export const INDENT_SPINE = { section: 16, sub: 12, task: 26 };

export function getSectionVisuals(styleId, accent, tokens, subtleGrid = true) {
  let bannerBg = `linear-gradient(90deg, ${accent}26 0%, ${accent}08 60%, transparent 100%)`;
  let leftCell = {
    backgroundColor: tokens.stickyAltBg,
    borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
  };

  switch (styleId) {
    case 'solid-band':
      bannerBg = `linear-gradient(90deg, ${accent} 0%, ${accent}dd 100%)`;
      leftCell = { backgroundColor: accent, borderColor: 'rgba(255,255,255,0.2)' };
      break;
    case 'left-rail':
      bannerBg = `${accent}12`;
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        borderLeft: `5px solid ${accent}`,
        borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
      };
      break;
    case 'outlined-card':
      bannerBg = 'transparent';
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        border: `1.5px solid ${accent}88`,
      };
      break;
    case 'underlined':
      bannerBg = 'transparent';
      leftCell = {
        backgroundColor: tokens.stickyBg,
        borderBottom: `2.5px solid ${accent}`,
      };
      break;
    case 'tab-flag':
      bannerBg = `${accent}10`;
      leftCell = { backgroundColor: tokens.stickyAltBg };
      break;
    case 'floating-pill':
      bannerBg = `${accent}0d`;
      leftCell = {
        backgroundColor: tokens.stickyBg,
        borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
      };
      break;
    case 'double-rule':
      bannerBg = `${accent}0e`;
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        borderTop: `2px solid ${accent}`,
        borderBottom: `2px solid ${accent}`,
      };
      break;
    case 'bracket-ends':
      bannerBg = `${accent}0f`;
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        border: `1px solid ${accent}55`,
        borderLeft: `6px solid ${accent}`,
        borderRadius: '0 12px 12px 0',
      };
      break;
    case 'glow-fade':
      bannerBg = `radial-gradient(ellipse at left, ${accent}40 0%, transparent 70%)`;
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        boxShadow: `inset 0 0 22px ${accent}38`,
        borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
      };
      break;
    case 'top-rule':
      bannerBg = `linear-gradient(180deg, ${accent}1c 0%, transparent 100%)`;
      leftCell = {
        backgroundColor: tokens.stickyAltBg,
        borderTop: `4px solid ${accent}`,
        borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
      };
      break;
    default:
  }

  return {
    bannerBg,
    leftCell,
    solid: styleId === 'solid-band',
    pill: styleId === 'floating-pill',
    tab: styleId === 'tab-flag',
    titleColor: styleId === 'solid-band' ? '#ffffff' : tokens.textMain,
  };
}

/** Keeps hyphenated words (e.g. "Sign-off") on one line by using non-breaking hyphens. */
export const nbHyphen = (text) =>
  String(text ?? '').replace(/([\p{L}\d])-(?=[\p{L}\d])/gu, '$1\u2011');

/**
 * Width of the frozen first column. Starts from the density width and grows just enough
 * that the longest single word in any title (plus its indent, markers and badges) fits
 * without being cut off.
 */
export function computeLeftWidth({ density, sections, tasks, design, rotated }) {
  const base = density.leftW;
  const num = design?.numbering || {};
  const ind = rotated ? INDENT_SPINE : INDENT;
  const longest = (text) =>
    String(text || '')
      .split(/\s+/)
      .reduce((m, w) => Math.max(m, w.length), 0);
  const SLACK = 30; // right padding + level decoration (pills, brackets, ribbons)
  let need = 0;

  sections.forEach((sec) => {
    if (!rotated) {
      need = Math.max(
        need,
        ind.section + (num.sections ? 38 : 0) + longest(sec.title) * 9.4 + SLACK
      );
    }
    sec.subSections.forEach((sub) => {
      need = Math.max(
        need,
        ind.sub + 26 + (num.subSections ? 44 : 0) + longest(sub.title) * 8.6 + SLACK
      );
    });
  });
  tasks.forEach((t) => {
    need = Math.max(
      need,
      ind.task + 26 + (num.tasks ? 56 : 0) + longest(t.title) * (density.labelPx * 0.6) + SLACK
    );
  });
  if (rotated) need += 40;
  return Math.min(460, Math.max(base, Math.ceil(need)));
}

/** Resolves 'auto' milestone colors against the canvas theme (fill = a theme accent, border = contrast ink). */
export function resolveMilestoneDesign(md, tokens) {
  const isLight = Boolean(tokens?.isLight);
  const color =
    !md?.color || md.color === 'auto'
      ? tokens?.accents?.[3] || tokens?.primary || '#f59e0b'
      : md.color;
  const borderColor =
    !md?.borderColor || md.borderColor === 'auto'
      ? isLight
        ? '#0f172a'
        : '#ffffff'
      : md.borderColor;
  return { ...md, color, borderColor };
}
