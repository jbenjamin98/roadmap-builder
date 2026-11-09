import { Rows } from 'lucide-react';
import { SECTION_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function SectionTab({ ctx }) {
  const { design, panelTitle, sectionSwatch, updateDesign } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Rows, 'text-indigo-600 dark:text-indigo-400', 'Section Style')}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {SECTION_STYLES.map((o) => (
          <OptionCard
            key={o.id}
            selected={design.sectionStyle === o.id}
            onClick={() => updateDesign({ sectionStyle: o.id })}
            testId={`section-style-${o.id}`}
            title={o.name}
            desc={o.desc}
          >
            {sectionSwatch(o.id)}
          </OptionCard>
        ))}
      </div>
    </div>
  );
}
