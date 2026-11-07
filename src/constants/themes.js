export const PERIOD_TYPES = [
  { value: 'Sprints', singular: 'Sprint', defaultWeeks: 2 },
  { value: 'Iterations', singular: 'Iteration', defaultWeeks: 2 },
  { value: 'PIs', singular: 'PI', defaultWeeks: 10 },
  { value: 'Weeks', singular: 'Week', defaultWeeks: 1 },
  { value: 'Months', singular: 'Month', defaultWeeks: 4 },
  { value: 'Quarters', singular: 'Quarter', defaultWeeks: 13 },
];

export const FONT_STYLES = [
  {
    id: 'sans',
    name: 'Modern Sans (Inter)',
    className: 'font-sans',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    sample: 'Clean & Crisp UI',
  },
  {
    id: 'display',
    name: 'Executive Geometric (Jakarta)',
    className: 'font-display',
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    sample: 'Bold Presentation',
  },
  {
    id: 'serif',
    name: 'Editorial Serif (Playfair)',
    className: 'font-serif',
    fontFamily: "'Playfair Display', Georgia, serif",
    sample: 'Strategic Narrative',
  },
  {
    id: 'mono',
    name: 'Engineering Mono (JetBrains)',
    className: 'font-mono',
    fontFamily: "'JetBrains Mono', monospace",
    sample: 'Technical Precision',
  },
];

// 6 elegant preset color patterns using a mix of gradients and glassmorphism + 1 Custom option
export const PRESET_THEMES = [
  {
    id: 'aurora-glass',
    name: 'Aurora Glass',
    description: 'Deep indigo glassmorphism with electric violet & cyan gradients',
    primary: '#6366f1',
    secondary: '#0f172a',
    accents: ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b'],
    surfaceBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 27, 75, 0.94) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(99, 102, 241, 0.22) 0%, rgba(236, 72, 153, 0.14) 50%, rgba(20, 184, 166, 0.18) 100%)',
    glassBorder: 'rgba(129, 140, 248, 0.25)',
  },
  {
    id: 'cyber-emerald',
    name: 'Emerald Nebula',
    description: 'Frosted obsidian slate with bioluminescent emerald & teal gradients',
    primary: '#10b981',
    secondary: '#061512',
    accents: ['#34d399', '#06b6d4', '#3b82f6', '#a855f7'],
    surfaceBg: 'linear-gradient(135deg, rgba(6, 21, 18, 0.97) 0%, rgba(15, 23, 42, 0.95) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(16, 185, 129, 0.24) 0%, rgba(6, 182, 212, 0.16) 100%)',
    glassBorder: 'rgba(52, 211, 153, 0.25)',
  },
  {
    id: 'sunset-prism',
    name: 'Sunset Prism',
    description: 'Warm twilight glass with coral rose, amber gold & magenta gradients',
    primary: '#f43f5e',
    secondary: '#18101c',
    accents: ['#fb7185', '#f59e0b', '#a855f7', '#ec4899'],
    surfaceBg: 'linear-gradient(135deg, rgba(24, 16, 28, 0.97) 0%, rgba(39, 17, 35, 0.94) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(244, 63, 94, 0.24) 0%, rgba(245, 158, 11, 0.18) 100%)',
    glassBorder: 'rgba(251, 113, 133, 0.26)',
  },
  {
    id: 'oceanic-frost',
    name: 'Oceanic Frost',
    description: 'Deep abyssal blue with crystalline sky, cyan & sapphire glass cards',
    primary: '#0ea5e9',
    secondary: '#081426',
    accents: ['#38bdf8', '#2dd4bf', '#818cf8', '#f472b6'],
    surfaceBg: 'linear-gradient(135deg, rgba(8, 20, 38, 0.97) 0%, rgba(15, 32, 58, 0.94) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(14, 165, 233, 0.25) 0%, rgba(45, 212, 191, 0.16) 100%)',
    glassBorder: 'rgba(56, 189, 248, 0.25)',
  },
  {
    id: 'monaco-luxe',
    name: 'Monaco Gold',
    description: 'Executive charcoal glass with champagne gold, bronze & ruby accents',
    primary: '#eab308',
    secondary: '#141417',
    accents: ['#facc15', '#fb923c', '#f87171', '#60a5fa'],
    surfaceBg: 'linear-gradient(135deg, rgba(20, 20, 23, 0.98) 0%, rgba(31, 27, 22, 0.95) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(234, 179, 8, 0.22) 0%, rgba(251, 146, 60, 0.14) 100%)',
    glassBorder: 'rgba(250, 204, 21, 0.24)',
  },
  {
    id: 'nordic-quartz',
    name: 'Nordic Quartz',
    description: 'Translucent slate violet with soft lavender, mint & sky gradients',
    primary: '#8b5cf6',
    secondary: '#111827',
    accents: ['#a78bfa', '#34d399', '#60a5fa', '#f472b6'],
    surfaceBg: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97) 0%, rgba(31, 25, 52, 0.95) 100%)',
    headerGradient: 'linear-gradient(90deg, rgba(139, 92, 246, 0.24) 0%, rgba(96, 165, 250, 0.16) 100%)',
    glassBorder: 'rgba(167, 139, 250, 0.25)',
  },
];

export const LEGEND_PRESET_STYLES = [
  {
    name: 'Indigo Pulse',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.85) 100%)',
  },
  {
    name: 'Emerald Flow',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(6, 182, 212, 0.85) 100%)',
  },
  {
    name: 'Sunset Blaze',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.9) 0%, rgba(245, 158, 11, 0.85) 100%)',
  },
  {
    name: 'Oceanic Sky',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.9) 0%, rgba(59, 130, 246, 0.85) 100%)',
  },
  {
    name: 'Amber Glow',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(234, 88, 12, 0.85) 100%)',
  },
  {
    name: 'Fuchsia Beam',
    color: '#d946ef',
    gradient: 'linear-gradient(135deg, rgba(217, 70, 239, 0.9) 0%, rgba(236, 72, 153, 0.85) 100%)',
  },
];

export function getSingularPeriodLabel(periodLabel = 'Sprints') {
  const found = PERIOD_TYPES.find(
    (p) => p.value.toLowerCase() === String(periodLabel).toLowerCase()
  );
  if (found) return found.singular;
  if (periodLabel.endsWith('s') && periodLabel.length > 2) {
    return periodLabel.slice(0, -1);
  }
  return periodLabel || 'Period';
}
