import MilestoneMarker from '../MilestoneMarker';
import { getCategoryBackground, getTimelineBarStyle } from '../canvasStyles';
import { NO_WORD_BREAK, nbHyphen, resolveMilestoneDesign } from '../styleHelpers';
import { YellowDuckIcon } from './DuckParts';

export function BarVisual({
  label,
  hasEndMilestone = false,
  category,
  design,
  tokens,
  density,
  duration = 1,
  shortUnit = 'S',
  isPopoverOpen = false,
}) {
  const itemStyle = design.itemStyle || 'pill-gradient';
  const isDuck = Boolean(design?.duckMode);
  const text = nbHyphen(label);
  const baseBarStyle = getTimelineBarStyle(category, design, tokens.isLight, tokens);
  const barStyle = isDuck
    ? {
      ...baseBarStyle,
      borderColor: '#facc15',
      boxShadow: `${baseBarStyle.boxShadow || ''}, 0 0 8px rgba(250, 204, 21, 0.45)`.replace(
        /^,\s*/,
        ''
      ),
    }
    : baseBarStyle;
  const wrapCls = density.singleLine ? 'truncate whitespace-nowrap' : 'whitespace-normal wrap-ok';
  const labelNode = (extra = '') => (
    <span
      data-export-text="true"
      style={{ fontSize: `${density.labelPx}px`, ...NO_WORD_BREAK }}
      className={`font-semibold tracking-tight leading-snug drop-shadow-sm inline-flex items-center gap-1.5 ${wrapCls} ${extra}`}
    >
      {isDuck && <YellowDuckIcon size={14} className="shrink-0" />}
      <span className={wrapCls}>{text}</span>
    </span>
  );
  const dur = design.showBarDurationLabels ? (
    <span
      data-export-text="true"
      className="text-[9px] font-mono font-bold px-1.5 rounded bg-black/25 text-white shrink-0 whitespace-nowrap"
    >
      {duration}
      {shortUnit}
    </span>
  ) : null;
  const ms = hasEndMilestone ? (
    <MilestoneMarker
      milestoneDesign={resolveMilestoneDesign(design.milestone, tokens)}
      size={density.msSize}
      effects={design.effects}
      isLight={tokens.isLight}
      title="End-of-Line Milestone Gate"
    />
  ) : null;
  const ring = isPopoverOpen ? 'ring-2 ring-white shadow-xl' : '';

  let variant;
  if (itemStyle === 'thin-line') {
    variant = (
      <div
        className={`w-full h-full px-2 flex flex-col justify-center ${isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
          }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <span
            data-export-text="true"
            style={{
              color: tokens.textMain,
              fontSize: `${density.labelPx}px`,
              ...NO_WORD_BREAK,
            }}
            className={`font-bold leading-tight ${wrapCls}`}
          >
            {text}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {dur}
            {ms}
          </span>
        </div>
        <div className="w-full flex items-center">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <div
            className="h-1 flex-1 rounded-full"
            style={{
              background: getCategoryBackground(category),
              boxShadow: design.effects?.neon ? `0 0 10px ${category.color}` : undefined,
            }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
        </div>
      </div>
    );
  } else if (itemStyle === 'bracket-bar') {
    // Classic Gantt summary bar: label above, slim bar, downward triangles at both ends.
    const tri = category.color;
    variant = (
      <div
        className={`w-full h-full px-1 flex flex-col justify-center gap-1 ${isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
          }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span
            data-export-text="true"
            style={{
              color: tokens.textMain,
              fontSize: `${density.labelPx}px`,
              ...NO_WORD_BREAK,
            }}
            className={`font-semibold leading-snug min-w-0 flex-1 ${wrapCls}`}
          >
            {text}
          </span>
          {dur}
          {ms}
        </div>
        <div className="relative" style={{ height: 9, marginBottom: 7 }}>
          <div
            style={{ ...barStyle, height: 9, padding: 0, borderRadius: 1, border: 'none' }}
            className="w-full"
          />
          <span
            className="absolute left-0"
            style={{
              top: 9,
              width: 0,
              height: 0,
              borderLeft: `8px solid ${tri}`,
              borderBottom: '7px solid transparent',
            }}
          />
          <span
            className="absolute right-0"
            style={{
              top: 9,
              width: 0,
              height: 0,
              borderRight: `8px solid ${tri}`,
              borderBottom: '7px solid transparent',
            }}
          />
        </div>
      </div>
    );
  } else if (itemStyle === 'beaded' || itemStyle === 'label-rule' || itemStyle === 'arrow-line') {
    const track =
      itemStyle === 'arrow-line' ? (
        <div className="w-full flex items-center">
          <div
            style={{ height: 4, background: getCategoryBackground(category) }}
            className="flex-1 rounded-l-full"
          />
          <span
            style={{
              width: 0,
              height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: `10px solid ${category.color}`,
            }}
          />
        </div>
      ) : itemStyle === 'beaded' ? (
        <div
          style={{
            height: 8,
            backgroundImage: `radial-gradient(circle, ${category.color} 3px, transparent 3.5px)`,
            backgroundSize: '11px 8px',
            backgroundRepeat: 'repeat-x',
          }}
          className="w-full"
        />
      ) : (
        <div
          style={{
            height: 10,
            borderLeft: `2px solid ${category.color}`,
            borderRight: `2px solid ${category.color}`,
          }}
          className="w-full flex items-center"
        >
          <div
            style={{ height: 3, background: getCategoryBackground(category) }}
            className="w-full rounded-full"
          />
        </div>
      );
    variant = (
      <div
        className={`w-full h-full px-1 flex flex-col justify-center gap-1 ${isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
          }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          <span
            data-export-text="true"
            style={{
              color: tokens.textMain,
              fontSize: `${density.labelPx}px`,
              ...NO_WORD_BREAK,
            }}
            className={`font-semibold leading-snug min-w-0 flex-1 ${wrapCls}`}
          >
            {text}
          </span>
          {dur}
          {ms}
        </div>
        {track}
      </div>
    );
  } else if (itemStyle === 'label-tag') {
    variant = (
      <div className={`w-full h-full flex items-center gap-1.5 ${ring}`}>
        <div
          style={{ ...barStyle, borderRadius: '8px 0 0 8px', borderRightWidth: 0 }}
          className="self-stretch px-2.5 py-1 flex items-center shrink-0 max-w-[75%] min-w-0"
        >
          {labelNode()}
        </div>
        <div
          style={{
            ...barStyle,
            height: 10,
            padding: 0,
            borderRadius: '0 6px 6px 0',
            borderLeftWidth: 0,
            marginLeft: -6,
          }}
          className="flex-1 min-w-[12px]"
        />
        {dur}
        {ms}
      </div>
    );
  } else if (itemStyle === 'track-inset') {
    variant = (
      <div
        style={{
          background: `${category.color}22`,
          border: `1px solid ${category.color}55`,
          borderRadius: 13,
        }}
        className={`w-full h-full p-[3px] ${ring}`}
      >
        <div
          style={{ ...barStyle, borderRadius: 10 }}
          className="w-full h-full px-2.5 flex items-center justify-between gap-1.5"
        >
          <span className="min-w-0 flex-1">{labelNode()}</span>
          {dur}
          {ms}
        </div>
      </div>
    );
  } else if (itemStyle === 'glow-capsule') {
    variant = (
      <div
        style={barStyle}
        className={`w-full h-full pr-3 pl-1 py-1 flex items-center justify-between gap-2 overflow-hidden ${ring}`}
      >
        <span
          data-export-text="true"
          className="h-full px-2 rounded-full flex items-center justify-center text-[10px] font-mono font-extrabold text-white shrink-0 bg-black/30 whitespace-nowrap"
        >
          {duration}
          {shortUnit}
        </span>
        <span className="min-w-0 flex-1">{labelNode()}</span>
        {ms}
      </div>
    );
  } else {
    variant = (
      <div
        style={barStyle}
        className={`relative w-full h-full py-1 flex items-center justify-between gap-1.5 ${itemStyle === 'chevron'
            ? 'pl-4 pr-5'
            : itemStyle === 'pentagon' || itemStyle === 'swallowtail'
              ? 'pl-3 pr-5'
              : 'px-3'
          } ${ring}`}
      >
        <span className="min-w-0 flex-1">{labelNode()}</span>
        {dur}
        {ms}
        {itemStyle === 'segmented' &&
          duration > 1 &&
          Array.from({ length: duration - 1 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
              style={{
                left: `${((i + 1) / duration) * 100}%`,
                backgroundColor: 'rgba(255,255,255,0.6)',
                boxShadow: '0 0 0 0.5px rgba(0,0,0,0.25)',
              }}
            />
          ))}
      </div>
    );
  }

  const clipped = ['chevron', 'pentagon', 'swallowtail'].includes(itemStyle);
  const fx = design.effects || {};
  let clipFilter;
  if (clipped && !fx.flat) {
    const ink = tokens.isLight ? '#090d16' : '#f8fafc';
    if (fx.brutalist)
      // 2px outline (four offset copies) followed by the hard offset shadow.
      clipFilter = `drop-shadow(2px 0 0 ${ink}) drop-shadow(-2px 0 0 ${ink}) drop-shadow(0 2px 0 ${ink}) drop-shadow(0 -2px 0 ${ink}) drop-shadow(4px 4px 0 ${ink})`;
    else if (fx.neon || fx.spotlight) clipFilter = `drop-shadow(0 0 8px ${category.color})`;
    else if (fx.shadows ?? true) clipFilter = `drop-shadow(0 6px 8px ${category.color}66)`;
  }

  return (
    <div className="relative w-full h-full" style={{ filter: clipFilter }}>
      {variant}
    </div>
  );
}
