import { Layers } from 'lucide-react';
import { SUBSECTION_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function SubsectionTab({ ctx }) {
  const { design, levelSwatch, panelTitle, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Layers, 'text-indigo-600 dark:text-indigo-400', 'Sub-Section Style')}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
        {SUBSECTION_STYLES.map((o) => (
          <OptionCard
            key={o.id}
            selected={design.subSectionStyle === o.id}
            onClick={() => updateDesign({ subSectionStyle: o.id })}
            testId={`subsection-style-${o.id}`}
            title={o.name}
            desc={o.desc}
          >
            {levelSwatch(o.id, 'sub')}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
