import { ITEM_STYLES } from '../../constants/designOptions';
import { Sliders } from 'lucide-react';
import { OptionCard } from './primitives';

export default function BarsTab({ ctx }) {
  const { barSwatch, design, panelTitle, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Sliders, 'text-amber-600 dark:text-amber-400', 'Timeline Bar Style')}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {ITEM_STYLES.map((o) => (
          <OptionCard
            key={o.id}
            selected={design.itemStyle === o.id}
            onClick={() => updateDesign({ itemStyle: o.id })}
            testId={`item-style-${o.id}`}
            title={o.name}
            desc={o.desc}
          >
            {barSwatch(o.id)}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
