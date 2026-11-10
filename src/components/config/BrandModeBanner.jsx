import { Lock } from 'lucide-react';
import { YellowDuckIcon } from '../parts/DuckParts';
import { AppianNode } from '../parts/AppianParts';
import { APPIAN_COLORS, getBrandTokens } from '../../constants/brandThemes';

/** Banner shown above the settings while a brand mode (Duck or Appian) locks conflicting options. */
export default function BrandModeBanner({ ctx }) {
  const { design, exitBrandMode, handleToggleDuckMode } = ctx;

  if (design?.duckMode) {
    return (
      <div
        data-testid="ultimate-duck-mode-banner"
        className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 flex items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-3 min-w-0">
          <YellowDuckIcon size={28} wake />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Ultimate Duck Mode Active</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Orchestrated
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              Visual styling is curated by the Duck Design System (Pond palette, floating duck
              header, duck egg spine, rippled bars). Conflicting options are locked.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleDuckMode}
          data-testid="disable-duck-mode-btn"
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-amber-500/40 shadow-xs transition-colors cursor-pointer"
        >
          Disable Duck Mode
        </button>
      </div>
    );
  }

  if (design?.brandTheme) {
    const brand = getBrandTokens(design.brandTheme);
    const label = design.brandTheme.replace('appian-', '');
    const name = label.charAt(0).toUpperCase() + label.slice(1);
    return (
      <div
        data-testid="appian-mode-banner"
        className="p-4 rounded-2xl border-2 flex items-center justify-between gap-4 shadow-sm"
        style={{
          borderColor: `${APPIAN_COLORS.blue}99`,
          background: `linear-gradient(90deg, ${APPIAN_COLORS.blue}1f 0%, ${APPIAN_COLORS.cyan}14 100%)`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <AppianNode height={28} color={brand?.accent || APPIAN_COLORS.blue} />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Appian {name} Theme Active</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                <Lock className="w-2.5 h-2.5" /> Brand locked
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              Typography, header, hierarchy and bars follow the Appian Brand Guidelines. Timeline,
              header details (not the logo), milestone shape, legend, condensed view and grid
              settings stay editable.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => exitBrandMode()}
          data-testid="exit-appian-theme-btn"
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-indigo-500/40 shadow-xs transition-colors cursor-pointer"
        >
          Exit Appian theme
        </button>
      </div>
    );
  }

  return null;
}
