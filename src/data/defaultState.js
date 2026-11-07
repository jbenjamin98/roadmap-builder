import { PRESET_THEMES } from '../constants/themes';

export const STORAGE_KEY = 'roadmap_builder_state_v1';

export function getSampleRoadmapState() {
  const defaultTheme = PRESET_THEMES[0];

  return {
    version: 1,
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
    },
    legend: [
      {
        id: 'leg-core',
        label: 'Core Engineering',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(139, 92, 246, 0.88) 100%)',
      },
      {
        id: 'leg-security',
        label: 'Security & Governance',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.92) 0%, rgba(6, 182, 212, 0.88) 100%)',
      },
      {
        id: 'leg-ux',
        label: 'Product & Experience',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.92) 0%, rgba(244, 63, 94, 0.88) 100%)',
      },
      {
        id: 'leg-release',
        label: 'GA Launch / Gate',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(234, 88, 12, 0.9) 100%)',
      },
    ],
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
        legendId: 'leg-core',
        label: 'Region Mesh Rollout',
        hasEndMilestone: true,
      },
      {
        id: 'item-2',
        taskId: 'task-1',
        startPeriod: 5,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-release',
        label: 'Edge v2.0 Cutover',
      },
      {
        id: 'item-3',
        taskId: 'task-2',
        startPeriod: 2,
        duration: 4,
        type: 'bar',
        legendId: 'leg-security',
        label: 'Policy Engine & SSO Audit',
        hasEndMilestone: false,
      },
      {
        id: 'item-4',
        taskId: 'task-2',
        startPeriod: 7,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-release',
        label: 'External Audit Sign-off',
      },
      {
        id: 'item-5',
        taskId: 'task-3',
        startPeriod: 3,
        duration: 4,
        type: 'bar',
        legendId: 'leg-ux',
        label: 'Interactive Insights & Beta',
        hasEndMilestone: true,
      },
      {
        id: 'item-6',
        taskId: 'task-3',
        startPeriod: 8,
        duration: 1,
        type: 'milestone',
        legendId: 'leg-release',
        label: 'Q1 Executive Launch',
      },
    ],
  };
}

/**
 * Validates and normalizes a roadmap state object (from localStorage or JSON upload)
 */
export function normalizeRoadmapState(raw) {
  const sample = getSampleRoadmapState();
  if (!raw || typeof raw !== 'object') return sample;

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
        }))
      : sample.legend;

  const sections =
    Array.isArray(raw.sections) && raw.sections.length > 0
      ? raw.sections.map((sec, sIdx) => ({
          id: sec.id || `sec-${sIdx + 1}`,
          title: sec.title || `Section ${sIdx + 1}`,
          subSections: Array.isArray(sec.subSections)
            ? sec.subSections.map((sub, subIdx) => ({
                id: sub.id || `sub-${sIdx + 1}-${subIdx + 1}`,
                title: sub.title || `Sub-section ${subIdx + 1}`,
              }))
            : [],
        }))
      : sample.sections;

  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks.map((t, tIdx) => ({
        id: t.id || `task-${tIdx + 1}`,
        subSectionId: t.subSectionId,
        title: t.title || `Task ${tIdx + 1}`,
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
    version: 1,
    config,
    legend,
    sections,
    tasks,
    timelineItems,
  };
}

export function loadRoadmapState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = getSampleRoadmapState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeRoadmapState(parsed);
    return normalized;
  } catch (err) {
    console.warn('Failed to parse roadmap_builder_state_v1 from localStorage, falling back to sample:', err);
    const sample = getSampleRoadmapState();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    } catch {
      // ignore storage quota errors
    }
    return sample;
  }
}

export function saveRoadmapState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist roadmap state to localStorage:', err);
  }
}
