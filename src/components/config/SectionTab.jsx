import { Columns, Rows } from 'lucide-react';
import { SPINE_SECTION_STYLES, STANDARD_SECTION_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function SectionTab({ ctx }) {
  const { design, panelTitle, sectionSwatch, updateDesign } = ctx;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {panelTitle(Rows, 'text-indigo-600 dark:text-indigo-400', 'Section Style')}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose from 21 distinct styling options for roadmap sections, split into standard
          horizontal banners and vertical spines.
        </p>
      </div>

      {/* Sub-Section 1: Standard Section Styles (12 styles, 4 rows of 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Standard Section Styles
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            12 styles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {STANDARD_SECTION_STYLES.map((o) => (
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

      {/* Sub-Section 2: Vertical Spine Styles (9 styles, 3 rows of 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Columns className="w-3.5 h-3.5 text-indigo-500" />
            <span>Vertical Spine Styles</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            9 styles
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Vertical 90° rotated section caps pinned to the left edge of each section's row group.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {SPINE_SECTION_STYLES.map((o) => (
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
    </div>
  );
}
