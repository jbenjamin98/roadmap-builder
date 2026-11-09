import { ListOrdered } from 'lucide-react';
import { TASK_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function TaskTab({ ctx }) {
  const { design, levelSwatch, panelTitle, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(ListOrdered, 'text-indigo-600 dark:text-indigo-400', 'Task Row Style')}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
        {TASK_STYLES.map((o) => (
          <OptionCard
            key={o.id}
            selected={design.taskStyle === o.id}
            onClick={() => updateDesign({ taskStyle: o.id })}
            testId={`task-style-${o.id}`}
            title={o.name}
            desc={o.desc}
          >
            {levelSwatch(o.id, 'task')}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
