// Catalog of per-roadmap design options. Every id here is stored in config.design.
export {
  EFFECT_TOGGLES,
  EFFECT_CATEGORIES,
  EFFECT_RULES,
  EFFECT_KIND_LABELS,
  applyEffectToggle,
} from './effectOptions';

export const MILESTONE_SHAPES = [
  { id: 'diamond', name: 'Diamond' },
  { id: 'circle', name: 'Circle' },
  { id: 'square', name: 'Square' },
  { id: 'rounded', name: 'Rounded' },
  { id: 'triangle', name: 'Triangle' },
  { id: 'star', name: 'Star' },
  { id: 'flag', name: 'Flag' },
  { id: 'hexagon', name: 'Hexagon' },
  { id: 'shield', name: 'Shield' },
  { id: 'cross', name: 'Cross' },
];

export const MILESTONE_BORDER_STYLES = [
  { id: 'none', name: 'None' },
  { id: 'solid', name: 'Solid' },
  { id: 'dashed', name: 'Dashed' },
  { id: 'double', name: 'Double' },
];

export const DATE_FORMATS = [
  { id: 'MM/dd/yyyy', name: 'US numeric' },
  { id: 'dd/MM/yyyy', name: 'Intl numeric' },
  { id: 'yyyy-MM-dd', name: 'ISO' },
  { id: 'd MMM yyyy', name: 'Day Mon Year' },
  { id: 'MMM d, yyyy', name: 'Mon Day, Year' },
  { id: 'MMMM d, yyyy', name: 'Long' },
  { id: 'dd.MM.yy', name: 'Dotted short' },
  { id: 'MMM d', name: 'Compact' },
];

export const CONDENSED_MODES = [
  { id: 'compact-rows', name: 'Compact task rows', desc: 'Shorter task rows and bars' },
  { id: 'slim-headers', name: 'Slim headers', desc: 'Thin period, section and sub-section bands' },
  {
    id: 'narrow-columns',
    name: 'Narrow period columns',
    desc: 'Fit more periods across the screen',
  },
  { id: 'single-line', name: 'Single-line labels', desc: 'Labels stay on one line and truncate' },
  { id: 'hide-dates', name: 'Hide header dates', desc: 'Remove date ranges from period headers' },
  {
    id: 'narrow-hierarchy',
    name: 'Narrow left column',
    desc: 'Shrink the frozen hierarchy column',
  },
  { id: 'micro-type', name: 'Micro typography', desc: 'Smaller labels, badges and milestones' },
  { id: 'tight-gaps', name: 'Tight bar margins', desc: 'Bars fill their cells edge to edge' },
];

export const SPINE_WIDTH = 40;

export const PERIOD_HEADER_STYLES = [
  { id: 'accent-bar', name: 'Accent bar', desc: 'Colored bar above title' },
  { id: 'pill-badge', name: 'Pill badge', desc: 'Title in a colored pill' },
  { id: 'block-fill', name: 'Block fill', desc: 'Solid colored header cell' },
  { id: 'underline-tabs', name: 'Underline tab', desc: 'Thick colored underline' },
  { id: 'two-tier', name: 'Two-tier', desc: 'Big code, label and date below' },
  { id: 'minimal-text', name: 'Minimal text', desc: 'Plain, print-friendly' },
  { id: 'top-ribbon', name: 'Top ribbon', desc: 'Full-width top stripe & date chip' },
  { id: 'card-inset', name: 'Inset card', desc: 'Floating bordered card inside cell' },
  { id: 'bracket-frame', name: 'Bracket frame', desc: 'Technical corner brackets [ S1 ]' },
  { id: 'timeline-rule', name: 'Timeline rule', desc: 'Mini timeline with start and end nodes' },
  { id: 'date-first', name: 'Date first', desc: 'Accent date line above a bold title' },
  { id: 'range-chips', name: 'Range chips', desc: 'Start and end dates as separate chips' },
  { id: 'calendar-leaf', name: 'Calendar leaf', desc: 'Big start day with the end date beside it' },
  { id: 'split-cell', name: 'Split cell', desc: 'Title block next to a dates block' },
  { id: 'rule-sandwich', name: 'Rule sandwich', desc: 'Title, accent rule, then the dates' },
  { id: 'week-dots', name: 'Week dots', desc: 'One dot per week of the period, plus dates' },
  { id: 'ticket-stub', name: 'Ticket stub', desc: 'Title and dates split by a perforated line' },
  { id: 'month-strip', name: 'Month strip', desc: 'Short month-and-day span above the title' },
];

export const SECTION_STYLES = [
  { id: 'gradient-banner', name: 'Gradient banner', desc: 'Accent fade with number badge' },
  { id: 'solid-band', name: 'Solid band', desc: 'Full solid accent band' },
  { id: 'left-rail', name: 'Left rail', desc: 'Thick accent stripe on the left' },
  { id: 'outlined-card', name: 'Outlined card', desc: 'Bordered rounded header' },
  { id: 'underlined', name: 'Underlined', desc: 'Title with accent underline' },
  { id: 'tab-flag', name: 'Tab flag', desc: 'Colored tab on the left edge' },
  { id: 'floating-pill', name: 'Floating capsule', desc: 'Rounded pill banner' },
  { id: 'double-rule', name: 'Double rule', desc: 'Editorial top & bottom accent lines' },
  { id: 'bracket-ends', name: 'Bracket end', desc: 'Heavy left edge with a rounded right end' },
  { id: 'glow-fade', name: 'Glow fade', desc: 'Soft accent glow fading across the row' },
  { id: 'top-rule', name: 'Top rule', desc: 'Thick accent rule above the title' },
  { id: 'rotated-spine', name: 'Solid spine', desc: 'Vertical solid cap left of its rows' },
  {
    id: 'rotated-outline',
    name: 'Outlined spine',
    desc: 'Vertical tinted cap with accent outline',
  },
  { id: 'rotated-pill', name: 'Capsule spine', desc: 'Vertical rounded capsule in a track' },
  { id: 'rotated-rail', name: 'Rail spine', desc: 'Vertical label with thick accent rail' },
  {
    id: 'rotated-gradient',
    name: 'Gradient spine',
    desc: 'Vertical cap fading from the accent color',
  },
  {
    id: 'rotated-frost',
    name: 'Frosted spine',
    desc: 'Translucent vertical cap with a bright edge',
  },
  { id: 'rotated-badge', name: 'Badge spine', desc: 'Round badge on top of a vertical title' },
];

export const isRotatedSectionStyle = (id) => String(id || '').startsWith('rotated-');

// Sub-sections and tasks share one family of styles (same names, scaled per level).
export const LEVEL_STYLES = [
  { id: 'plain', name: 'Plain', desc: 'Text only' },
  { id: 'dot', name: 'Dot', desc: 'Small accent dot' },
  { id: 'tree-line', name: 'Tree line', desc: 'Connector line' },
  { id: 'left-bar', name: 'Left bar', desc: 'Accent bar on the left' },
  { id: 'soft-fill', name: 'Soft fill', desc: 'Tinted background strip' },
  { id: 'outlined', name: 'Outlined', desc: 'Rounded accent outline' },
  { id: 'pill', name: 'Pill', desc: 'Rounded tinted capsule' },
  { id: 'underline', name: 'Underline', desc: 'Accent rule beneath' },
  { id: 'gradient-fade', name: 'Gradient fade', desc: 'Accent fading to the right' },
  { id: 'tab-flag', name: 'Tab flag', desc: 'Accent tab on a tinted body' },
  { id: 'double-rule', name: 'Double rule', desc: 'Thin rules above and below' },
  { id: 'corner-brackets', name: 'Corner brackets', desc: 'Framing corner marks' },
  { id: 'dashed-box', name: 'Dashed box', desc: 'Dashed rounded frame' },
  { id: 'shadow-card', name: 'Raised card', desc: 'Small card with a soft shadow' },
  { id: 'arrow-ribbon', name: 'Arrow ribbon', desc: 'Pointer arrow leading a tinted strip' },
  { id: 'glow-bar', name: 'Glow bar', desc: 'Left bar with a soft glow' },
  { id: 'trailing-rule', name: 'Trailing rule', desc: 'A thin line running on after the text' },
  { id: 'double-bar', name: 'Double bar', desc: 'Doubled accent bar on the left' },
];
export const SUBSECTION_STYLES = LEVEL_STYLES;
export const TASK_STYLES = LEVEL_STYLES;

export const NUMBERING_STYLES = [
  { id: 'soft-tint', name: 'Soft tint' },
  { id: 'solid-chip', name: 'Solid chip' },
  { id: 'outlined', name: 'Outlined' },
  { id: 'plain', name: 'Plain mono' },
  { id: 'circle', name: 'Circle' },
  { id: 'underline', name: 'Underline' },
  { id: 'bracket', name: 'Brackets' },
  { id: 'paren', name: 'Parentheses' },
  { id: 'dot-suffix', name: 'Trailing dot' },
  { id: 'pill-solid', name: 'Solid pill' },
  { id: 'hash-prefix', name: 'Hash prefix' },
  { id: 'side-rule', name: 'Side rule' },
  { id: 'angle', name: 'Angle brackets' },
  { id: 'slash-suffix', name: 'Trailing slash' },
  { id: 'square-solid', name: 'Solid square' },
  { id: 'arrow-prefix', name: 'Arrow prefix' },
  { id: 'section-sign', name: 'Section sign' },
  { id: 'zero-pad', name: 'Zero padded' },
];

export const ITEM_STYLES = [
  { id: 'pill-gradient', name: 'Rounded bar', desc: 'Smooth rounded bar' },
  { id: 'flat-rect', name: 'Sharp block', desc: 'Crisp square-cornered bar' },
  { id: 'outlined', name: 'Outlined frame', desc: 'Tinted fill + colored border' },
  { id: 'chevron', name: 'Chevron arrow', desc: 'Forward-pointing phase arrow' },
  { id: 'thin-line', name: 'Span track', desc: 'Track line with end-cap nodes' },
  { id: 'soft-bevel', name: '3D Bevel', desc: 'Raised top rim & deep bottom lip' },
  { id: 'bracket-bar', name: 'Gantt bracket', desc: 'Executive bar with downward hooks' },
  { id: 'double-track', name: 'Double rail', desc: 'Bar with bottom accent rail' },
  { id: 'glow-capsule', name: 'Cap & body', desc: 'Solid color cap with frosted body' },
  { id: 'arrow-line', name: 'Arrow line', desc: 'Label over a line ending in an arrowhead' },
  { id: 'label-tag', name: 'Label tag', desc: 'Solid label tab followed by a slim bar' },
  { id: 'track-inset', name: 'Inset track', desc: 'Solid bar nested in a tinted track' },
  { id: 'gradient-edge', name: 'Fade tail', desc: 'Solid start fading out toward the end' },
  { id: 'pentagon', name: 'Home plate', desc: 'Pointed end without a notched start' },
  { id: 'swallowtail', name: 'Swallowtail', desc: 'Flag-style forked end' },
  { id: 'segmented', name: 'Period segments', desc: 'Bar divided into one segment per period' },
  { id: 'beaded', name: 'Beaded track', desc: 'Label over a line of evenly spaced beads' },
  { id: 'label-rule', name: 'Label & rule', desc: 'Label over a rule with end ticks' },
];

export const LEGEND_POSITIONS = [
  { id: 'top', name: 'Top (header)' },
  { id: 'bottom', name: 'Bottom' },
  { id: 'hidden', name: 'Hidden' },
];

export const LEGEND_STYLES = [
  { id: 'chips', name: 'Chips' },
  { id: 'swatches', name: 'Swatches' },
  { id: 'filled', name: 'Filled' },
];

export function getDefaultDesign() {
  return {
    milestone: {
      shape: 'diamond',
      color: 'auto',
      borderStyle: 'solid',
      borderColor: 'auto',
      borderWidth: 2,
    },
    dateFormat: 'MM/dd/yyyy',
    effects: {
      glass: false,
      gradients: true,
      shadows: true,
      neon: false,
      neumorphic: false,
      flat: false,
      grain: false,
      brutalist: false,
      'retro-scan': false,
      metallic: false,
      sketch: false,
      duotone: false,
      watercolor: false,
      stitched: false,
      spotlight: false,
      holographic: false,
      halftone: false,
      'graph-paper': false,
      carbon: false,
      aurora: false,
      'inner-glow': false,
      'double-outline': false,
      'dot-grid': false,
      'diagonal-hatch': false,
      linen: false,
      pastel: false,
      pixel: false,
      underglow: false,
      sticker: false,
      emboss: false,
      pinstripe: false,
      checker: false,
      'corner-glow': false,
      'bold-outline': false,
      'soft-opacity': false,
      vivid: false,
    },
    condensedModes: [],
    periodHeaderStyle: 'accent-bar',
    sectionStyle: 'gradient-banner',
    subSectionStyle: 'dot',
    taskStyle: 'dot',
    itemStyle: 'pill-gradient',
    todayMarker: false,
    alternateColumnShading: false,
    showBarDurationLabels: false,
    sectionDividerGlow: false,
    legendPosition: 'top',
    legendStyle: 'chips',
    legend: {
      showTitle: true,
      includeMilestone: true,
      swatchShape: 'rounded',
      size: 'md',
      layout: 'row',
      align: 'end',
      title: 'Legend',
      frame: 'boxed',
      labelCase: 'normal',
      gap: 'normal',
      milestoneLabel: 'Milestone',
    },
    numbering: { sections: false, subSections: false, tasks: false },
    numberingStyle: 'soft-tint',
    banner: { subtitle: '', owner: '', version: '' },
  };
}

const LEGACY_DENSITY_MODES = {
  compact: ['compact-rows'],
  'slim-headers': ['slim-headers'],
  dense: ['compact-rows', 'narrow-columns', 'micro-type'],
  micro: ['compact-rows', 'narrow-columns', 'micro-type', 'single-line', 'hide-dates'],
};

function normalizeEffects(effects) {
  if (effects.flat) {
    const out = { ...effects };
    Object.keys(out).forEach((k) => {
      if (k !== 'flat') out[k] = false;
    });
    return out;
  }
  return effects;
}

export function normalizeDesign(raw) {
  const d = getDefaultDesign();
  const r = raw && typeof raw === 'object' ? raw : {};
  const validIds = new Set(CONDENSED_MODES.map((m) => m.id));

  let modes;
  if (Array.isArray(r.condensedModes)) {
    modes = r.condensedModes.filter((id) => validIds.has(id));
  } else if (r.condensed) {
    modes = LEGACY_DENSITY_MODES[r.density] || ['compact-rows'];
  } else {
    modes = [];
  }

  const numbering = { ...d.numbering, ...(r.numbering || {}) };
  const SUB_MAP = {
    'diamond-bullet': 'dot',
    'indent-line': 'tree-line',
    chip: 'soft-fill',
    'plain-caps': 'plain',
    'chevron-tag': 'left-bar',
    'left-accent': 'left-bar',
    'square-bullet': 'dot',
    'pill-outline': 'outlined',
    'bottom-dash': 'underline',
    'numbered-sub': 'dot',
  };
  const TASK_MAP = {
    checkbox: 'dot',
    'diamond-node': 'dot',
    numbered: 'dot',
    'dash-bar': 'left-bar',
    'arrow-bullet': 'tab-flag',
    'hollow-ring': 'outlined',
    'card-tile': 'soft-fill',
    'indented-tree': 'tree-line',
    'target-ring': 'dot',
    'hash-tag': 'dot',
    'square-node': 'dot',
  };
  if (r.taskStyle === 'numbered') numbering.tasks = true;
  if (r.subSectionStyle === 'numbered-sub') numbering.subSections = true;
  const taskStyle = TASK_MAP[r.taskStyle] || r.taskStyle || d.taskStyle;
  const subSectionStyle = SUB_MAP[r.subSectionStyle] || r.subSectionStyle || d.subSectionStyle;

  // eslint-disable-next-line no-unused-vars
  const { condensed, density, banner: rawBanner, ...rest } = r;
  const { subtitle = '', owner = '', version = '' } = rawBanner || {};
  return {
    ...d,
    ...rest,
    condensedModes: modes,
    itemStyle:
      r.itemStyle === 'striped'
        ? 'soft-bevel'
        : r.itemStyle === 'dashed-outline' || r.itemStyle === 'two-tone'
          ? 'pill-gradient'
          : r.itemStyle || d.itemStyle,
    taskStyle,
    subSectionStyle,
    numbering,
    milestone: {
      ...d.milestone,
      ...(r.milestone || {}),
      // 'auto' follows the canvas theme; the old fixed amber default migrates to it too.
      color: !r.milestone?.color || r.milestone.color === '#f59e0b' ? 'auto' : r.milestone.color,
      borderColor:
        !r.milestone?.borderColor || r.milestone.borderColor === '#ffffff'
          ? 'auto'
          : r.milestone.borderColor,
    },
    // The column layout was removed; legends are always a row.
    legend: { ...d.legend, ...(r.legend || {}), layout: 'row' },
    effects: normalizeEffects({ ...d.effects, ...(r.effects || {}) }),
    banner: { subtitle, owner, version },
  };
}

/** Combines every active condensed mode into one set of layout metrics. */
export function getDensity(design) {
  const modes = new Set(design?.condensedModes || []);
  const m = {
    modes,
    colWidth: 212,
    leftW: 288,
    barGap: 4,
    rowMin: 54,
    itemMin: 38,
    sectionMin: 42,
    subMin: 34,
    headerPy: 12,
    itemPad: 20,
    lineH: 16,
    charPx: 6.8,
    msSize: 22,
    labelPx: 12,
    vSlack: 14,
    hideDates: false,
    singleLine: false,
  };
  if (modes.has('compact-rows')) {
    Object.assign(m, { rowMin: 42, itemMin: 30, itemPad: 14, lineH: 14, vSlack: 10 });
  }
  if (modes.has('slim-headers')) {
    Object.assign(m, { sectionMin: 26, subMin: 22, headerPy: 6 });
  }
  if (modes.has('narrow-columns')) m.colWidth = 168;
  if (modes.has('single-line')) m.singleLine = true;
  if (modes.has('hide-dates')) m.hideDates = true;
  if (modes.has('narrow-hierarchy')) m.leftW = 224;
  if (modes.has('micro-type')) {
    Object.assign(m, { labelPx: 10, charPx: 5.8, lineH: Math.min(m.lineH, 13), msSize: 16 });
  }
  if (modes.has('tight-gaps')) {
    Object.assign(m, { barGap: 1, vSlack: 6 });
  }
  if (m.singleLine) m.itemPad = Math.min(m.itemPad, 12);
  return m;
}
