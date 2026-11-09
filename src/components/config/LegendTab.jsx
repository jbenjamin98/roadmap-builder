import { inputCls } from './navConfig';
import { Diamond, Eye } from 'lucide-react';
import { LEGEND_POSITIONS, LEGEND_STYLES } from '../../constants/designOptions';
import { Segmented, FieldLabel, ToggleRow } from './primitives';

export default function LegendTab({ ctx }) {
  const { design, legendHidden, panelTitle, updateDesign, updateLegend } = ctx;

  return (
    <div className="space-y-6">
      {panelTitle(Eye, 'text-indigo-600 dark:text-indigo-400', 'Legend')}

      {/* 1. Placement: everything else depends on this */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">1. Placement</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel>Position</FieldLabel>
            <Segmented
              options={LEGEND_POSITIONS.map((lp) => [lp.id, lp.name])}
              value={design.legendPosition}
              onChange={(v) => updateDesign({ legendPosition: v })}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Alignment</FieldLabel>
            <Segmented
              options={[
                ['start', 'Left'],
                ['center', 'Center'],
                ['end', 'Right'],
              ]}
              value={design.legend?.align || 'end'}
              onChange={(v) => updateLegend({ align: v })}
              disabled={design.legendPosition !== 'bottom'}
            />
            {design.legendPosition !== 'bottom' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Only applies when the legend is at the bottom.
              </p>
            )}
          </div>
        </div>
      </div>

      {legendHidden && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
          The legend is hidden, so the options below have no effect.
        </p>
      )}

      {/* 2. Item look: shape depends on the item style */}
      <div className={`space-y-3 ${legendHidden ? 'opacity-50' : ''}`}>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
          2. Item appearance
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel>Item style</FieldLabel>
            <Segmented
              options={LEGEND_STYLES.map((ls) => [ls.id, ls.name])}
              value={design.legendStyle}
              onChange={(v) => updateDesign({ legendStyle: v })}
              disabled={legendHidden}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Swatch shape</FieldLabel>
            <Segmented
              options={[
                ['square', 'Square'],
                ['rounded', 'Rounded'],
                ['circle', 'Circle'],
              ]}
              value={design.legend?.swatchShape || 'rounded'}
              onChange={(v) => updateLegend({ swatchShape: v })}
              disabled={legendHidden || design.legendStyle === 'filled'}
            />
            {design.legendStyle === 'filled' && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Filled items are solid pills, so they have no swatch.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Size</FieldLabel>
            <Segmented
              options={[
                ['sm', 'Small'],
                ['md', 'Medium'],
                ['lg', 'Large'],
              ]}
              value={design.legend?.size || 'md'}
              onChange={(v) => updateLegend({ size: v })}
              disabled={legendHidden}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Spacing between items</FieldLabel>
            <Segmented
              options={[
                ['tight', 'Tight'],
                ['normal', 'Normal'],
                ['loose', 'Loose'],
              ]}
              value={design.legend?.gap || 'normal'}
              onChange={(v) => updateLegend({ gap: v })}
              disabled={legendHidden}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Container</FieldLabel>
            <Segmented
              options={[
                ['boxed', 'Boxed'],
                ['none', 'No box'],
              ]}
              value={design.legend?.frame || 'boxed'}
              onChange={(v) => updateLegend({ frame: v })}
              disabled={legendHidden}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Label text</FieldLabel>
            <Segmented
              options={[
                ['normal', 'As typed'],
                ['upper', 'UPPERCASE'],
              ]}
              value={design.legend?.labelCase || 'normal'}
              onChange={(v) => updateLegend({ labelCase: v })}
              disabled={legendHidden}
            />
          </div>
        </div>
      </div>

      {/* 3. Content: text inputs depend on their toggles */}
      <div className={`space-y-3 ${legendHidden ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">3. Content</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-2">
            <ToggleRow
              icon={Eye}
              tone="text-indigo-500"
              title="Show legend title"
              desc="A small heading before the items"
              checked={design.legend?.showTitle !== false}
              onChange={(v) => updateLegend({ showTitle: v })}
              testId="config-legend-title"
            />
            <input
              type="text"
              value={design.legend?.title ?? 'Legend'}
              onChange={(e) => updateLegend({ title: e.target.value })}
              disabled={design.legend?.showTitle === false}
              placeholder="Legend"
              aria-label="Legend title text"
              className={`${inputCls} ${design.legend?.showTitle === false ? 'opacity-45' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <ToggleRow
              icon={Diamond}
              tone="text-amber-500"
              title="Include milestone"
              desc="List the milestone symbol too"
              checked={design.legend?.includeMilestone !== false}
              onChange={(v) => updateLegend({ includeMilestone: v })}
              testId="config-legend-milestone"
            />
            <input
              type="text"
              value={design.legend?.milestoneLabel ?? 'Milestone'}
              onChange={(e) => updateLegend({ milestoneLabel: e.target.value })}
              disabled={design.legend?.includeMilestone === false}
              placeholder="Milestone"
              aria-label="Milestone legend label"
              className={`${inputCls} ${
                design.legend?.includeMilestone === false ? 'opacity-45' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
