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
import SortableTaskItem from './SortableTaskItem';

export default function SortableSubSectionItem({
  sectionId,
  subSection,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onUpdateSubSectionTitle,
  onDeleteSubSection,
  onAddTask,
  onUpdateTaskTitle,
  onDeleteTask,
  onReorderTasks,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subSection.id,
  });

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
          ? 'bg-slate-100 dark:bg-slate-800 border-fuchsia-400 shadow-lg'
          : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80'
      }`}
    >
      {/* Sub-section Row */}
      <div
        className={`flex items-center gap-1 ${
          isCollapsed ? '' : 'pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-800/60'
        }`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing shrink-0"
          title="Drag to reorder sub-section"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          data-testid={`toggle-subsection-${subSection.id}`}
          className="p-0.5 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
          title={isCollapsed ? 'Expand sub-section' : 'Collapse sub-section'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        <input
          type="text"
          value={subSection.title}
          onChange={(e) => onUpdateSubSectionTitle(sectionId, subSection.id, e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-900 focus:px-1.5 py-0.5 rounded"
          placeholder="Sub-section Name..."
        />

        {isCollapsed && (
          <span className="text-[10px] text-slate-400 font-mono shrink-0">({tasks.length})</span>
        )}

        <button
          type="button"
          onClick={() => onAddTask(subSection.id)}
          className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 transition-colors shrink-0"
          title="Add Task to this Sub-section"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>Task</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteSubSection(sectionId, subSection.id)}
          className="p-0.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
          title="Delete Sub-section"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Tasks Sortable List */}
      {!isCollapsed && (
        <div className="space-y-1.5 pl-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleTaskDragEnd}
          >
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Add Task
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
