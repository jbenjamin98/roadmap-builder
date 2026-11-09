import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, CheckSquare } from 'lucide-react';

export default function SortableTaskItem({ task, onUpdateTaskTitle, onDeleteTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

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
          ? 'bg-slate-100 dark:bg-slate-800 border-teal-400 shadow-md'
          : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
        title="Drag to reorder task"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <CheckSquare className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />

      <input
        type="text"
        value={task.title}
        onChange={(e) => onUpdateTaskTitle(task.id, e.target.value)}
        className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:px-1.5 py-0.5 rounded"
        placeholder="Task / Activity name..."
      />

      <button
        type="button"
        onClick={() => onDeleteTask(task.id)}
        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 transition-colors shrink-0"
        title="Delete Task"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
