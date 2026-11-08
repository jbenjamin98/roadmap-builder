// Shared presentational pieces used by the real canvas, the live preview and the settings swatches
// so every option looks identical everywhere.
import { differenceInCalendarDays, format } from 'date-fns';
import MilestoneMarker from './MilestoneMarker';
import { getCategoryBackground, getTimelineBarStyle } from './canvasStyles';
import { SPINE_WIDTH } from '../constants/designOptions';
import { NO_WORD_BREAK, nbHyphen, resolveMilestoneDesign } from './styleHelpers';


/* ------------------------------------------------------------------ */
/* Numbering + markers                                                  */
/* ------------------------------------------------------------------ */

/** Numbering badge: one of 12 looks, shared by sections (X), sub-sections (X.X) and tasks (X.X.X). */
export function NumBadge({
  label,
  accent,
  solid = false,
  radius,
  numStyle = 'soft-tint',
  className = '',
}) {
  const a = solid ? '#ffffff' : accent;
  const fill = solid ? 'rgba(0,0,0,0.3)' : accent;
  let text = String(label);
  let style;
  let shape = 'rounded-md px-1.5 py-0.5';

  switch (numStyle) {
    case 'solid-chip':
      style = { backgroundColor: fill, color: '#ffffff' };
      break;
    case 'outlined':
      style = { border: `1.5px solid ${a}`, color: a };
      break;
    case 'plain':
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'circle':
      style = {
        backgroundColor: `${a}24`,
        border: `1px solid ${a}66`,
        color: a,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
      };
      shape = 'rounded-full px-1.5';
      break;
    case 'underline':
      style = { borderBottom: `2px solid ${a}`, color: a };
      shape = 'px-0.5 py-0.5';
      break;
    case 'bracket':
      text = `[${label}]`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'paren':
      text = `(${label})`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'dot-suffix':
      text = `${label}.`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'pill-solid':
      style = { backgroundColor: fill, color: '#ffffff' };
      shape = 'rounded-full px-2 py-0.5';
      break;
    case 'hash-prefix':
      text = `#${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'side-rule':
      style = {
        borderLeft: `3px solid ${a}`,
        backgroundColor: `${a}16`,
        color: a,
      };
      shape = 'rounded-r-md pl-1.5 pr-1.5 py-0.5';
      break;
    case 'angle':
      text = `<${label}>`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'slash-suffix':
      text = `${label} /`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'square-solid':
      style = { backgroundColor: fill, color: '#ffffff' };
      shape = 'rounded-[2px] px-1.5 py-0.5';
      break;
    case 'arrow-prefix':
      text = `▸${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'section-sign':
      text = `§${label}`;
      style = { color: a };
      shape = 'px-0 py-0.5';
      break;
    case 'zero-pad':
      text = String(label)
        .split('.')
        .map((n) => n.padStart(2, '0'))
        .join('.');
      style = {
        backgroundColor: `${a}24`,
        color: a,
        border: `1px solid ${a}55`,
      };
      break;
    case 'soft-tint':
    default:
      style = {
        backgroundColor: `${a}24`,
        color: a,
        border: `1px solid ${a}55`,
      };
  }
  if (radius) style.borderRadius = radius;

  return (
    <span
      data-export-text="true"
      style={style}
      className={`inline-flex items-center text-[10px] font-mono font-extrabold leading-none shrink-0 whitespace-nowrap ${shape} ${className}`}
    >
      {text}
    </span>
  );
}

/** Section number badge (only when numbering is on). Tab-flag keeps a plain tab when off. */
export function SectionNumber({ show, label, accent, visuals, numStyle }) {
  if (show) {
    return (
      <NumBadge
        label={label}
        accent={accent}
        solid={visuals.solid}
        numStyle={numStyle}
        radius={
          visuals.tab && (numStyle === 'soft-tint' || !numStyle)
            ? '0 999px 999px 0'
            : undefined
        }
        className={visuals.tab ? '-ml-2 pl-3' : ''}
      />
    );
  }
  if (visuals.tab) {
    return (
      <span
        className="shrink-0 w-3 h-5 -ml-2 rounded-r-full"
        style={{ backgroundColor: accent }}
      />
    );
  }
  return null;
}

/**
 * Sub-section and task rows share one set of style names. `level` only changes
 * small details (e.g. the tree line glyph). Everything is vertically centred.
 */
export function LevelLabel({
  styleId = 'plain',
  level = 'task',
  accent,
  badge = null,
  children,
}) {
  const body = (
    <span className="flex items-center gap-2 min-w-0 flex-1">
      {badge}
      {children}
    </span>
  );
  const base = 'flex items-center gap-2 min-w-0 flex-1';

  switch (styleId) {
    case 'dot':
      return (
        <div className={base}>
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: accent }}
          />
          {body}
        </div>
      );
    case 'tree-line':
      return (
        <div className={base}>
          {level === 'sub' ? (
            <span
              className="w-3.5 h-0.5 rounded-full shrink-0"
              style={{ backgroundColor: accent }}
            />
          ) : (
            <span
              className="relative w-3.5 self-stretch shrink-0 min-h-[18px]"
              style={{ marginTop: -7, marginBottom: -7 }}
            >
              <span
                className="absolute left-0 w-0.5"
                style={{ top: 0, bottom: 0, backgroundColor: accent }}
              />
              <span
                className="absolute left-0 w-3.5 h-0.5 top-1/2 -translate-y-1/2"
                style={{ backgroundColor: accent }}
              />
            </span>
          )}
          {body}
        </div>
      );
    case 'left-bar':
      return (
        <div
          className={`${base} pl-2`}
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          {body}
        </div>
      );
    case 'soft-fill':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-md`}
          style={{ backgroundColor: `${accent}1e` }}
        >
          {body}
        </div>
      );
    case 'outlined':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-lg`}
          style={{ border: `1.5px solid ${accent}77` }}
        >
          {body}
        </div>
      );
    case 'pill':
      return (
        <div
          className={`${base} px-2.5 py-0.5 rounded-full`}
          style={{
            backgroundColor: `${accent}22`,
            border: `1px solid ${accent}55`,
          }}
        >
          {body}
        </div>
      );
    case 'underline':
      return (
        <div
          className={`${base} pb-0.5`}
          style={{ borderBottom: `2px solid ${accent}` }}
        >
          {body}
        </div>
      );
    case 'gradient-fade':
      return (
        <div
          className={`${base} pl-2.5 pr-2 py-0.5 rounded-l-md`}
          style={{
            background: `linear-gradient(90deg, ${accent}40 0%, ${accent}00 100%)`,
          }}
        >
          {body}
        </div>
      );
    case 'tab-flag':
      return (
        <div
          className="flex items-stretch gap-0 min-w-0 flex-1 overflow-hidden rounded-md"
          style={{ backgroundColor: `${accent}18` }}
        >
          <span
            className="w-2 shrink-0"
            style={{ backgroundColor: accent }}
          />
          <div className="flex items-center gap-2 min-w-0 flex-1 px-2 py-0.5">
            {body}
          </div>
        </div>
      );
    case 'double-rule':
      return (
        <div
          className={`${base} py-0.5`}
          style={{
            borderTop: `1px solid ${accent}99`,
            borderBottom: `1px solid ${accent}99`,
          }}
        >
          {body}
        </div>
      );
    case 'corner-brackets': {
      const corner = (pos) => (
        <span
          key={pos}
          className="absolute w-1.5 h-1.5"
          style={{
            top: pos.startsWith('t') ? 0 : undefined,
            bottom: pos.startsWith('b') ? 0 : undefined,
            left: pos.endsWith('l') ? 0 : undefined,
            right: pos.endsWith('r') ? 0 : undefined,
            borderTop: pos.startsWith('t') ? `2px solid ${accent}` : undefined,
            borderBottom: pos.startsWith('b') ? `2px solid ${accent}` : undefined,
            borderLeft: pos.endsWith('l') ? `2px solid ${accent}` : undefined,
            borderRight: pos.endsWith('r') ? `2px solid ${accent}` : undefined,
          }}
        />
      );
      return (
        <div className={`${base} relative px-3 py-1`}>
          {['tl', 'tr', 'bl', 'br'].map(corner)}
          {body}
        </div>
      );
    }
    case 'glow-bar':
      return (
        <div
          className={`${base} pl-2`}
          style={{
            borderLeft: `3px solid ${accent}`,
            boxShadow: `-3px 0 8px -2px ${accent}`,
          }}
        >
          {body}
        </div>
      );
    case 'trailing-rule':
      return (
        <div className={base}>
          <span className="flex items-center gap-2 min-w-0">
            {badge}
            {children}
          </span>
          <span
            className="flex-1 h-px min-w-[14px]"
            style={{ backgroundColor: `${accent}99` }}
          />
        </div>
      );
    case 'double-bar':
      return (
        <div
          className={`${base} pl-2`}
          style={{ borderLeft: `4px double ${accent}` }}
        >
          {body}
        </div>
      );
    case 'dashed-box':
      return (
        <div
          className={`${base} px-2 py-0.5 rounded-lg`}
          style={{ border: `1.5px dashed ${accent}99` }}
        >
          {body}
        </div>
      );
    case 'shadow-card':
      return (
        <div
          className={`${base} px-2.5 py-0.5 rounded-md`}
          style={{
            backgroundColor: `${accent}12`,
            boxShadow:
              '0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
        >
          {body}
        </div>
      );
    case 'arrow-ribbon':
      return (
        <div className="flex items-center min-w-0 flex-1">
          <span
            className="shrink-0"
            style={{
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderLeft: `9px solid ${accent}`,
            }}
          />
          <div
            className="flex items-center gap-2 min-w-0 flex-1 px-2 py-0.5 rounded-r-md"
            style={{ backgroundColor: `${accent}1c` }}
          >
            {body}
          </div>
        </div>
      );
    case 'plain':
    default:
      return <div className={base}>{body}</div>;
  }
}

/* ------------------------------------------------------------------ */
/* Period / date column headers (each style shows dates differently)    */
/* ------------------------------------------------------------------ */

function DateRange({ period, prefix = '', suffix = '' }) {
  // prefix/suffix are glued to the first/last date so they never wrap onto their own line.
  return (
    <span>
      <span className="whitespace-nowrap">
        {prefix}
        {period.startDate}
      </span>
      <span> – </span>
      <span className="whitespace-nowrap">
        {period.endDate}
        {suffix}
      </span>
    </span>
  );
}

export function PeriodHeaderCell({
  styleId = 'accent-bar',
  period,
  accent,
  tokens,
  density,
  isAltCol = false,
  subtleGrid = true,
  width,
  testId,
}) {
  const showDates = !density?.hideDates;
  const py = density?.headerPy ?? 12;
  const textMain = tokens.textMain;
  const muted = tokens.textMuted;
  const title = (extra = '') => (
    <span
      data-export-text="true"
      style={{ color: textMain }}
      className={`whitespace-nowrap ${extra}`}
    >
      {period.title}
    </span>
  );

  const cellStyle = {
    width,
    paddingTop: py,
    paddingBottom: py,
    backgroundColor: isAltCol ? tokens.colShadeBg : undefined,
    borderColor: subtleGrid ? tokens.gridBorder : 'transparent',
  };
  if (styleId === 'block-fill') cellStyle.backgroundColor = `${accent}28`;
  if (styleId === 'underline-tabs') cellStyle.borderBottom = `3px solid ${accent}`;
  if (styleId === 'top-ribbon') {
    cellStyle.paddingTop = 0;
    cellStyle.paddingLeft = 0;
    cellStyle.paddingRight = 0;
  }

  let body;
  switch (styleId) {
    case 'pill-badge':
      body = (
        <div className="flex flex-col items-start gap-1">
          <span
            data-export-text="true"
            style={{ backgroundColor: accent }}
            className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shadow-sm whitespace-nowrap"
          >
            {period.title}
          </span>
          {showDates && (
            <span
              data-export-text="true"
              style={{
                color: muted,
                borderColor: `${accent}55`,
                backgroundColor: `${accent}12`,
              }}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md border leading-snug"
            >
              <DateRange period={period} />
            </span>
          )}
        </div>
      );
      break;
    case 'block-fill':
      body = (
        <>
          {title('text-xs font-extrabold uppercase tracking-wider')}
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted, borderColor: `${accent}66` }}
              className="mt-1 pt-1 border-t text-[10px] font-mono leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </>
      );
      break;
    case 'underline-tabs':
      body = (
        <>
          <span
            data-export-text="true"
            style={{ color: accent }}
            className="text-xs font-extrabold tracking-tight whitespace-nowrap"
          >
            {period.title}
          </span>
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="mt-0.5 text-[10px] font-mono leading-tight grid grid-cols-[auto_1fr] gap-x-1.5"
            >
              <span style={{ color: accent }}>from</span>
              <span className="whitespace-nowrap">{period.startDate}</span>
              <span style={{ color: accent }}>to</span>
              <span className="whitespace-nowrap">{period.endDate}</span>
            </div>
          )}
        </>
      );
      break;
    case 'two-tier':
      body = (
        <div className="flex items-center gap-2">
          <span
            data-export-text="true"
            style={{ backgroundColor: accent }}
            className="shrink-0 min-w-[34px] text-center text-sm font-black font-mono leading-none px-1.5 py-1.5 rounded-lg text-white"
          >
            {period.code}
          </span>
          <div className="min-w-0">
            {title('text-xs font-bold block')}
            {showDates && (
              <div
                data-export-text="true"
                style={{ color: muted }}
                className="text-[10px] font-mono leading-snug"
              >
                <DateRange period={period} />
              </div>
            )}
          </div>
        </div>
      );
      break;
    case 'minimal-text':
      body = (
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          {title('text-xs font-semibold')}
          {showDates && (
            <span
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] font-mono leading-snug"
            >
              <DateRange period={period} />
            </span>
          )}
        </div>
      );
      break;
    case 'top-ribbon':
      body = (
        <>
          <div
            data-export-text="true"
            style={{ backgroundColor: accent }}
            className={`px-3 text-[9px] font-mono font-bold text-white leading-snug ${
              showDates ? 'py-0.5' : 'py-0.5 h-1.5 overflow-hidden'
            }`}
          >
            {showDates ? <DateRange period={period} /> : null}
          </div>
          <div className="px-3 pt-1.5">{title('text-xs font-extrabold')}</div>
        </>
      );
      break;
    case 'card-inset':
      body = (
        <div
          style={{ borderColor: `${accent}66`, backgroundColor: `${accent}14` }}
          className="rounded-lg overflow-hidden border"
        >
          <div className="px-2 py-1">{title('text-xs font-bold')}</div>
          {showDates && (
            <div
              data-export-text="true"
              style={{
                borderColor: `${accent}44`,
                backgroundColor: `${accent}26`,
                color: tokens.textSecondary,
              }}
              className="px-2 py-0.5 border-t text-[9px] font-mono leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </div>
      );
      break;
    case 'bracket-frame':
      body = (
        <div className="font-mono">
          <div className="text-xs font-bold tracking-wider uppercase whitespace-nowrap">
            <span style={{ color: accent }}>[</span>{' '}
            <span data-export-text="true" style={{ color: textMain }}>
              {period.title}
            </span>{' '}
            <span style={{ color: accent }}>]</span>
          </div>
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] mt-0.5 leading-snug"
            >
              <DateRange period={period} prefix="‹ " suffix=" ›" />
            </div>
          )}
        </div>
      );
      break;
    case 'timeline-rule':
      body = (
        <>
          {title('text-xs font-bold')}
          {showDates && (
            <div className="mt-1.5">
              <div className="flex items-center">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="h-0.5 flex-1"
                  style={{ backgroundColor: `${accent}66` }}
                />
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: accent }}
                />
              </div>
              <div
                data-export-text="true"
                style={{ color: muted }}
                className="flex justify-between gap-2 text-[9px] font-mono mt-0.5 leading-snug"
              >
                <span className="whitespace-nowrap">{period.startDate}</span>
                <span className="whitespace-nowrap">{period.endDate}</span>
              </div>
            </div>
          )}
        </>
      );
      break;
    case 'date-first':
      body = (
        <>
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: accent }}
              className="text-[9px] font-mono font-bold uppercase tracking-wider leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
          {title('text-sm font-extrabold leading-tight')}
        </>
      );
      break;
    case 'range-chips':
      body = (
        <>
          {title('text-xs font-bold')}
          {showDates && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {[period.startDate, period.endDate].map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {i === 1 && <span style={{ color: muted }}>→</span>}
                  <span
                    data-export-text="true"
                    style={{
                      color: tokens.textSecondary,
                      backgroundColor: `${accent}1f`,
                      border: `1px solid ${accent}44`,
                    }}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-md whitespace-nowrap leading-none"
                  >
                    {d}
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      );
      break;
    case 'calendar-leaf':
      body = showDates ? (
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 rounded-lg overflow-hidden text-center border"
            style={{ borderColor: `${accent}66`, minWidth: 38 }}
          >
            <div
              data-export-text="true"
              style={{ backgroundColor: accent }}
              className="text-[8px] font-bold uppercase text-white leading-tight py-0.5"
            >
              {format(period.rawStart, 'MMM')}
            </div>
            <div
              data-export-text="true"
              style={{ color: textMain }}
              className="text-base font-black leading-none py-1"
            >
              {format(period.rawStart, 'd')}
            </div>
          </div>
          <div className="min-w-0">
            {title('text-xs font-bold block')}
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] font-mono leading-snug"
            >
              → <span className="whitespace-nowrap">{period.endDate}</span>
            </div>
          </div>
        </div>
      ) : (
        title('text-xs font-bold')
      );
      break;
    case 'split-cell':
      body = (
        <div
          className="flex items-stretch rounded-md overflow-hidden border"
          style={{ borderColor: `${accent}55` }}
        >
          <div
            className="px-2 py-1 flex items-center"
            style={{ backgroundColor: accent }}
          >
            <span
              data-export-text="true"
              className="text-xs font-bold text-white whitespace-nowrap"
            >
              {period.title}
            </span>
          </div>
          {showDates && (
            <div
              data-export-text="true"
              style={{
                backgroundColor: `${accent}1a`,
                color: tokens.textSecondary,
              }}
              className="px-2 py-1 flex items-center flex-1 text-[10px] font-mono leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </div>
      );
      break;
    case 'rule-sandwich':
      body = (
        <>
          {title('text-xs font-bold')}
          <div
            className="my-1 h-0.5 w-full rounded"
            style={{ backgroundColor: accent }}
          />
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] font-mono leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </>
      );
      break;
    case 'week-dots': {
      const weeks = Math.max(
        1,
        Math.round(
          (differenceInCalendarDays(period.rawEnd, period.rawStart) + 1) / 7
        )
      );
      body = (
        <>
          {title('text-xs font-bold')}
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {Array.from({ length: Math.min(weeks, 14) }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
            ))}
          </div>
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] font-mono mt-1 leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </>
      );
      break;
    }
    case 'ticket-stub':
      body = (
        <div className="flex items-stretch gap-2">
          <div className="flex items-center min-w-0">
            {title('text-xs font-extrabold')}
          </div>
          {showDates && (
            <div
              className="pl-2 flex flex-col justify-center text-[9px] font-mono leading-snug"
              style={{
                borderLeft: `2px dashed ${accent}`,
                color: tokens.textSecondary,
              }}
              data-export-text="true"
            >
              <span className="whitespace-nowrap">{period.startDate}</span>
              <span className="whitespace-nowrap">{period.endDate}</span>
            </div>
          )}
        </div>
      );
      break;
    case 'month-strip':
      body = (
        <>
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: accent }}
              className="text-[11px] font-mono font-extrabold uppercase tracking-wide leading-tight whitespace-nowrap"
            >
              {format(period.rawStart, 'MMM d')} – {format(period.rawEnd, 'MMM d')}
            </div>
          )}
          {title('text-xs font-semibold')}
        </>
      );
      break;
    case 'accent-bar':
    default:
      body = (
        <>
          <div
            className="h-1 w-10 rounded-full mb-1.5"
            style={{ backgroundColor: accent }}
          />
          {title('text-xs font-bold tracking-tight')}
          {showDates && (
            <div
              data-export-text="true"
              style={{ color: muted }}
              className="text-[10px] font-mono mt-0.5 leading-snug"
            >
              <DateRange period={period} />
            </div>
          )}
        </>
      );
  }

  // Plain text-only styles for minimal header text color on minimal-text handled above.
  return (
    <div
      style={cellStyle}
      data-testid={testId}
      className="px-3 flex flex-col justify-center relative border-r"
    >
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section banner looks                                                 */
/* ------------------------------------------------------------------ */


/** Vertical (rotated 90°) section cap rendered to the LEFT of the section's rows. */
export function SectionSpine({
  styleId,
  accent,
  tokens,
  number,
  title,
  roundBottomLeft = 0,
}) {
  let wrap = { backgroundColor: accent, color: '#ffffff' };
  if (styleId === 'rotated-outline') {
    wrap = {
      backgroundColor: `${accent}22`,
      border: `2px solid ${accent}`,
      color: accent,
    };
  } else if (styleId === 'rotated-pill') {
    wrap = { backgroundColor: tokens.stickyAltBg, color: '#ffffff', padding: '6px 5px' };
  } else if (styleId === 'rotated-gradient') {
    wrap = {
      background: `linear-gradient(180deg, ${accent} 0%, ${accent}88 100%)`,
      color: '#ffffff',
    };
  } else if (styleId === 'rotated-frost') {
    wrap = {
      backgroundColor: `${accent}2e`,
      borderLeft: `3px solid ${accent}`,
      borderRight: `1px solid ${accent}`,
      boxShadow: `inset 0 0 14px ${accent}44`,
      color: tokens.textMain,
    };
  } else if (styleId === 'rotated-badge') {
    wrap = { backgroundColor: tokens.stickyAltBg, color: tokens.textMain };
  } else if (styleId === 'rotated-rail') {
    wrap = {
      backgroundColor: tokens.stickyAltBg,
      borderRight: `4px solid ${accent}`,
      color: tokens.textMain,
    };
  }

  const text = (
    <div className="flex-1 min-h-0 w-full flex items-center justify-center py-2 overflow-hidden">
      <span
        data-export-text="true"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          maxHeight: '100%',
          textAlign: 'center',
          ...NO_WORD_BREAK,
        }}
        className="text-[10px] font-extrabold uppercase tracking-wider leading-tight whitespace-normal overflow-hidden"
      >
        {number && styleId !== 'rotated-badge' ? `${number} · ` : ''}
        {nbHyphen(title)}
      </span>
    </div>
  );

  return (
    <div
      style={{
        width: SPINE_WIDTH,
        ...wrap,
        borderBottomLeftRadius: roundBottomLeft || undefined,
      }}
      className="shrink-0 sticky left-0 z-[46] flex select-none"
    >
      {styleId === 'rotated-pill' ? (
        <div
          style={{ backgroundColor: accent }}
          className="flex-1 rounded-full flex flex-col text-white"
        >
          {text}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center">
          {styleId === 'rotated-badge' && (
            <span
              data-export-text="true"
              style={{ backgroundColor: accent }}
              className={`mt-2 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shrink-0 ${
                number ? 'w-6 h-6' : 'w-2.5 h-2.5'
              }`}
            >
              {number || ''}
            </span>
          )}
          {text}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline bar visual                                                  */
/* ------------------------------------------------------------------ */

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
  const text = nbHyphen(label);
  const barStyle = getTimelineBarStyle(category, design, tokens.isLight, tokens);
  const wrapCls = density.singleLine
    ? 'truncate whitespace-nowrap'
    : 'whitespace-normal wrap-ok';
  const labelNode = (extra = '') => (
    <span
      data-export-text="true"
      style={{ fontSize: `${density.labelPx}px`, ...NO_WORD_BREAK }}
      className={`font-semibold tracking-tight leading-snug drop-shadow-sm ${wrapCls} ${extra}`}
    >
      {text}
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
        className={`w-full h-full px-2 flex flex-col justify-center ${
          isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
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
        className={`w-full h-full px-1 flex flex-col justify-center gap-1 ${
          isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
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
  } else if (
    itemStyle === 'beaded' ||
    itemStyle === 'label-rule' ||
    itemStyle === 'arrow-line'
  ) {
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
        className={`w-full h-full px-1 flex flex-col justify-center gap-1 ${
          isPopoverOpen ? 'ring-2 ring-indigo-400 rounded-lg' : ''
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
        className={`relative w-full h-full py-1 flex items-center justify-between gap-1.5 ${
          itemStyle === 'chevron'
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
    else if (fx.neon || fx.spotlight)
      clipFilter = `drop-shadow(0 0 8px ${category.color})`;
    else if (fx.shadows ?? true)
      clipFilter = `drop-shadow(0 6px 8px ${category.color}66)`;
  }

  return (
    <div className="relative w-full h-full" style={{ filter: clipFilter }}>
      {variant}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas-wide overlays for texture-style effects                       */
/* ------------------------------------------------------------------ */

export function CanvasOverlays({ effects = {}, tokens, radiusClass = 'rounded-3xl' }) {
  const layers = [];
  const base = `pointer-events-none absolute inset-0 z-[45] ${radiusClass}`;
  const flat = Boolean(effects.flat);

  if (effects.grain && !flat) {
    layers.push(
      <div
        key="grain"
        aria-hidden="true"
        className={`${base} opacity-[0.075]`}
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.6) 1px, transparent 0)',
          backgroundSize: '6px 6px',
          backgroundPosition: '0 0, 3px 3px',
        }}
      />
    );
  }
  if (effects['retro-scan']) {
    layers.push(
      <div
        key="scan"
        aria-hidden="true"
        className={`${base} opacity-[0.08]`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(56,189,248,0.45) 0px, rgba(56,189,248,0.45) 1px, transparent 1px, transparent 4px)',
        }}
      />
    );
  }
  if (effects.spotlight && !flat) {
    layers.push(
      <div
        key="spot"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(ellipse at 15% 0%, ${tokens.primary}44 0%, transparent 55%), radial-gradient(ellipse at 88% 100%, ${
            tokens.accents[1] || tokens.primary
          }33 0%, transparent 50%), radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,${
            tokens.isLight ? '0.12' : '0.3'
          }) 100%)`,
        }}
      />
    );
  }
  if (effects.watercolor && !flat) {
    layers.push(
      <div
        key="water"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(circle at 8% 18%, ${tokens.accents[0]}26 0%, transparent 38%), radial-gradient(circle at 92% 55%, ${tokens.accents[1]}26 0%, transparent 40%), radial-gradient(circle at 50% 100%, ${tokens.accents[2]}22 0%, transparent 42%)`,
        }}
      />
    );
  }
  if (effects.metallic && !flat) {
    layers.push(
      <div
        key="metal"
        aria-hidden="true"
        className={base}
        style={{
          background:
            'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.10) 28%, transparent 42%, rgba(255,255,255,0.07) 68%, transparent 100%)',
        }}
      />
    );
  }
  if (effects.sketch && !flat) {
    layers.push(
      <div
        key="sketch"
        aria-hidden="true"
        className={`${base} opacity-[0.07]`}
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${
            tokens.isLight ? '#0f172a' : '#f8fafc'
          } 0px, ${tokens.isLight ? '#0f172a' : '#f8fafc'} 1px, transparent 1px, transparent 26px)`,
        }}
      />
    );
  }
  if (effects['graph-paper'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="graph"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.1,
          backgroundImage: `linear-gradient(rgba(${ink},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${ink},1) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    );
  }
  if (effects['dot-grid'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="dots"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.16,
          backgroundImage: `radial-gradient(rgba(${ink},1) 1.2px, transparent 1.6px)`,
          backgroundSize: '18px 18px',
        }}
      />
    );
  }
  if (effects['diagonal-hatch'] && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="hatch"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(${ink},1) 0px, rgba(${ink},1) 1px, transparent 1px, transparent 10px)`,
        }}
      />
    );
  }
  if (effects.pinstripe && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="pin"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.07,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(${ink},1) 0px, rgba(${ink},1) 1px, transparent 1px, transparent 26px)`,
        }}
      />
    );
  }
  if (effects.checker && !flat) {
    const ink = tokens.isLight ? '15,23,42' : '248,250,252';
    layers.push(
      <div
        key="checker"
        aria-hidden="true"
        className={base}
        style={{
          opacity: 0.05,
          backgroundImage: `repeating-conic-gradient(rgba(${ink},1) 0% 25%, transparent 0% 50%)`,
          backgroundSize: '32px 32px',
        }}
      />
    );
  }
  if (effects['corner-glow'] && !flat) {
    const a = tokens.accents;
    layers.push(
      <div
        key="corners"
        aria-hidden="true"
        className={base}
        style={{
          background: `radial-gradient(circle at 0% 0%, ${a[0]}38 0%, transparent 38%), radial-gradient(circle at 100% 0%, ${a[1]}38 0%, transparent 38%), radial-gradient(circle at 0% 100%, ${a[2]}38 0%, transparent 38%), radial-gradient(circle at 100% 100%, ${a[3] || a[0]}38 0%, transparent 38%)`,
        }}
      />
    );
  }
  if (effects.stitched && !flat) {
    layers.push(
      <div
        key="stitch"
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 z-[100] rounded-[20px] border-2 border-dashed opacity-40"
        style={{ borderColor: tokens.textMain }}
      />
    );
  }
  return <>{layers}</>;
}
