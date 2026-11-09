import { Clock, Columns, Compass, Grid, Rows, Zap } from 'lucide-react';
import { CANVAS_CORNER_STYLES } from '../../constants/designOptions';
import { Segmented, ToggleRow } from './primitives';

export default function GridTab({ ctx }) {
  const {
    alternateRowHighlighting,
    design,
    panelTitle,
    setAlternateRowHighlighting,
    setSubtleGridDemarcations,
    subtleGridDemarcations,
    updateDesign,
  } = ctx;
  const brandLocked = Boolean(design.brandTheme);

  return (
    <div className="space-y-4">
      {panelTitle(Grid, 'text-indigo-600 dark:text-indigo-400', 'Canvas Grid & Display')}

      {/* Canvas Corner Style (pinned by brand themes) */}
      <div
        data-testid="config-corner-style"
        aria-disabled={brandLocked}
        className="space-y-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60"
      >
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          Canvas Corner Style
        </label>
        <div
          className={`flex flex-wrap gap-1 ${brandLocked ? 'pointer-events-none opacity-50' : ''}`}
        >
          <Segmented
            options={CANVAS_CORNER_STYLES.map((c) => [c.id, c.name])}
            value={design.canvasCorners || 'curved'}
            onChange={(v) => updateDesign({ canvasCorners: v })}
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {brandLocked
            ? 'Pinned to Subtle (8px) by the Appian brand theme.'
            : 'Controls corner radius of the roadmap canvas, bottom tracks, section spines, and overlays.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <ToggleRow
          icon={Rows}
          tone="text-indigo-500"
          title="Alt Row Highlighting"
          desc="Zebra striping on alternate task rows"
          checked={alternateRowHighlighting}
          onChange={setAlternateRowHighlighting}
          testId="config-alt-rows-checkbox"
        />
        <ToggleRow
          icon={Grid}
          tone="text-indigo-500"
          title="Grid Lines"
          desc="Period column and row divider lines"
          checked={subtleGridDemarcations}
          onChange={setSubtleGridDemarcations}
          testId="config-grid-lines-checkbox"
        />
        <ToggleRow
          icon={Columns}
          tone="text-sky-500"
          title="Alt Period Column Shading"
          desc="Subtle contrast on even periods"
          checked={Boolean(design.alternateColumnShading)}
          onChange={(v) => updateDesign({ alternateColumnShading: v })}
          testId="config-alt-cols-checkbox"
        />
        <ToggleRow
          icon={Compass}
          tone="text-rose-500"
          title="This Period Marker"
          desc="Shows when today falls inside the timeline"
          checked={Boolean(design.todayMarker)}
          onChange={(v) => updateDesign({ todayMarker: v })}
          testId="config-today-marker-checkbox"
        />
        <ToggleRow
          icon={Clock}
          tone="text-purple-500"
          title="Bar Duration Badges"
          desc="Period span badge inside bars"
          checked={Boolean(design.showBarDurationLabels)}
          onChange={(v) => updateDesign({ showBarDurationLabels: v })}
          testId="config-bar-duration-checkbox"
        />
        <ToggleRow
          icon={Zap}
          tone="text-fuchsia-500"
          title="Accent Section Dividers"
          desc="Section borders use the accent color"
          checked={Boolean(design.sectionDividerGlow)}
          onChange={(v) => updateDesign({ sectionDividerGlow: v })}
          testId="config-section-glow-checkbox"
        />
      </div>
    </div>
  );
}
