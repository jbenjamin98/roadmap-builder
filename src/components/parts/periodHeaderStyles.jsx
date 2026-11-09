import { differenceInCalendarDays, format } from 'date-fns';

export function DateRange({ period, prefix = '', suffix = '' }) {
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

export function PeriodHeaderBody({
  styleId,
  period,
  accent,
  tokens,
  showDates,
  textMain,
  muted,
  title,
}) {
  switch (styleId) {
    case 'pill-badge':
      return (
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
    case 'block-fill':
      return (
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
    case 'underline-tabs':
      return (
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
    case 'two-tier':
      return (
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
    case 'minimal-text':
      return (
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
    case 'top-ribbon':
      return (
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
    case 'card-inset':
      return (
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
    case 'bracket-frame':
      return (
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
    case 'timeline-rule':
      return (
        <>
          {title('text-xs font-bold')}
          {showDates && (
            <div className="mt-1.5">
              <div className="flex items-center">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <span className="h-0.5 flex-1" style={{ backgroundColor: `${accent}66` }} />
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
    case 'date-first':
      return (
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
    case 'range-chips':
      return (
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
    case 'calendar-leaf':
      return showDates ? (
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
    case 'split-cell':
      return (
        <div
          className="flex items-stretch rounded-md overflow-hidden border"
          style={{ borderColor: `${accent}55` }}
        >
          <div className="px-2 py-1 flex items-center" style={{ backgroundColor: accent }}>
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
    case 'rule-sandwich':
      return (
        <>
          {title('text-xs font-bold')}
          <div className="my-1 h-0.5 w-full rounded" style={{ backgroundColor: accent }} />
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
    case 'week-dots': {
      const weeks = Math.max(
        1,
        Math.round((differenceInCalendarDays(period.rawEnd, period.rawStart) + 1) / 7)
      );
      return (
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
    }
    case 'ticket-stub':
      return (
        <div className="flex items-stretch gap-2">
          <div className="flex items-center min-w-0">{title('text-xs font-extrabold')}</div>
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
    case 'month-strip':
      return (
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
    case 'accent-bar':
    default:
      return (
        <>
          <div className="h-1 w-10 rounded-full mb-1.5" style={{ backgroundColor: accent }} />
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
}
