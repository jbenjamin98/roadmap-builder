import { createId } from '../utils/ids';
import { CURRENT_VERSION, migrateRoadmap } from './migrations';
import { PRESET_THEMES } from '../constants/themes';
import { remapLegendForTheme } from '../constants/legendPresets';
import { getDefaultDesign, normalizeDesign } from '../constants/designOptions';

export const UI_THEME_KEY = 'roadmap_builder_ui_theme_v1';

export function getTodayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultLegend() {
  return [
    {
      id: 'leg-default',
      label: 'Default',
      color: '#6366f1',
      gradient:
        'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(139, 92, 246, 0.88) 100%)',
      hasBorder: false,
      borderColor: '#ffffff',
      isStriped: false,
    },
  ];
}

export function createBlankRoadmapState(customConfig = {}) {
  const defaultTheme = PRESET_THEMES[0];
  const newId = createId('rm');

  return {
    id: newId,
    updatedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
    config: {
      name: customConfig.name || 'Untitled Roadmap',
      periodLabel: customConfig.periodLabel || 'Sprints',
      startDate: customConfig.startDate || getTodayDateString(),
      weeksPerPeriod: Number(customConfig.weeksPerPeriod) || 2,
      totalPeriods: Number(customConfig.totalPeriods) || 8,
      fontStyle: customConfig.fontStyle || 'sans',
      themeId: customConfig.themeId || defaultTheme.id,
      theme: customConfig.theme || {
        primary: defaultTheme.primary,
        secondary: defaultTheme.secondary,
        accents: [...defaultTheme.accents],
      },
      previewSettings: {
        alternateRowHighlighting: customConfig.previewSettings?.alternateRowHighlighting ?? true,
        subtleGridDemarcations: customConfig.previewSettings?.subtleGridDemarcations ?? true,
      },
      design: normalizeDesign(customConfig.design),
    },
    legend: customConfig.theme
      ? remapLegendForTheme(getDefaultLegend(), undefined, customConfig.theme)
      : getDefaultLegend(),
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1',
        subSections: [
          {
            id: 'sub-1',
            title: 'Workstream 1',
          },
        ],
      },
    ],
    tasks: [
      {
        id: 'task-1',
        subSectionId: 'sub-1',
        title: 'Task 1',
      },
    ],
    timelineItems: [],
  };
}

export function getSampleRoadmapState() {
  const defaultTheme = PRESET_THEMES[0];

  return {
    id: 'rm-sample-default',
    updatedAt: new Date().toISOString(),
    version: CURRENT_VERSION,
    config: {
      name: 'Platform Evolution & AI Capabilities Roadmap',
      periodLabel: 'Sprints',
      startDate: '2026-11-09',
      weeksPerPeriod: 2,
      totalPeriods: 8,
      fontStyle: 'sans',
      themeId: defaultTheme.id,
      theme: {
        primary: defaultTheme.primary,
        secondary: defaultTheme.secondary,
        accents: [...defaultTheme.accents],
      },
      previewSettings: {
        alternateRowHighlighting: true,
        subtleGridDemarcations: true,
      },
      design: getDefaultDesign(),
    },
    legend: getDefaultLegend(),
    sections: [
      {
        id: 'sec-1',
        title: 'Foundation & Cloud Infrastructure',
        subSections: [
          {
            id: 'sub-1',
            title: 'Distributed Runtime & Edge',
          },
          {
            id: 'sub-2',
            title: 'Enterprise Trust & Security',
          },
        ],
      },
      {
        id: 'sec-2',
        title: 'Intelligent Experience & Workflows',
        subSections: [
          {
            id: 'sub-3',
            title: 'Self-Service & Analytics Studio',
          },
        ],
      },
    ],
    tasks: [
      {
        id: 'task-1',
        subSectionId: 'sub-1',
        title: 'Multi-Region Edge Mesh & Failover Automation',
      },
      {
        id: 'task-2',
        subSectionId: 'sub-2',
        title: 'SOC2 Type II Automated Evidence & Zero-Trust IAM',
      },
      {
        id: 'task-3',
        subSectionId: 'sub-3',
        title: 'Real-Time Telemetry Canvas & AI Forecasting',
      },
    ],
    timelineItems: [
      {
        id: 'item-1',
        taskId: 'task-1',
        startPeriod: 1,
        duration: 3,
        type: 'bar',
        legendId: 'leg-default',
        label: 'Region Mesh Rollout',
        hasEndMilestone: true,
      },
      {
        id: 'item-2',
        taskId: 'task-1',
        startPeriod: 5,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-default',
        label: 'Edge v2.0 Cutover',
      },
      {
        id: 'item-3',
        taskId: 'task-2',
        startPeriod: 2,
        duration: 4,
        type: 'bar',
        legendId: 'leg-default',
        label: 'Policy Engine & SSO Audit',
        hasEndMilestone: false,
      },
      {
        id: 'item-4',
        taskId: 'task-2',
        startPeriod: 7,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-default',
        label: 'External Audit Sign-off',
      },
      {
        id: 'item-5',
        taskId: 'task-3',
        startPeriod: 3,
        duration: 4,
        type: 'bar',
        legendId: 'leg-default',
        label: 'Interactive Insights & Beta',
        hasEndMilestone: true,
      },
      {
        id: 'item-6',
        taskId: 'task-3',
        startPeriod: 8,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-default',
        label: 'Q1 Executive Launch',
      },
    ],
  };
}

/**
 * Validates and normalizes a roadmap state object (from localStorage or JSON upload)
 */
export function normalizeRoadmapState(input, options = {}) {
  const sample = getSampleRoadmapState();
  if (!input || typeof input !== 'object') return sample;
  const raw = migrateRoadmap(input);

  const id = options.forceNewId ? createId('rm') : raw.id || createId('rm');

  const config = {
    ...sample.config,
    ...(raw.config || {}),
    theme: {
      ...sample.config.theme,
      ...(raw.config?.theme || {}),
      accents:
        Array.isArray(raw.config?.theme?.accents) && raw.config.theme.accents.length >= 4
          ? raw.config.theme.accents.slice(0, 4)
          : sample.config.theme.accents,
    },
    previewSettings: {
      ...sample.config.previewSettings,
      ...(raw.config?.previewSettings || {}),
    },
    design: normalizeDesign(raw.config?.design),
  };

  const legend =
    Array.isArray(raw.legend) && raw.legend.length > 0
      ? raw.legend.map((l, idx) => ({
          id: l.id || `leg-${idx + 1}`,
          label: l.label || `Category ${idx + 1}`,
          color: l.color || '#6366f1',
          gradient:
            l.gradient ||
            `linear-gradient(135deg, ${l.color || '#6366f1'}e6 0%, ${l.color || '#6366f1'}cc 100%)`,
          hasBorder: Boolean(l.hasBorder),
          borderColor: l.borderColor || '#ffffff',
          isStriped: Boolean(l.isStriped),
        }))
      : sample.legend;

  const sections = Array.isArray(raw.sections)
    ? raw.sections.map((sec, sIdx) => ({
        id: sec.id || `sec-${sIdx + 1}`,
        title: sec.title ?? `Section ${sIdx + 1}`,
        collapsed: Boolean(sec.collapsed),
        subSections: Array.isArray(sec.subSections)
          ? sec.subSections.map((sub, subIdx) => ({
              id: sub.id || `sub-${sIdx + 1}-${subIdx + 1}`,
              title: sub.title ?? `Sub-section ${subIdx + 1}`,
            }))
          : [],
      }))
    : sample.sections;

  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks.map((t, tIdx) => ({
        id: t.id || `task-${tIdx + 1}`,
        subSectionId: t.subSectionId,
        title: t.title ?? `Task ${tIdx + 1}`,
      }))
    : sample.tasks;

  const timelineItems = Array.isArray(raw.timelineItems)
    ? raw.timelineItems.map((item, iIdx) => ({
        id: item.id || `item-${iIdx + 1}`,
        taskId: item.taskId,
        startPeriod: Math.max(1, Number(item.startPeriod) || 1),
        duration: Math.max(1, Number(item.duration) || 1),
        type: item.type === 'milestone' ? 'milestone' : 'bar',
        legendId: item.legendId || legend[0]?.id,
        label: item.label ?? '',
        hasEndMilestone: Boolean(item.hasEndMilestone),
      }))
    : sample.timelineItems;

  return {
    id,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    version: CURRENT_VERSION,
    config,
    legend,
    sections,
    tasks,
    timelineItems,
  };
}

export function loadUiThemeMode() {
  try {
    const saved = localStorage.getItem(UI_THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveUiThemeMode(mode) {
  try {
    localStorage.setItem(UI_THEME_KEY, mode === 'light' ? 'light' : 'dark');
  } catch {
    // ignore
  }
}
