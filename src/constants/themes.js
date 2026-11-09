export { FONT_STYLES } from './fontStyles';
export { PRESET_THEMES } from './themePresets';

export const PERIOD_TYPES = [
  { value: 'Sprints', singular: 'Sprint', defaultWeeks: 2 },
  { value: 'Iterations', singular: 'Iteration', defaultWeeks: 2 },
  { value: 'PIs', singular: 'PI', defaultWeeks: 10 },
  { value: 'Weeks', singular: 'Week', defaultWeeks: 1 },
  { value: 'Months', singular: 'Month', defaultWeeks: 4 },
  { value: 'Quarters', singular: 'Quarter', defaultWeeks: 13 },
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
