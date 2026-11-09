import { arrayMove } from '@dnd-kit/sortable';
import { normalizeDesign } from '../constants/designOptions';
import { remapLegendForTheme } from '../constants/legendPresets';
import { placeNewBar, resolveBarUpdate } from './barOverlap';

/**
 * Pure reducer for the roadmap document. No ids, dates or randomness are generated here: action
 * creators (see actions.js) supply them, which keeps this trivially testable and undo-friendly.
 */
export function roadmapReducer(state, action) {
  switch (action.type) {
    case 'REPLACE':
      return action.state;

    case 'CONFIG_UPDATE': {
      const updated = action.config;
      const themeChanged =
        updated.theme && JSON.stringify(updated.theme) !== JSON.stringify(state.config?.theme);
      return {
        ...state,
        legend: themeChanged
          ? remapLegendForTheme(state.legend, state.config?.theme, updated.theme)
          : state.legend,
        config: {
          ...state.config,
          ...updated,
          previewSettings: {
            ...(state.config?.previewSettings || {}),
            ...(updated.previewSettings || {}),
          },
          design: normalizeDesign({
            ...(state.config?.design || {}),
            ...(updated.design || {}),
          }),
        },
      };
    }

    // ---- Legend
    case 'LEGEND_ADD': {
      const { id, label, color, gradient, hasBorder, borderColor, isStriped } = action;
      return {
        ...state,
        legend: [
          ...state.legend,
          {
            id,
            label,
            color,
            gradient,
            hasBorder: Boolean(hasBorder),
            borderColor: borderColor || '#ffffff',
            isStriped: Boolean(isStriped),
          },
        ],
      };
    }
    case 'LEGEND_UPDATE':
      return {
        ...state,
        legend: state.legend.map((c) =>
          c.id === action.legendId ? { ...c, ...action.updates } : c
        ),
      };
    case 'LEGEND_DELETE': {
      const remaining = state.legend.filter((c) => c.id !== action.legendId);
      const fallbackId = remaining[0]?.id;
      return {
        ...state,
        legend: remaining,
        timelineItems: state.timelineItems.map((item) =>
          item.legendId === action.legendId ? { ...item, legendId: fallbackId } : item
        ),
      };
    }

    // ---- Sections
    case 'SECTION_ADD': {
      const { sectionId, subSectionId, taskId } = action;
      return {
        ...state,
        sections: [
          ...state.sections,
          {
            id: sectionId,
            title: `New Section ${state.sections.length + 1}`,
            subSections: [{ id: subSectionId, title: 'Primary Workstream' }],
          },
        ],
        tasks: [...state.tasks, { id: taskId, subSectionId, title: 'Key Deliverable' }],
      };
    }
    case 'SECTION_TITLE':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, title: action.title } : s
        ),
      };
    case 'SECTION_DELETE': {
      const target = state.sections.find((s) => s.id === action.sectionId);
      const subIds = new Set((target?.subSections || []).map((sub) => sub.id));
      const taskIds = new Set(
        state.tasks.filter((t) => subIds.has(t.subSectionId)).map((t) => t.id)
      );
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.sectionId),
        tasks: state.tasks.filter((t) => !subIds.has(t.subSectionId)),
        timelineItems: state.timelineItems.filter((i) => !taskIds.has(i.taskId)),
      };
    }
    case 'SECTIONS_REORDER': {
      const from = state.sections.findIndex((s) => s.id === action.activeId);
      const to = state.sections.findIndex((s) => s.id === action.overId);
      if (from === -1 || to === -1) return state;
      return { ...state, sections: arrayMove(state.sections, from, to) };
    }

    // ---- Sub-sections
    case 'SUBSECTION_ADD': {
      const { sectionId, subSectionId, taskId } = action;
      return {
        ...state,
        sections: state.sections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                subSections: [
                  ...sec.subSections,
                  { id: subSectionId, title: `Workstream ${sec.subSections.length + 1}` },
                ],
              }
            : sec
        ),
        tasks: [...state.tasks, { id: taskId, subSectionId, title: 'New Initiative Task' }],
      };
    }
    case 'SUBSECTION_TITLE':
      return {
        ...state,
        sections: state.sections.map((sec) =>
          sec.id === action.sectionId
            ? {
                ...sec,
                subSections: sec.subSections.map((sub) =>
                  sub.id === action.subSectionId ? { ...sub, title: action.title } : sub
                ),
              }
            : sec
        ),
      };
    case 'SUBSECTION_DELETE': {
      const taskIds = new Set(
        state.tasks.filter((t) => t.subSectionId === action.subSectionId).map((t) => t.id)
      );
      return {
        ...state,
        sections: state.sections.map((sec) =>
          sec.id === action.sectionId
            ? {
                ...sec,
                subSections: sec.subSections.filter((sub) => sub.id !== action.subSectionId),
              }
            : sec
        ),
        tasks: state.tasks.filter((t) => t.subSectionId !== action.subSectionId),
        timelineItems: state.timelineItems.filter((i) => !taskIds.has(i.taskId)),
      };
    }
    case 'SUBSECTIONS_REORDER':
      return {
        ...state,
        sections: state.sections.map((sec) => {
          if (sec.id !== action.sectionId) return sec;
          const from = sec.subSections.findIndex((s) => s.id === action.activeId);
          const to = sec.subSections.findIndex((s) => s.id === action.overId);
          if (from === -1 || to === -1) return sec;
          return { ...sec, subSections: arrayMove(sec.subSections, from, to) };
        }),
      };

    // ---- Tasks
    case 'TASK_ADD':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id: action.taskId, subSectionId: action.subSectionId, title: 'New Task / Activity' },
        ],
      };
    case 'TASK_TITLE':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.taskId ? { ...t, title: action.title } : t)),
      };
    case 'TASK_DELETE':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.taskId),
        timelineItems: state.timelineItems.filter((i) => i.taskId !== action.taskId),
      };
    case 'TASKS_REORDER': {
      const subTasks = state.tasks.filter((t) => t.subSectionId === action.subSectionId);
      const from = subTasks.findIndex((t) => t.id === action.activeId);
      const to = subTasks.findIndex((t) => t.id === action.overId);
      if (from === -1 || to === -1) return state;
      const reordered = arrayMove(subTasks, from, to);
      let pointer = 0;
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.subSectionId === action.subSectionId ? reordered[pointer++] : t
        ),
      };
    }

    // ---- Timeline items
    case 'ITEM_ADD': {
      const { id, data } = action;
      let item = {
        id,
        taskId: data.taskId,
        startPeriod: Math.max(1, Number(data.startPeriod) || 1),
        duration: Math.max(1, Number(data.duration) || 1),
        type: data.type === 'milestone' ? 'milestone' : 'bar',
        legendId: data.legendId || state.legend[0]?.id,
        label: data.label ?? '',
        hasEndMilestone: Boolean(data.hasEndMilestone),
      };
      if (item.type === 'bar') {
        item = placeNewBar(state.timelineItems, item);
        if (!item) return state; // would overlap an existing bar
      }
      return { ...state, timelineItems: [...state.timelineItems, item] };
    }
    case 'ITEM_UPDATE': {
      const target = state.timelineItems.find((item) => item.id === action.itemId);
      if (!target) return state;
      const updates = resolveBarUpdate(state.timelineItems, target, action.updates);
      if (!updates) return state; // a move that would overlap another bar
      return {
        ...state,
        timelineItems: state.timelineItems.map((item) =>
          item.id === action.itemId ? { ...item, ...updates } : item
        ),
      };
    }
    case 'ITEM_DELETE':
      return {
        ...state,
        timelineItems: state.timelineItems.filter((item) => item.id !== action.itemId),
      };

    default:
      return state;
  }
}
