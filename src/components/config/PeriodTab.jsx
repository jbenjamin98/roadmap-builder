import { Columns } from 'lucide-react';
import { PERIOD_HEADER_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function PeriodTab({ ctx }) {
  const { design, panelTitle, periodSwatch, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(
        Columns,
        'text-indigo-600 dark:text-indigo-400',
        'Period / Date Column Header Style'
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {PERIOD_HEADER_STYLES.map((o) => (
          <OptionCard
            key={o.id}
            selected={design.periodHeaderStyle === o.id}
            onClick={() => updateDesign({ periodHeaderStyle: o.id })}
            testId={`period-header-style-${o.id}`}
            title={o.name}
            desc={o.desc}
          >
            {periodSwatch(o.id)}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
