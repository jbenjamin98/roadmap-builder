import { Diamond } from 'lucide-react';
import { MILESTONE_BORDER_STYLES, MILESTONE_SHAPES } from '../../constants/designOptions';
import MilestoneMarker from '../MilestoneMarker';
import { OptionCard } from './primitives';

export default function MilestonesTab({ ctx }) {
  const { design, panelTitle, resolvedMilestone, swatchEffects, tokens, updateMilestone } = ctx;

  return (
    <div className="space-y-4">
      {panelTitle(Diamond, 'text-amber-600 dark:text-amber-400', 'Milestone Style')}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {MILESTONE_SHAPES.map((sh) => (
          <OptionCard
            key={sh.id}
            selected={design.milestone?.shape === sh.id}
            onClick={() => updateMilestone({ shape: sh.id })}
            testId={`milestone-shape-${sh.id}`}
            title={sh.name}
          >
            <span className="flex justify-center py-1">
              <MilestoneMarker
                milestoneDesign={{ ...resolvedMilestone, shape: sh.id }}
                size={22}
                effects={swatchEffects}
                isLight={tokens.isLight}
              />
            </span>
          </OptionCard>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Fill Color
          </label>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {design.milestone?.color === 'auto' ? (
              <>
                <span
                  className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700 shrink-0"
                  style={{ backgroundColor: resolvedMilestone.color }}
                />
                <span className="text-xs flex-1 text-slate-600 dark:text-slate-300">
                  Auto · follows theme
                </span>
                <button
                  type="button"
                  onClick={() => updateMilestone({ color: resolvedMilestone.color })}
                  data-testid="milestone-color-custom"
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Custom
                </button>
              </>
            ) : (
              <>
                <input
                  type="color"
                  value={design.milestone?.color}
                  onChange={(e) => updateMilestone({ color: e.target.value })}
                  data-testid="milestone-color-input"
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono flex-1">{design.milestone?.color}</span>
                <button
                  type="button"
                  onClick={() => updateMilestone({ color: 'auto' })}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Auto
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Border Style
          </label>
          <div className="grid grid-cols-4 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {MILESTONE_BORDER_STYLES.map((bs) => (
              <button
                key={bs.id}
                type="button"
                onClick={() => updateMilestone({ borderStyle: bs.id })}
                data-testid={`milestone-border-${bs.id}`}
                className={`py-1 rounded-lg text-[10px] font-semibold ${
                  design.milestone?.borderStyle === bs.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {bs.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Border Color
          </label>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {design.milestone?.borderColor === 'auto' ? (
              <>
                <span className="text-xs flex-1 text-slate-600 dark:text-slate-300">
                  Auto · contrasts with canvas
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateMilestone({
                      borderColor: tokens.isLight ? '#0f172a' : '#ffffff',
                    })
                  }
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Custom
                </button>
              </>
            ) : (
              <>
                <input
                  type="color"
                  value={design.milestone?.borderColor || '#ffffff'}
                  onChange={(e) => updateMilestone({ borderColor: e.target.value })}
                  data-testid="milestone-border-color-input"
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono flex-1">{design.milestone?.borderColor}</span>
                <button
                  type="button"
                  onClick={() => updateMilestone({ borderColor: 'auto' })}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  Auto
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
