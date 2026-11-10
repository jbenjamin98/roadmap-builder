// Brand-locked canvas modes (Ultimate Duck Mode and the three Appian brand themes).
// Standalone on purpose (no imports) so designOptions.js and themePresets.js can both use it.

export const APPIAN_THEME_IDS = ['appian-light', 'appian-dark', 'appian-slate'];
export const isAppianTheme = (id) => APPIAN_THEME_IDS.includes(id);

/** Hidden style ids used only by the Appian themes (each area has one approved layout). */
export const APPIAN_STYLE_IDS = {
  headerStyle: 'appian-brand',
  periodHeaderStyle: 'appian-tab',
  sectionStyle: 'appian-spine',
  subSectionStyle: 'appian-node',
  taskStyle: 'appian-plain',
  itemStyle: 'appian-bar',
};
export const APPIAN_MILESTONE_SHAPE = 'appian-flag';

/** Brand palette (Appian Brand Guidelines, Sept 2026, pp. 12-17 and 79-82). */
export const APPIAN_COLORS = {
  blue: '#2322F0',
  darkBlue: '#020A51',
  white: '#FFFFFF',
  cyan: '#2AE3FF',
  teal: '#21E9BE',
  violet: '#9F38FA',
  amber: '#FCB858',
  slate: '#2F3A52',
  interfaceGrey: '#4F5C75',
  slateBlue: '#5B7499',
  cloudMist: '#E5EDF6',
  mist: '#B3C3DA',
};

const C = APPIAN_COLORS;

const LIGHT_TOKENS = {
  textMain: C.darkBlue,
  textSecondary: C.slate,
  textMuted: C.interfaceGrey,
  gridBorder: '#D3DBE7',
  gridSubtle: '#E4E8ED',
  stickyBg: C.white,
  stickyAltBg: '#F0F2F4',
  subHeaderBg: C.cloudMist, // opaque full-width sub-section band
  rowBgEven: C.white,
  rowBgOdd: '#F6F8FB',
  colShadeBg: 'rgba(2, 10, 81, 0.035)',
  chipBg: C.white,
  chipBorder: '#D3DBE7',
  legendBarBg: C.white,
  canvasBorder: '#D3DBE7',
  brand: {
    accent: C.blue,
    tag: C.blue,
    logo: 'blue',
    band: C.darkBlue,
    bandText: C.white,
    milestone: { color: C.blue, border: C.white }, // blue flag; the bold white outline keeps it visible on blue bars
    subRowBorder: '#B3C3DA',
  },
};

const DARK_TOKENS = {
  textMain: C.white,
  textSecondary: C.cloudMist,
  textMuted: C.mist,
  gridBorder: 'rgba(179, 195, 218, 0.22)',
  gridSubtle: 'rgba(179, 195, 218, 0.12)',
  stickyBg: C.darkBlue,
  stickyAltBg: '#070E69',
  subHeaderBg: '#0A1079', // Appian Blue 25% over Dark Blue (opaque)
  rowBgEven: 'rgba(2, 10, 81, 0.4)',
  rowBgOdd: 'rgba(35, 34, 240, 0.1)',
  colShadeBg: 'rgba(255, 255, 255, 0.04)',
  chipBg: '#070E69',
  chipBorder: 'rgba(179, 195, 218, 0.3)',
  legendBarBg: 'rgba(7, 14, 105, 0.85)',
  canvasBorder: 'rgba(179, 195, 218, 0.3)',
  brand: {
    accent: C.cyan,
    tag: C.white,
    logo: 'white',
    band: C.blue,
    bandText: C.white,
    milestone: { color: C.cyan, border: C.darkBlue },
    subRowBorder: 'rgba(42, 227, 255, 0.35)',
  },
};

// Slate mode (p. 17): 50% standard slate, 25% cyan, 20% white/neutral, 5% Cloud Mist.
const SLATE_TOKENS = {
  textMain: C.white,
  textSecondary: C.cloudMist,
  textMuted: C.mist,
  gridBorder: 'rgba(179, 195, 218, 0.25)',
  gridSubtle: 'rgba(179, 195, 218, 0.14)',
  stickyBg: C.slate,
  stickyAltBg: '#414D65', // Standard Slate lifted toward Interface Grey (opaque for sticky cells)
  subHeaderBg: C.interfaceGrey, // opaque full-width sub-section band
  rowBgEven: C.slate,
  rowBgOdd: 'rgba(79, 92, 117, 0.35)',
  colShadeBg: 'rgba(255, 255, 255, 0.04)',
  chipBg: C.interfaceGrey,
  chipBorder: 'rgba(179, 195, 218, 0.35)',
  legendBarBg: 'rgba(47, 58, 82, 0.9)',
  canvasBorder: 'rgba(179, 195, 218, 0.3)',
  brand: {
    accent: C.cyan,
    tag: C.white,
    logo: 'white',
    band: C.slateBlue, // Standard Slate third tone (p. 14)
    bandText: C.white,
    milestone: { color: C.cloudMist, border: C.slate },
    subRowBorder: 'rgba(179, 195, 218, 0.4)',
  },
};

/** Presets in the PRESET_THEMES shape. `isBrand` keeps them out of the normal theme galleries. */
export const APPIAN_PRESETS = [
  {
    id: 'appian-light',
    name: 'Appian Light',
    description: 'Brand light mode for everyday slideware, case studies and sales pitches',
    isBrand: true,
    isLight: true,
    primary: C.blue,
    secondary: C.white,
    accents: [C.darkBlue, C.cyan, C.violet, C.amber],
    surfaceBg: C.white,
    headerGradient: C.white,
    glassBorder: LIGHT_TOKENS.canvasBorder,
    tokenOverrides: LIGHT_TOKENS,
  },
  {
    id: 'appian-dark',
    name: 'Appian Dark',
    description: 'Brand dark mode for events and keynote presentations',
    isBrand: true,
    isLight: false,
    primary: C.blue,
    secondary: C.darkBlue,
    accents: [C.cyan, C.teal, C.violet, C.amber],
    surfaceBg: C.darkBlue,
    headerGradient: C.darkBlue,
    glassBorder: DARK_TOKENS.canvasBorder,
    tokenOverrides: DARK_TOKENS,
  },
  {
    id: 'appian-slate',
    name: 'Appian Slate',
    description:
      'Premium high-contrast mode for main stage, events and large screens (brand-team approved use cases)',
    isBrand: true,
    isLight: false,
    primary: C.cyan,
    secondary: C.slate,
    accents: [C.blue, C.teal, C.violet, C.amber],
    surfaceBg: C.slate,
    headerGradient: C.slate,
    glassBorder: SLATE_TOKENS.canvasBorder,
    tokenOverrides: SLATE_TOKENS,
  },
];

// Earlier brand milestone shapes that no longer exist. LEGACY_MILESTONE_SHAPES = ['appian-diamond', 'appian-node'];

// Earlier brand milestone shapes that no longer exist.
const LEGACY_MILESTONE_SHAPES = ['appian-diamond', 'appian-node'];

const presetFor = (id) => APPIAN_PRESETS.find((p) => p.id === id);

/** Brand token block (accent, tag, logo, band, milestone, subRowBorder) for an Appian theme id. */
export function getBrandTokens(brandTheme) {
  return presetFor(brandTheme)?.tokenOverrides.brand;
}

/** Accent for hierarchy markers in a brand theme (Appian Blue on light, Cyan on dark/slate). */
export function getBrandAccent(brandTheme) {
  return getBrandTokens(brandTheme)?.accent;
}

/**
 * Returns the locked design for an Appian theme. Timeline, legend, banner, grid settings are kept.
 * @param {Record<string, any>} [prev]
 * @param {'light' | 'dark' | 'slate'} [mode]
 */
export function getAppianDesign(prev = {}, mode = 'light') {
  const id = isAppianTheme(`appian-${mode}`) ? `appian-${mode}` : 'appian-light';
  const ms = getBrandTokens(id).milestone;
  // Moving between Appian themes keeps the chosen milestone shape; entering one starts with the flag.
  const prevShape = prev.milestone?.shape;
  const keepShape =
    isAppianTheme(prev.brandTheme) && prevShape && !LEGACY_MILESTONE_SHAPES.includes(prevShape);
  return {
    ...prev,
    duckMode: false,
    brandTheme: id,
    ...APPIAN_STYLE_IDS,
    canvasCorners: 'subtle',
    numberingStyle: 'soft-tint',
    effects: Object.fromEntries(Object.keys(prev.effects || {}).map((k) => [k, false])),
    milestone: {
      ...(prev.milestone || {}),
      shape: keepShape ? prevShape : APPIAN_MILESTONE_SHAPE,
      color: ms.color,
      borderStyle: 'solid',
      borderColor: ms.border,
      borderWidth: 2,
    },
  };
}

/**
 * Replaces every brand-only style with the app default and clears the brand flag.
 * @param {Record<string, any>} [prev]
 * @param {Record<string, any>} [defaults]
 */
export function exitBrandDesign(prev = {}, defaults = {}) {
  /** @type {Record<string, any>} */
  const next = { ...prev, brandTheme: '' };
  Object.keys(APPIAN_STYLE_IDS).forEach((key) => {
    if (String(prev[key] || '').startsWith('appian-')) next[key] = defaults[key];
  });
  if (prev.brandTheme) {
    next.effects = { ...defaults.effects };
    next.canvasCorners = defaults.canvasCorners;
    next.milestone = { ...defaults.milestone };
  }
  return next;
}

export const DUCK_THEME_PALETTE = {
  primary: '#eab308',
  secondary: '#082f49',
  accents: ['#facc15', '#f97316', '#0d9488', '#0284c7'],
  baseMode: 'dark',
};

export function getDuckModeDesign(prev = {}) {
  return {
    ...prev,
    duckMode: true,
    brandTheme: '',
    headerStyle: 'duck-pond',
    periodHeaderStyle: 'pill-badge',
    sectionStyle: 'rotated-badge',
    subSectionStyle: 'tree-line',
    taskStyle: 'dot',
    itemStyle: 'pill-gradient',
    canvasCorners: 'pill',
    milestone: {
      ...(prev.milestone || {}),
      shape: 'duck-egg',
      color: '#f59e0b',
      borderStyle: 'solid',
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  };
}

const ALL_TABS = [
  'timeline',
  'banner',
  'themes',
  'fonts',
  'effects',
  'header',
  'period',
  'section',
  'subsection',
  'task',
  'numbering',
  'bars',
  'milestones',
  'legend',
  'condensed',
  'grid',
];

/** Tabs that stay editable while a brand mode is active. */
export const BRAND_EDITABLE_TABS = {
  duck: ['timeline', 'banner', 'themes'],
  appian: [
    'timeline',
    'banner',
    'themes',
    'numbering',
    'legend',
    'condensed',
    'grid',
    'milestones',
  ],
};

/** Returns the Set of settings tab ids that are locked for a design. */
export function getLockedTabs(design) {
  const mode = design?.duckMode ? 'duck' : isAppianTheme(design?.brandTheme) ? 'appian' : null;
  if (!mode) return new Set();
  const editable = new Set(BRAND_EDITABLE_TABS[mode]);
  return new Set(ALL_TABS.filter((t) => !editable.has(t)));
}
