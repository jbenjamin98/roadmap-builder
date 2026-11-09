import { PanelTop, Sparkles } from 'lucide-react';
import { LOGO_HEADER_STYLES, STANDARD_HEADER_STYLES } from '../../constants/designOptions';
import { OptionCard } from './primitives';

export default function HeaderTab({ ctx }) {
  const { design, headerSwatch, panelTitle, updateDesign } = ctx;
  const currentHeaderStyle = design.headerStyle || 'gradient-banner';

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        {panelTitle(PanelTop, 'text-indigo-600 dark:text-indigo-400', 'Canvas Header Style')}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose from 24 distinct layout and visual styling options for the top roadmap canvas
          header, split into standard and logo-focused designs.
        </p>
      </div>

      {/* Sub-Section 1: Standard Canvas Headers (15 options, 5 rows of 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Standard Canvas Headers
          </h3>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            15 styles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {STANDARD_HEADER_STYLES.map((o) => (
            <OptionCard
              key={o.id}
              selected={currentHeaderStyle === o.id}
              onClick={() => updateDesign({ headerStyle: o.id })}
              testId={`header-style-${o.id}`}
              title={o.name}
              desc={o.desc}
            >
              {headerSwatch(o.id)}
            </OptionCard>
          ))}
        </div>
      </div>

      {/* Sub-Section 2: Logo & Brand Headers (9 options, 3 rows of 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Logo & Brand Headers</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            9 styles
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          High-visibility layouts designed to prominently showcase company or project logos. If no
          logo is uploaded, an iconic roadmap pin marker is displayed.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {LOGO_HEADER_STYLES.map((o) => (
            <OptionCard
              key={o.id}
              selected={currentHeaderStyle === o.id}
              onClick={() => updateDesign({ headerStyle: o.id })}
              testId={`header-style-${o.id}`}
              title={o.name}
              desc={o.desc}
            >
              {headerSwatch(o.id)}
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
