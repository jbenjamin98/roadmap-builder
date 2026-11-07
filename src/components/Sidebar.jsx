import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Tag,
  FolderPlus,
  Layers,
  CheckSquare,
  Diamond,
  Palette,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LEGEND_PRESET_STYLES } from '../constants/themes';

function SortableSectionItem({
  section,
  sectionIndex,
  tasks,
  onUpdateSectionTitle,
  onDeleteSection,
  onAddSubSection,
  onUpdateSubSectionTitle,
  onDeleteSubSection,
  onReorderSubSections,
  onAddTask,
  onUpdateTaskTitle,
  onDeleteTask,
  onReorderTasks,
  theme,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 'auto',
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSubSectionDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderSubSections(section.id, active.id, over.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border transition-all ${
        isDragging
          ? 'bg-slate-800/95 border-indigo-400 shadow-xl ring-2 ring-indigo-500/30'
          : 'bg-slate-900/75 border-slate-800/90'
      }`}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-t-2xl border-b border-slate-800/80"
        style={{
          background: `linear-gradient(90deg, ${theme?.primary || '#6366f1'}22 0%, transparent 100%)`,
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-slate-400 hover:text-white cursor-grab active:cursor-grabbing rounded"
          title="Drag to reorder section"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
          style={{
            backgroundColor: `${theme?.primary || '#6366f1'}33`,
            color: '#e0e7ff',
          }}
        >
          S{sectionIndex + 1}
        </span>

        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSectionTitle(section.id, e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs font-bold text-white focus:outline-none focus:bg-slate-950/70 focus:px-2 py-0.5 rounded transition-all"
          placeholder="Section Title..."
        />

        <button
          type="button"
          onClick={() => onAddSubSection(section.id)}
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 text-slate-200 hover:text-indigo-200 border border-slate-700/70 transition-colors shrink-0"
          title="Add Sub-section"
        >
          <Plus className="w-3 h-3" />
          <span>Sub</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteSection(section.id)}
          className="p-1 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
          title="Delete Section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sub-sections Sortable List */}
      <div className="p-2.5 space-y-2.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSubSectionDragEnd}
        >
          <SortableContext
            items={section.subSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {section.subSections.map((sub) => (
              <SortableSubSectionItem
                key={sub.id}
                sectionId={section.id}
                subSection={sub}
                tasks={tasks.filter((t) => t.subSectionId === sub.id)}
                onUpdateSubSectionTitle={onUpdateSubSectionTitle}
                onDeleteSubSection={onDeleteSubSection}
                onAddTask={onAddTask}
                onUpdateTaskTitle={onUpdateTaskTitle}
                onDeleteTask={onDeleteTask}
                onReorderTasks={onReorderTasks}
                theme={theme}
              />
            ))}
          </SortableContext>
        </DndContext>

        {section.subSections.length === 0 && (
          <div className="text-center py-2 text-[11px] text-slate-500">
            No sub-sections yet.{' '}
            <button
              type="button"
              onClick={() => onAddSubSection(section.id)}
              className="text-indigo-400 hover:underline"
            >
              + Add Sub-section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableSubSectionItem({
  sectionId,
  subSection,
  tasks,
  onUpdateSubSectionTitle,
  onDeleteSubSection,
  onAddTask,
  onUpdateTaskTitle,
  onDeleteTask,
  onReorderTasks,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subSection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 25 : 'auto',
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleTaskDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderTasks(subSection.id, active.id, over.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-2 transition-all ${
        isDragging
          ? 'bg-slate-800 border-fuchsia-400 shadow-lg'
          : 'bg-slate-950/60 border-slate-800/80'
      }`}
    >
      {/* Sub-section Row */}
      <div className="flex items-center gap-1.5 pb-1.5 mb-1.5 border-b border-slate-800/60">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-0.5 text-slate-500 hover:text-slate-200 cursor-grab active:cursor-grabbing"
          title="Drag to reorder sub-section"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/25 shrink-0">
          Sub
        </span>

        <input
          type="text"
          value={subSection.title}
          onChange={(e) =>
            onUpdateSubSectionTitle(sectionId, subSection.id, e.target.value)
          }
          className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-200 focus:outline-none focus:bg-slate-900 focus:px-1.5 py-0.5 rounded"
          placeholder="Sub-section Name..."
        />

        <button
          type="button"
          onClick={() => onAddTask(subSection.id)}
          className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors shrink-0"
          title="Add Task to this Sub-section"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>Task</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteSubSection(sectionId, subSection.id)}
          className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
          title="Delete Sub-section"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Tasks Sortable List */}
      <div className="space-y-1.5 pl-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTaskDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onUpdateTaskTitle={onUpdateTaskTitle}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </SortableContext>
        </DndContext>

        {tasks.length === 0 && (
          <div className="text-[11px] text-slate-500 py-1 pl-2">
            No tasks.{' '}
            <button
              type="button"
              onClick={() => onAddTask(subSection.id)}
              className="text-indigo-400 hover:underline"
            >
              + Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTaskItem({ task, onUpdateTaskTitle, onDeleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all ${
        isDragging
          ? 'bg-slate-800 border-teal-400 shadow-md'
          : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing"
        title="Drag to reorder task"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <CheckSquare className="w-3 h-3 text-teal-400 shrink-0" />

      <input
        type="text"
        value={task.title}
        onChange={(e) => onUpdateTaskTitle(task.id, e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-slate-200 text-xs focus:outline-none focus:bg-slate-950 focus:px-1.5 py-0.5 rounded"
        placeholder="Task / Activity name..."
      />

      <button
        type="button"
        onClick={() => onDeleteTask(task.id)}
        className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors shrink-0"
        title="Delete Task"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function Sidebar({
  legend,
  sections,
  tasks,
  theme,
  onAddLegendCategory,
  onUpdateLegendCategory,
  onDeleteLegendCategory,
  onAddSection,
  onUpdateSectionTitle,
  onDeleteSection,
  onReorderSections,
  onAddSubSection,
  onUpdateSubSectionTitle,
  onDeleteSubSection,
  onReorderSubSections,
  onAddTask,
  onUpdateTaskTitle,
  onDeleteTask,
  onReorderTasks,
}) {
  const [newLegendLabel, setNewLegendLabel] = useState('');
  const [newLegendColor, setNewLegendColor] = useState(
    theme?.accents?.[0] || '#6366f1'
  );
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [hierarchyExpanded, setHierarchyExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorderSections(active.id, over.id);
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newLegendLabel.trim()) return;
    onAddLegendCategory({
      label: newLegendLabel.trim(),
      color: newLegendColor,
      gradient: `linear-gradient(135deg, ${newLegendColor}ee 0%, ${newLegendColor}bb 100%)`,
    });
    setNewLegendLabel('');
  };

  const themeSwatches = [
    theme?.primary || '#6366f1',
    ...(theme?.accents || ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b']),
  ];

  return (
    <aside
      className="w-full lg:w-88 xl:w-96 shrink-0 bg-slate-900/90 border-r border-slate-800/90 flex flex-col h-full select-none overflow-y-auto"
      data-testid="editor-sidebar"
    >
      {/* Top Drag-and-Drop Milestone Palette Callout */}
      <div className="p-4 border-b border-slate-800/90 bg-slate-950/50">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Timeline Quick-Drop Tools</span>
          <span className="text-[10px] text-indigo-400 font-normal">Drag onto Grid</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Draggable Milestone Token */}
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/roadmap-item-type', 'milestone');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            data-testid="draggable-milestone-tool"
            className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 border border-amber-500/30 hover:border-amber-400/60 flex items-center gap-2.5 transition-all group"
            title="Drag and drop this Milestone onto any Task row & Period column in the timeline grid"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Diamond className="w-4 h-4 text-amber-400 fill-amber-400/80 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">Milestone</div>
              <div className="text-[10px] text-amber-300/70">Drop on period</div>
            </div>
          </div>

          {/* Draggable Bar Token */}
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/roadmap-item-type', 'bar');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            data-testid="draggable-bar-tool"
            className="cursor-grab active:cursor-grabbing p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/30 hover:border-indigo-400/60 flex items-center gap-2.5 transition-all group"
            title="Drag onto any Task row or click-and-drag directly across cells on the grid"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-200">Task Bar</div>
              <div className="text-[10px] text-indigo-300/70">Draw or drop</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel 1: Manage Legend / Categories */}
      <div className="border-b border-slate-800/90">
        <button
          type="button"
          onClick={() => setLegendExpanded(!legendExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legend & Style Categories ({legend.length})
            </span>
          </div>
          {legendExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {legendExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Existing Legend Categories */}
            <div className="space-y-2">
              {legend.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/90"
                >
                  <label
                    className="relative w-6 h-6 rounded-lg shrink-0 cursor-pointer border border-white/25 shadow-sm overflow-hidden"
                    style={{ background: cat.gradient || cat.color }}
                    title="Change category color"
                  >
                    <input
                      type="color"
                      value={cat.color || '#6366f1'}
                      onChange={(e) => {
                        const c = e.target.value;
                        onUpdateLegendCategory(cat.id, {
                          color: c,
                          gradient: `linear-gradient(135deg, ${c}ee 0%, ${c}bb 100%)`,
                        });
                      }}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>

                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) =>
                      onUpdateLegendCategory(cat.id, { label: e.target.value })
                    }
                    className="flex-1 min-w-0 bg-transparent text-xs font-medium text-slate-200 focus:outline-none focus:bg-slate-900 px-1.5 py-0.5 rounded"
                  />

                  {/* Preset Gradient Cycle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextPreset =
                        LEGEND_PRESET_STYLES[
                          (LEGEND_PRESET_STYLES.findIndex(
                            (p) => p.color === cat.color
                          ) +
                            1) %
                            LEGEND_PRESET_STYLES.length
                        ];
                      onUpdateLegendCategory(cat.id, {
                        color: nextPreset.color,
                        gradient: nextPreset.gradient,
                      });
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                    title="Cycle gradient style"
                  >
                    <Palette className="w-3.5 h-3.5" />
                  </button>

                  {legend.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteLegendCategory(cat.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Legend Category Form */}
            <form
              onSubmit={handleCreateCategory}
              className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newLegendColor}
                  onChange={(e) => setNewLegendColor(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                  title="Pick category color"
                />
                <input
                  type="text"
                  value={newLegendLabel}
                  onChange={(e) => setNewLegendLabel(e.target.value)}
                  placeholder="New category label..."
                  data-testid="new-legend-input"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  data-testid="add-legend-btn"
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Theme Quick Swatches */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Theme swatches:</span>
                <div className="flex items-center gap-1.5">
                  {themeSwatches.map((swatch, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewLegendColor(swatch)}
                      className={`w-4 h-4 rounded-full border transition-transform ${
                        newLegendColor === swatch
                          ? 'scale-125 border-white'
                          : 'border-white/20 hover:scale-110'
                      }`}
                      style={{ backgroundColor: swatch }}
                      title={`Use theme color ${swatch}`}
                    />
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Panel 2: Manage Hierarchy Rows (Sections, Sub-sections, Tasks) with @dnd-kit vertical reordering */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800/70">
          <button
            type="button"
            onClick={() => setHierarchyExpanded(!hierarchyExpanded)}
            className="flex items-center gap-2 text-left"
          >
            <Layers className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Roadmap Rows ({sections.length} Sections)
            </span>
          </button>

          <button
            type="button"
            onClick={onAddSection}
            data-testid="add-section-btn"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Section</span>
          </button>
        </div>

        {hierarchyExpanded && (
          <div className="p-3 space-y-3 flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((sec, idx) => (
                  <SortableSectionItem
                    key={sec.id}
                    section={sec}
                    sectionIndex={idx}
                    tasks={tasks}
                    onUpdateSectionTitle={onUpdateSectionTitle}
                    onDeleteSection={onDeleteSection}
                    onAddSubSection={onAddSubSection}
                    onUpdateSubSectionTitle={onUpdateSubSectionTitle}
                    onDeleteSubSection={onDeleteSubSection}
                    onReorderSubSections={onReorderSubSections}
                    onAddTask={onAddTask}
                    onUpdateTaskTitle={onUpdateTaskTitle}
                    onDeleteTask={onDeleteTask}
                    onReorderTasks={onReorderTasks}
                    theme={theme}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {sections.length === 0 && (
              <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400 space-y-2">
                <p>No sections defined yet.</p>
                <button
                  type="button"
                  onClick={onAddSection}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
                >
                  + Create First Section
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
