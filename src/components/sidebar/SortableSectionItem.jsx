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
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import SortableSubSectionItem from './SortableSubSectionItem';

export default function SortableSectionItem({
  section,
  tasks,
  isCollapsed,
  onToggleCollapse,
  collapsedSubSections,
  onToggleSubSectionCollapse,
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

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
          ? 'bg-slate-100 dark:bg-slate-800/95 border-indigo-400 shadow-xl ring-2 ring-indigo-500/30'
          : 'bg-slate-50/90 dark:bg-slate-900/75 border-slate-200 dark:border-slate-800/90'
      }`}
    >
      {/* Section Header */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-2 ${
          isCollapsed
            ? 'rounded-2xl'
            : 'rounded-t-2xl border-b border-slate-200 dark:border-slate-800/80'
        }`}
        style={{
          background: `linear-gradient(90deg, ${theme?.primary || '#6366f1'}22 0%, transparent 100%)`,
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-grab active:cursor-grabbing rounded shrink-0"
          title="Drag to reorder section"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          data-testid={`toggle-section-${section.id}`}
          className="p-0.5 rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          title={isCollapsed ? 'Expand section' : 'Collapse section'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSectionTitle(section.id, e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-950/70 focus:px-2 py-0.5 rounded transition-all"
          placeholder="Section Title..."
        />

        <button
          type="button"
          onClick={() => onAddSubSection(section.id)}
          className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-1 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/70 transition-colors shrink-0"
          title="Add Sub-section"
        >
          <Plus className="w-3 h-3" />
          <span>Sub-section</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteSection(section.id)}
          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
          title="Delete Section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Sub-sections Sortable List */}
      {!isCollapsed && (
        <div className="p-2.5 space-y-2">
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
                  isCollapsed={collapsedSubSections.has(sub.id)}
                  onToggleCollapse={() => onToggleSubSectionCollapse(sub.id)}
                  onUpdateSubSectionTitle={onUpdateSubSectionTitle}
                  onDeleteSubSection={onDeleteSubSection}
                  onAddTask={onAddTask}
                  onUpdateTaskTitle={onUpdateTaskTitle}
                  onDeleteTask={onDeleteTask}
                  onReorderTasks={onReorderTasks}
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
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Add Sub-section
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
