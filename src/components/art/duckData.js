export const MAX_DUCKS = 20;

export const QUACK_PHRASES = [
  'Quack!',
  'Cheep! 🐣',
  'Ship it! 🦆',
  'Ducks in a row!',
  'On track!',
  'Zero blockers!',
  'Waddle on!',
  'Milestone hit!',
  'All aligned!',
  'LGTM! 🦆',
];

export const DUCK_PALETTES = [
  {
    name: 'Classic Gold',
    body: '#fbbf24',
    bodyShade: '#d97706',
    head: '#fde047',
    wing: '#f59e0b',
    beak: '#f97316',
    stroke: '#78350f',
    pattern: 'solid',
  },
  {
    name: 'Mallard',
    body: '#a8a29e',
    bodyShade: '#57534e',
    head: '#10b981',
    wing: '#0d9488',
    beak: '#eab308',
    stroke: '#064e3b',
    pattern: 'mallard',
  },
  {
    name: 'Cyber Neon',
    body: '#22d3ee',
    bodyShade: '#0284c7',
    head: '#67e8f9',
    wing: '#ec4899',
    beak: '#fde047',
    stroke: '#1e3a8a',
    pattern: 'stripes',
  },
  {
    name: 'Sakura Pink',
    body: '#f9a8d4',
    bodyShade: '#db2777',
    head: '#fbcfe8',
    wing: '#fb7185',
    beak: '#fb923c',
    stroke: '#831843',
    pattern: 'dots',
  },
  {
    name: 'Royal Lavender',
    body: '#c084fc',
    bodyShade: '#7e22ce',
    head: '#d8b4fe',
    wing: '#6366f1',
    beak: '#fbbf24',
    stroke: '#3b0764',
    pattern: 'stars',
  },
  {
    name: 'Tuxedo',
    body: '#334155',
    bodyShade: '#0f172a',
    head: '#1e293b',
    wing: '#475569',
    beak: '#f97316',
    stroke: '#020617',
    pattern: 'tuxedo',
  },
  {
    name: 'Mint Matcha',
    body: '#6ee7b7',
    bodyShade: '#059669',
    head: '#a7f3d0',
    wing: '#10b981',
    beak: '#fb923c',
    stroke: '#064e3b',
    pattern: 'dots',
  },
  {
    name: 'Sunset Coral',
    body: '#fb7185',
    bodyShade: '#e11d48',
    head: '#fda4af',
    wing: '#f59e0b',
    beak: '#fde047',
    stroke: '#881337',
    pattern: 'solid',
  },
  {
    name: 'Oceanic Frost',
    body: '#38bdf8',
    bodyShade: '#0369a1',
    head: '#7dd3fc',
    wing: '#818cf8',
    beak: '#fbbf24',
    stroke: '#0c4a6e',
    pattern: 'stripes',
  },
  {
    name: 'Snowy White',
    body: '#f8fafc',
    bodyShade: '#94a3b8',
    head: '#ffffff',
    wing: '#bae6fd',
    beak: '#f97316',
    stroke: '#334155',
    pattern: 'solid',
  },
  {
    name: 'Magma Flame',
    body: '#fb923c',
    bodyShade: '#c2410c',
    head: '#fdba74',
    wing: '#facc15',
    beak: '#dc2626',
    stroke: '#7c2d12',
    pattern: 'stars',
  },
  {
    name: 'Galaxy Cosmic',
    body: '#6366f1',
    bodyShade: '#312e81',
    head: '#818cf8',
    wing: '#d946ef',
    beak: '#38bdf8',
    stroke: '#1e1b4b',
    pattern: 'stars',
  },
  {
    name: 'Punk Lime',
    body: '#a3e635',
    bodyShade: '#4d7c0f',
    head: '#bef264',
    wing: '#ec4899',
    beak: '#f97316',
    stroke: '#365314',
    pattern: 'stripes',
  },
  {
    name: 'Sunshine Lemon',
    body: '#fde047',
    bodyShade: '#ca8a04',
    head: '#fef08a',
    wing: '#fb923c',
    beak: '#ea580c',
    stroke: '#713f12',
    pattern: 'dots',
  },
];

export const HAT_STYLES = [
  'captain',
  'crown',
  'wizard',
  'tophat',
  'cowboy',
  'party',
  'viking',
  'chef',
  'pirate',
  'propeller',
  'halo',
  'mohawk',
  'beret',
  'headband',
  'flower',
  'none',
];

export const EYEWEAR_STYLES = [
  'sunglasses',
  'monocle',
  'roundglasses',
  'starshades',
  'eyepatch',
  'none',
  'none',
];

export const ACCESSORY_STYLES = ['bowtie', 'scarf', 'chain', 'bandana', 'none', 'none'];

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createDuckData(index, isLeader = false) {
  const palette = isLeader ? DUCK_PALETTES[0] : pickRandom(DUCK_PALETTES);
  const hat = isLeader ? 'captain' : pickRandom(HAT_STYLES);
  const eyewear = isLeader ? 'sunglasses' : pickRandom(EYEWEAR_STYLES);
  const accessory = isLeader
    ? 'bowtie'
    : palette.pattern === 'tuxedo'
      ? 'bowtie'
      : pickRandom(ACCESSORY_STYLES);

  const pondX = isLeader ? 70 : Math.floor(8 + Math.random() * 84);
  const pondY = isLeader ? 50 : Math.floor(24 + Math.random() * 52);
  const facingLeft = isLeader ? false : Math.random() < 0.38;

  return {
    id: `duck-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    isLeader,
    palette,
    hat,
    eyewear,
    accessory,
    pondX,
    pondY,
    facingLeft,
    delay: `${((index % 10) * 0.25).toFixed(2)}s`,
  };
}
