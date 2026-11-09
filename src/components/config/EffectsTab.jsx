import { EFFECT_CATEGORIES, EFFECT_TOGGLES } from '../../constants/designOptions';
import { Sparkles } from 'lucide-react';

export default function EffectsTab({ ctx }) {
  const { panelTitle, renderEffectCard } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Sparkles, 'text-purple-600 dark:text-purple-400', 'Surface Effects')}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        These only affect the roadmap itself. Effects marked with a badge replace others of the same
        kind, so selecting one automatically unchecks the conflicting ones.
      </p>
      {EFFECT_CATEGORIES.map((cat) => (
        <div key={cat.id} className="space-y-2">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{cat.name}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">{cat.desc}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {cat.ids
              .map((id) => EFFECT_TOGGLES.find((e) => e.id === id))
              .filter(Boolean)
              .map((eff) => renderEffectCard(eff))}
          </div>
        </div>
      ))}
    </div>
  );
}
