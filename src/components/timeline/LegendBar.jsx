import { getCategoryBackground } from '../canvasStyles';
import { resolveMilestoneDesign } from '../styleHelpers';
import MilestoneMarker from '../MilestoneMarker';

export default function LegendBar({ legend, design, tokens }) {
  const opt = design?.legend || {};
  const legendStyle = design?.legendStyle || 'chips';
  const md = resolveMilestoneDesign(design?.milestone, tokens);
  const msColor = md.color;
  const msBorder = md.borderColor;
  const swatchPx = { sm: 11, md: 14, lg: 18 }[opt.size] ?? 14;
  const textCls = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }[opt.size] ?? 'text-xs';
  const gapCls = { tight: 'gap-1', normal: 'gap-2', loose: 'gap-3.5' }[opt.gap] || 'gap-2';
  const caseCls = opt.labelCase === 'upper' ? 'uppercase tracking-wide' : '';
  const framed = opt.frame !== 'none';
  const titleText = String(opt.title ?? 'Legend').trim();
  const shapeCls =
    opt.swatchShape === 'square'
      ? 'rounded-[2px]'
      : opt.swatchShape === 'circle'
        ? 'rounded-full'
        : 'rounded-md';

  const swatch = (cat) => (
    <span
      className={`shrink-0 ${shapeCls}`}
      style={{
        width: swatchPx,
        height: swatchPx,
        background: getCategoryBackground(cat),
        border: cat.hasBorder
          ? `2px solid ${cat.borderColor || '#ffffff'}`
          : '1px solid rgba(255, 255, 255, 0.3)',
      }}
    />
  );

  const itemShell = (key, children, extra = {}) => {
    if (legendStyle === 'swatches') {
      return (
        <div
          key={key}
          style={{ color: tokens?.textMain }}
          className={`inline-flex items-center gap-1.5 px-1 py-0.5 font-medium ${textCls}`}
        >
          {children}
        </div>
      );
    }
    if (legendStyle === 'filled') {
      return (
        <div
          key={key}
          style={extra.filled}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-white shadow-sm ${textCls}`}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        key={key}
        style={{
          backgroundColor: tokens?.chipBg,
          borderColor: extra.chipBorder || tokens?.chipBorder,
          color: tokens?.textMain,
        }}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border font-medium shadow-sm ${textCls}`}
      >
        {children}
      </div>
    );
  };

  return (
    <div
      style={
        framed
          ? {
              backgroundColor: tokens?.legendBarBg,
              borderColor: tokens?.chipBorder,
            }
          : undefined
      }
      className={`flex ${gapCls} ${
        framed ? 'backdrop-blur-md px-4 py-2.5 rounded-2xl border' : ''
      } flex-wrap items-center`}
      data-testid="canvas-legend-bar"
    >
      {opt.showTitle !== false && titleText && (
        <span
          data-export-text="true"
          style={{ color: tokens?.textMuted }}
          className="text-[10px] font-bold uppercase tracking-wider mr-1"
        >
          {titleText}
        </span>
      )}

      {legend.map((cat) =>
        itemShell(
          cat.id,
          <>
            {legendStyle !== 'filled' && swatch(cat)}
            <span data-export-text="true" className={`leading-snug ${caseCls}`}>
              {cat.label}
            </span>
          </>,
          {
            filled: {
              background: getCategoryBackground(cat),
              border: cat.hasBorder
                ? `2px solid ${cat.borderColor || '#ffffff'}`
                : '1px solid rgba(255,255,255,0.28)',
            },
          }
        )
      )}

      {opt.includeMilestone !== false &&
        itemShell(
          'milestone',
          <>
            <MilestoneMarker
              milestoneDesign={md}
              size={swatchPx}
              effects={design?.effects}
              isLight={tokens?.isLight}
            />
            <span data-export-text="true" className={`leading-snug ${caseCls}`}>
              {opt.milestoneLabel || 'Milestone'}
            </span>
          </>,
          {
            chipBorder: `${msColor}66`,
            filled: {
              background: `linear-gradient(135deg, ${msColor} 0%, ${msColor}cc 100%)`,
              border:
                md?.borderStyle && md.borderStyle !== 'none'
                  ? `1.5px ${md.borderStyle} ${msBorder}`
                  : '1px solid rgba(255,255,255,0.35)',
            },
          }
        )}
    </div>
  );
}
