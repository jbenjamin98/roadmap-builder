import { APPIAN_PERIOD_STYLES, APPIAN_SECTION_STYLES } from '../../constants/brandThemes';
import { OptionCard } from './primitives';

/**
 * Layout options that stay selectable inside an Appian theme (the Sections and Period Headers
 * tabs themselves stay locked). Swatches come from the real brand renderers.
 */
export default function AppianLayoutOptions({ ctx }) {
  const { design, periodSwatch, sectionSwatch, updateDesign } = ctx;
  if (!design?.brandTheme) return null;

  return (
    <div className="space-y-3 pt-1" data-testid="appian-layout-options">
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Section header layout
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {APPIAN_SECTION_STYLES.map((o) => (
            <OptionCard
              key={o.id}
              selected={design.sectionStyle === o.id}
              onClick={() => updateDesign({ sectionStyle: o.id })}
              testId={`appian-section-style-${o.id}`}
              title={o.name}
              desc={o.desc}
            >
              {sectionSwatch(o.id)}
            </OptionCard>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          Period header layout
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {APPIAN_PERIOD_STYLES.map((o) => (
            <OptionCard
              key={o.id}
              selected={design.periodHeaderStyle === o.id}
              onClick={() => updateDesign({ periodHeaderStyle: o.id })}
              testId={`appian-period-style-${o.id}`}
              title={o.name}
              desc={o.desc}
            >
              {periodSwatch(o.id)}
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

