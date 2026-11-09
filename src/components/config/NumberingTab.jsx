import { ListOrdered } from 'lucide-react';
import { NUMBERING_STYLES } from '../../constants/designOptions';
import { OptionCard, FieldLabel, ToggleRow } from './primitives';

export default function NumberingTab({ ctx }) {
  const { design, numberSwatch, panelTitle, updateDesign } = ctx;

  return (
    <div className="space-y-5">
      {panelTitle(ListOrdered, 'text-indigo-600 dark:text-indigo-400', 'Numbering')}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <ToggleRow
          icon={ListOrdered}
          tone="text-indigo-500"
          title="Number sections"
          desc="1, 2, 3"
          checked={Boolean(design.numbering?.sections)}
          onChange={(v) => updateDesign({ numbering: { ...design.numbering, sections: v } })}
          testId="config-number-sections"
        />
        <ToggleRow
          icon={ListOrdered}
          tone="text-indigo-500"
          title="Number sub-sections"
          desc="1.1, 1.2"
          checked={Boolean(design.numbering?.subSections)}
          onChange={(v) => updateDesign({ numbering: { ...design.numbering, subSections: v } })}
          testId="config-number-subsections"
        />
        <ToggleRow
          icon={ListOrdered}
          tone="text-indigo-500"
          title="Number tasks"
          desc="1.1.1, 1.1.2"
          checked={Boolean(design.numbering?.tasks)}
          onChange={(v) => updateDesign({ numbering: { ...design.numbering, tasks: v } })}
          testId="config-number-tasks"
        />
      </div>

      <div
        className={`space-y-2 ${design.brandTheme ? 'pointer-events-none opacity-50' : ''}`}
        data-testid="config-numbering-style"
        aria-disabled={Boolean(design.brandTheme)}
      >
        <FieldLabel>
          Numbering Style
          {design.brandTheme ? ' (set by the Appian brand theme)' : ''}
        </FieldLabel>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2.5">
          {NUMBERING_STYLES.map((o) => (
            <OptionCard
              key={o.id}
              selected={design.numberingStyle === o.id}
              onClick={() => updateDesign({ numberingStyle: o.id })}
              testId={`numbering-style-${o.id}`}
              title={o.name}
            >
              {numberSwatch(o.id)}
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
