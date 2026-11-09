import { APPIAN_PRESETS } from '../../constants/brandThemes';
import MilestoneMarker from '../MilestoneMarker';
import { AppianLineWork, AppianLogo, AppianNode } from '../parts/AppianParts';

/** Brand theme cards (Appian Light / Dark / Slate), built from the real brand renderers. */
export default function AppianThemeCards({ ctx }) {
  const { design, selectAppian } = ctx;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
      {APPIAN_PRESETS.map((preset) => {
        const mode = preset.id.replace('appian-', '');
        const active = design?.brandTheme === preset.id;
        const t = preset.tokenOverrides;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => selectAppian(mode)}
            data-testid={`appian-theme-${mode}-btn`}
            aria-pressed={active}
            className={`text-left p-3 rounded-2xl border-2 transition-all space-y-2.5 cursor-pointer ${
              active
                ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {preset.name}
              </span>
              {active && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-600 text-white">
                  ACTIVE
                </span>
              )}
            </div>

            <div
              className="relative rounded-lg border overflow-hidden"
              style={{ background: preset.surfaceBg, borderColor: t.gridBorder, height: 64 }}
            >
              {/* Node tag: inset from the left edge, hanging from the top (scaled for the card). */}
              <div className="absolute top-0" style={{ left: 8, lineHeight: 0 }}>
                <AppianNode height={22} color={t.brand.tag} />
              </div>
              <div className="absolute left-9 top-3 min-w-0">
                <div
                  className="text-[9px] uppercase"
                  style={{ letterSpacing: '0.25em', fontWeight: 600, color: t.brand.accent }}
                >
                  8 Sprints
                </div>
                <div
                  style={{ color: t.textMain, fontWeight: 500 }}
                  className="text-sm leading-tight"
                >
                  Roadmap
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className="inline-block h-1.5 w-8 rounded-[2px]"
                    style={{ backgroundColor: t.brand.band }}
                  />
                  <MilestoneMarker
                    size={11}
                    isLight={preset.isLight}
                    milestoneDesign={{
                      shape: 'appian-flag',
                      color: t.brand.milestone.color,
                      borderColor: t.brand.milestone.border,
                      borderStyle: 'solid',
                      borderWidth: 2,
                    }}
                  />
                </div>
              </div>
              <div className="absolute right-2 top-2">
                <AppianLogo variant={t.brand.logo} height={14} />
              </div>
              <AppianLineWork />
            </div>

            <div className="flex items-center gap-1 flex-wrap">
              {[preset.secondary, preset.primary, ...preset.accents].map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="w-3.5 h-3.5 rounded-full border border-slate-400/50"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{preset.description}</p>
          </button>
        );
      })}
    </div>
  );
}
