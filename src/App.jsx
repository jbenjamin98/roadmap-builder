import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import LandingPage from './components/LandingPage';
import ConfigModal from './components/ConfigModal';
import RoadmapWorkspace from './components/RoadmapWorkspace';
import CustomCursor from './components/CustomCursor';
import SmallScreenGuard from './components/SmallScreenGuard';
import { normalizeDesign } from './constants/designOptions';
import {
  loadRoadmapState,
  saveRoadmapState,
  normalizeRoadmapState,
  createBlankRoadmapState,
  loadUiThemeMode,
  saveUiThemeMode,
} from './data/defaultState';

export default function App() {
  const [roadmapState, setRoadmapState] = useState(() => loadRoadmapState());
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'workspace'
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [themeMode, setThemeMode] = useState(() => loadUiThemeMode());

  // Sync light/dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveUiThemeMode(themeMode);
  }, [themeMode]);

  // Persist active roadmap state to localStorage
  useEffect(() => {
    saveRoadmapState(roadmapState);
  }, [roadmapState]);

  const makeId = (prefix) =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  // View A -> Trigger View B (Blank Configuration Modal)
  const handleTriggerCreateRoadmap = () => {
    setIsCreatingNew(true);
    setIsConfigModalOpen(true);
  };

  // View A -> Upload JSON creates/updates a roadmap and routes to editor
  const handleUploadRoadmapJson = (parsedJson) => {
    const normalized = normalizeRoadmapState(parsedJson, { forceNewId: !parsedJson.id });
    saveRoadmapState(normalized);
    setRoadmapState(normalized);
    setCurrentView('workspace');
  };

  // Save Configuration from ConfigModal (View B)
  const handleSaveConfig = (updatedConfig) => {
    if (isCreatingNew) {
      const freshState = createBlankRoadmapState(updatedConfig);
      saveRoadmapState(freshState);
      setRoadmapState(freshState);
    } else {
      setRoadmapState((prev) => {
        const nextState = {
          ...prev,
          config: {
            ...prev.config,
            ...updatedConfig,
            previewSettings: {
              ...(prev.config?.previewSettings || {}),
              ...(updatedConfig.previewSettings || {}),
            },
            design: normalizeDesign({
              ...(prev.config?.design || {}),
              ...(updatedConfig.design || {}),
            }),
          },
        };
        saveRoadmapState(nextState);
        return nextState;
      });
    }

    setIsConfigModalOpen(false);
    setIsCreatingNew(false);
    setCurrentView('workspace');
  };

  // Legend CRUD
  const handleAddLegendCategory = ({ label, color, gradient, hasBorder, borderColor, isStriped }) => {
    setRoadmapState((prev) => ({
      ...prev,
      legend: [
        ...prev.legend,
        {
          id: makeId('leg'),
          label,
          color,
          gradient,
          hasBorder: Boolean(hasBorder),
          borderColor: borderColor || '#ffffff',
          isStriped: Boolean(isStriped),
        },
      ],
    }));
  };

  const handleUpdateLegendCategory = (legendId, updates) => {
    setRoadmapState((prev) => ({
      ...prev,
      legend: prev.legend.map((cat) =>
        cat.id === legendId ? { ...cat, ...updates } : cat
      ),
    }));
  };

  const handleDeleteLegendCategory = (legendId) => {
    setRoadmapState((prev) => {
      const remaining = prev.legend.filter((c) => c.id !== legendId);
      const fallbackId = remaining[0]?.id;
      return {
        ...prev,
        legend: remaining,
        timelineItems: prev.timelineItems.map((item) =>
          item.legendId === legendId ? { ...item, legendId: fallbackId } : item
        ),
      };
    });
  };

  // Sections CRUD & Reordering
  const handleAddSection = () => {
    const newSecId = makeId('sec');
    const newSubId = makeId('sub');
    const newTaskId = makeId('task');

    setRoadmapState((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newSecId,
          title: `New Section ${prev.sections.length + 1}`,
          subSections: [
            {
              id: newSubId,
              title: 'Primary Workstream',
            },
          ],
        },
      ],
      tasks: [
        ...prev.tasks,
        {
          id: newTaskId,
          subSectionId: newSubId,
          title: 'Key Deliverable',
        },
      ],
    }));
  };

  const handleUpdateSectionTitle = (sectionId, title) => {
    setRoadmapState((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, title } : sec
      ),
    }));
  };

  const handleDeleteSection = (sectionId) => {
    setRoadmapState((prev) => {
      const targetSec = prev.sections.find((s) => s.id === sectionId);
      const subIds = new Set(
        (targetSec?.subSections || []).map((sub) => sub.id)
      );
      const taskIdsToRemove = new Set(
        prev.tasks.filter((t) => subIds.has(t.subSectionId)).map((t) => t.id)
      );

      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== sectionId),
        tasks: prev.tasks.filter((t) => !subIds.has(t.subSectionId)),
        timelineItems: prev.timelineItems.filter(
          (i) => !taskIdsToRemove.has(i.taskId)
        ),
      };
    });
  };

  const handleReorderSections = (activeId, overId) => {
    setRoadmapState((prev) => {
      const oldIndex = prev.sections.findIndex((s) => s.id === activeId);
      const newIndex = prev.sections.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return {
        ...prev,
        sections: arrayMove(prev.sections, oldIndex, newIndex),
      };
    });
  };

  // Sub-sections CRUD & Reordering
  const handleAddSubSection = (sectionId) => {
    const newSubId = makeId('sub');
    const newTaskId = makeId('task');

    setRoadmapState((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              subSections: [
                ...sec.subSections,
                {
                  id: newSubId,
                  title: `Workstream ${sec.subSections.length + 1}`,
                },
              ],
            }
          : sec
      ),
      tasks: [
        ...prev.tasks,
        {
          id: newTaskId,
          subSectionId: newSubId,
          title: 'New Initiative Task',
        },
      ],
    }));
  };

  const handleUpdateSubSectionTitle = (sectionId, subSectionId, title) => {
    setRoadmapState((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId
          ? {
              ...sec,
              subSections: sec.subSections.map((sub) =>
                sub.id === subSectionId ? { ...sub, title } : sub
              ),
            }
          : sec
      ),
    }));
  };

  const handleDeleteSubSection = (sectionId, subSectionId) => {
    setRoadmapState((prev) => {
      const taskIdsToRemove = new Set(
        prev.tasks
          .filter((t) => t.subSectionId === subSectionId)
          .map((t) => t.id)
      );

      return {
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                subSections: sec.subSections.filter(
                  (sub) => sub.id !== subSectionId
                ),
              }
            : sec
        ),
        tasks: prev.tasks.filter((t) => t.subSectionId !== subSectionId),
        timelineItems: prev.timelineItems.filter(
          (i) => !taskIdsToRemove.has(i.taskId)
        ),
      };
    });
  };

  const handleReorderSubSections = (sectionId, activeId, overId) => {
    setRoadmapState((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const oldIndex = sec.subSections.findIndex((s) => s.id === activeId);
        const newIndex = sec.subSections.findIndex((s) => s.id === overId);
        if (oldIndex === -1 || newIndex === -1) return sec;
        return {
          ...sec,
          subSections: arrayMove(sec.subSections, oldIndex, newIndex),
        };
      }),
    }));
  };

  // Tasks CRUD & Reordering
  const handleAddTask = (subSectionId) => {
    const newTaskId = makeId('task');
    setRoadmapState((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: newTaskId,
          subSectionId,
          title: 'New Task / Activity',
        },
      ],
    }));
  };

  const handleUpdateTaskTitle = (taskId, title) => {
    setRoadmapState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)),
    }));
  };

  const handleDeleteTask = (taskId) => {
    setRoadmapState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      timelineItems: prev.timelineItems.filter((i) => i.taskId !== taskId),
    }));
  };

  const handleReorderTasks = (subSectionId, activeId, overId) => {
    setRoadmapState((prev) => {
      const subTasks = prev.tasks.filter((t) => t.subSectionId === subSectionId);
      const oldIndex = subTasks.findIndex((t) => t.id === activeId);
      const newIndex = subTasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reorderedSubTasks = arrayMove(subTasks, oldIndex, newIndex);
      let pointer = 0;
      const nextTasks = prev.tasks.map((t) =>
        t.subSectionId === subSectionId ? reorderedSubTasks[pointer++] : t
      );

      return {
        ...prev,
        tasks: nextTasks,
      };
    });
  };

  // Timeline Items CRUD
  const handleAddTimelineItem = (itemData) => {
    const newId = makeId('item');
    setRoadmapState((prev) => ({
      ...prev,
      timelineItems: [
        ...prev.timelineItems,
        {
          id: newId,
          taskId: itemData.taskId,
          startPeriod: Math.max(1, Number(itemData.startPeriod) || 1),
          duration: Math.max(1, Number(itemData.duration) || 1),
          type: itemData.type === 'milestone' ? 'milestone' : 'bar',
          legendId: itemData.legendId || prev.legend[0]?.id,
          label: itemData.label ?? '',
          hasEndMilestone: Boolean(itemData.hasEndMilestone),
        },
      ],
    }));
    return newId;
  };

  const handleUpdateTimelineItem = (itemId, updates) => {
    setRoadmapState((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleDeleteTimelineItem = (itemId) => {
    setRoadmapState((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.filter((item) => item.id !== itemId),
    }));
  };

  return (
    <>
      <SmallScreenGuard />
      <CustomCursor
        themeMode={themeMode}
        isWorkspace={currentView === 'workspace'}
        roadmapTheme={roadmapState.config?.theme}
      />
      {currentView === 'landing' ? (
        <LandingPage
          onCreateRoadmap={handleTriggerCreateRoadmap}
          onUploadRoadmap={handleUploadRoadmapJson}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
        />
      ) : (
        <RoadmapWorkspace
          roadmapState={roadmapState}
          onOpenConfigModal={() => {
            setIsCreatingNew(false);
            setIsConfigModalOpen(true);
          }}
          onNavigateHome={() => {
            setCurrentView('landing');
          }}
          onAddLegendCategory={handleAddLegendCategory}
          onUpdateLegendCategory={handleUpdateLegendCategory}
          onDeleteLegendCategory={handleDeleteLegendCategory}
          onAddSection={handleAddSection}
          onUpdateSectionTitle={handleUpdateSectionTitle}
          onDeleteSection={handleDeleteSection}
          onReorderSections={handleReorderSections}
          onAddSubSection={handleAddSubSection}
          onUpdateSubSectionTitle={handleUpdateSubSectionTitle}
          onDeleteSubSection={handleDeleteSubSection}
          onReorderSubSections={handleReorderSubSections}
          onAddTask={handleAddTask}
          onUpdateTaskTitle={handleUpdateTaskTitle}
          onDeleteTask={handleDeleteTask}
          onReorderTasks={handleReorderTasks}
          onAddTimelineItem={handleAddTimelineItem}
          onUpdateTimelineItem={handleUpdateTimelineItem}
          onDeleteTimelineItem={handleDeleteTimelineItem}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
        />
      )}

      {isConfigModalOpen && (
        <ConfigModal
          key={isCreatingNew ? 'create-blank' : `edit-${roadmapState.id}`}
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setIsCreatingNew(false);
          }}
          initialConfig={isCreatingNew ? null : roadmapState.config}
          onSaveConfig={handleSaveConfig}
          isCreatingNew={isCreatingNew}
        />
      )}
    </>
  );
}
