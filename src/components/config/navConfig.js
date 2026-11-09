import {
  Calendar,
  Columns,
  Diamond,
  Eye,
  Grid,
  Layers,
  ListOrdered,
  Minimize2,
  Palette,
  PanelTop,
  Rows,
  Sliders,
  Sparkles,
  Type,
} from 'lucide-react';
import { getDensity } from '../../constants/designOptions';

export const FIXED_LENGTH_PERIODS = new Set(['Weeks', 'Months', 'Quarters']);

export const NAV_GROUPS = [
  {
    group: 'Setup',
    items: [
      { id: 'timeline', label: 'Timeline & Dates', icon: Calendar },
      { id: 'banner', label: 'Header Details', icon: Layers },
    ],
  },
  {
    group: 'Look & Feel',
    items: [
      { id: 'themes', label: 'Canvas Themes', icon: Palette },
      { id: 'fonts', label: 'Typography', icon: Type },
      { id: 'effects', label: 'Surface Effects', icon: Sparkles },
    ],
  },
  {
    group: 'Hierarchy',
    items: [
      { id: 'header', label: 'Canvas Header', icon: PanelTop },
      { id: 'period', label: 'Period Headers', icon: Columns },
      { id: 'section', label: 'Sections', icon: Rows },
      { id: 'subsection', label: 'Sub-sections', icon: Layers },
      { id: 'task', label: 'Task Rows', icon: ListOrdered },
      { id: 'numbering', label: 'Numbering', icon: ListOrdered },
    ],
  },
  {
    group: 'Timeline Items',
    items: [
      { id: 'bars', label: 'Timeline Bars', icon: Sliders },
      { id: 'milestones', label: 'Milestones', icon: Diamond },
      { id: 'legend', label: 'Legend', icon: Eye },
    ],
  },
  {
    group: 'Layout',
    items: [
      { id: 'condensed', label: 'Condensed View', icon: Minimize2 },
      { id: 'grid', label: 'Grid & Display', icon: Grid },
    ],
  },
];

export const BASE_DENSITY = getDensity({ condensedModes: [] });

export const inputCls =
  'w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500';
