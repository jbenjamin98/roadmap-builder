export const EFFECT_TOGGLES = [
  {
    id: 'glass',
    name: 'Frosted Glassmorphism',
    desc: 'Translucent blur with specular top rim & frosted border',
  },
  {
    id: 'gradients',
    name: 'Multi-Stop Gradients',
    desc: 'Vibrant angled color transitions vs solid fills',
  },
  {
    id: 'shadows',
    name: 'Deep Floating Shadows',
    desc: 'Pronounced elevation drop-shadows under bars & cards',
  },
  {
    id: 'neon',
    name: 'Neon Cyber Bloom',
    desc: 'Luminous outer halo + inner core glow on bars & milestones',
  },
  {
    id: 'neumorphic',
    name: '3D Neumorphic Pillow',
    desc: 'Tactile dual-bevel highlight & shadow extrusion',
  },
  {
    id: 'flat',
    name: 'Ultra-Flat Matte',
    desc: 'Zero shadows, zero gradients, crisp solid geometry',
  },
  {
    id: 'grain',
    name: 'Stippled Film Grain',
    desc: 'Tactile editorial dot-matrix texture across the canvas',
  },
  {
    id: 'brutalist',
    name: 'Neo-Brutalist Hard Ink',
    desc: 'Thick 2.5px ink borders with sharp 4px offset block shadow',
  },
  {
    id: 'retro-scan',
    name: 'Blueprint Scanlines',
    desc: 'Technical horizontal scanline overlay across canvas & bars',
  },
  {
    id: 'metallic',
    name: 'Brushed Chrome',
    desc: 'Diagonal specular sheen streaks across bars and header',
  },
  {
    id: 'sketch',
    name: 'Ink Sketch',
    desc: 'Hand-drawn ink outlines with crosshatch fill on ruled paper',
  },
  {
    id: 'duotone',
    name: 'Duotone Split',
    desc: 'Bars split into two bold contrasting theme colors',
  },
  {
    id: 'watercolor',
    name: 'Watercolor Wash',
    desc: 'Soft bleeding pastel color blooms with feathered edges',
  },
  {
    id: 'stitched',
    name: 'Stitched Patch',
    desc: 'Dashed inset stitching like sewn fabric patches',
  },
  {
    id: 'spotlight',
    name: 'Spotlight Vignette',
    desc: 'Ambient light pools, vignette corners and glowing bars',
  },
  {
    id: 'holographic',
    name: 'Holographic Foil',
    desc: 'Iridescent rainbow foil sheen across bars',
  },
  {
    id: 'halftone',
    name: 'Halftone Print',
    desc: 'Comic-print dot pattern shaded into the bars',
  },
  {
    id: 'graph-paper',
    name: 'Graph Paper',
    desc: 'Engineering grid lines drawn across the canvas',
  },
  {
    id: 'carbon',
    name: 'Carbon Weave',
    desc: 'Dark woven carbon-fiber texture in the bars',
  },
  {
    id: 'aurora',
    name: 'Aurora Mesh',
    desc: 'Blended theme-color glows melting into each bar',
  },
  {
    id: 'inner-glow',
    name: 'Inner Glow',
    desc: 'Soft light glowing inward from the bar edges',
  },
  {
    id: 'double-outline',
    name: 'Double Outline',
    desc: 'A white keyline with a colored ring around it',
  },
  {
    id: 'dot-grid',
    name: 'Dot Grid',
    desc: 'Evenly spaced dots across the canvas, like dot paper',
  },
  {
    id: 'diagonal-hatch',
    name: 'Diagonal Hatch',
    desc: 'Soft diagonal hatching across the canvas',
  },
  { id: 'linen', name: 'Linen Weave', desc: 'Fine woven fabric texture in the bars' },
  { id: 'pastel', name: 'Pastel Matte', desc: 'Washed-out soft fill with a crisp colored edge' },
  { id: 'pixel', name: 'Pixel Mosaic', desc: 'Chunky pixel checker shading in the bars' },
  { id: 'underglow', name: 'Under Glow', desc: 'A bright underline and glow beneath each bar' },
  {
    id: 'sticker',
    name: 'Sticker Cut',
    desc: 'Thick white sticker border with a soft drop shadow',
  },
  {
    id: 'emboss',
    name: 'Soft Emboss',
    desc: 'Pressed-in look with light top and dark bottom edges',
  },
  { id: 'pinstripe', name: 'Pinstripe', desc: 'Fine vertical pinstripes across the canvas' },
  { id: 'checker', name: 'Checkerboard', desc: 'Very faint checkerboard behind everything' },
  {
    id: 'corner-glow',
    name: 'Corner Glow',
    desc: 'Theme-colored light glowing from the four corners',
  },
  {
    id: 'bold-outline',
    name: 'Bold Outline',
    desc: 'A strong outline around every bar for extra definition',
  },
  {
    id: 'soft-opacity',
    name: 'Soft Opacity',
    desc: 'Slightly see-through bars that let the canvas show',
  },
  { id: 'vivid', name: 'Vivid Color', desc: 'Boosted saturation and contrast on every bar' },
];

/** Surface effects grouped by what they change (every group is a multiple of three). */
export const EFFECT_CATEGORIES = [
  {
    id: 'fill',
    name: 'Fill Styles',
    desc: 'How the bars are filled. Choose one at a time.',
    ids: [
      'glass',
      'metallic',
      'duotone',
      'watercolor',
      'holographic',
      'halftone',
      'sketch',
      'carbon',
      'aurora',
      'linen',
      'pastel',
      'pixel',
    ],
  },
  {
    id: 'edge',
    name: 'Edge Styles',
    desc: 'How bar edges, rings and shadows look. Choose one at a time.',
    ids: [
      'neon',
      'neumorphic',
      'brutalist',
      'stitched',
      'inner-glow',
      'double-outline',
      'underglow',
      'sticker',
      'emboss',
    ],
  },
  {
    id: 'canvas',
    name: 'Canvas Styles',
    desc: 'Textures laid over the whole roadmap. Combine freely.',
    ids: [
      'grain',
      'retro-scan',
      'graph-paper',
      'spotlight',
      'dot-grid',
      'diagonal-hatch',
      'pinstripe',
      'checker',
      'corner-glow',
    ],
  },
  {
    id: 'global',
    name: 'Global Finish',
    desc: 'Overall depth. Ultra-Flat Matte overrides everything else.',
    ids: ['gradients', 'shadows', 'flat', 'bold-outline', 'soft-opacity', 'vivid'],
  },
];

/**
 * Compatibility rules for surface effects.
 *  - "override-all" (Ultra-Flat) strips every other effect.
 *  - "fill" effects each replace the bar fill, so only one can be active.
 *  - "edge" effects each replace the bar edge/shadow, so only one can be active.
 * Everything else (texture overlays, gradients, shadows) can be combined freely.
 */
export const EFFECT_RULES = {
  flat: { kind: 'override-all' },
  glass: { kind: 'fill' },
  metallic: { kind: 'fill' },
  duotone: { kind: 'fill' },
  watercolor: { kind: 'fill' },
  sketch: { kind: 'fill' },
  stitched: { kind: 'edge' },
  carbon: { kind: 'fill' },
  aurora: { kind: 'fill' },
  'inner-glow': { kind: 'edge' },
  'double-outline': { kind: 'edge' },
  linen: { kind: 'fill' },
  pastel: { kind: 'fill' },
  pixel: { kind: 'fill' },
  underglow: { kind: 'edge' },
  sticker: { kind: 'edge' },
  emboss: { kind: 'edge' },
  holographic: { kind: 'fill' },
  halftone: { kind: 'fill' },
  neon: { kind: 'edge' },
  neumorphic: { kind: 'edge' },
  brutalist: { kind: 'edge' },
};

export const EFFECT_KIND_LABELS = {
  'override-all': 'Overrides all other effects',
  fill: 'Fill style · one at a time',
  edge: 'Edge style · one at a time',
};

/** Returns the next effects object after turning `id` on/off, honouring the rules above. */
export function applyEffectToggle(effects, id, checked) {
  const next = { ...effects, [id]: checked };
  if (!checked) return next;
  const rule = EFFECT_RULES[id];
  if (rule?.kind === 'override-all') {
    Object.keys(next).forEach((k) => {
      if (k !== id) next[k] = false;
    });
  } else if (rule?.kind) {
    Object.keys(next).forEach((k) => {
      if (k !== id && EFFECT_RULES[k]?.kind === rule.kind) next[k] = false;
    });
  }
  return next;
}
