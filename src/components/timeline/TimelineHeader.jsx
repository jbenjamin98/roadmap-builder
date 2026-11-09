import { Calendar, Sparkles, User, Tag as TagIcon } from 'lucide-react';
import { NO_WORD_BREAK } from '../styleHelpers';
import LegendBar from './LegendBar';

export default function TimelineHeader({
  config,
  banner = {},
  tokens,
  primaryColor,
  singularPeriod,
  periods,
  legend,
  design,
  legendPosition,
}) {
  const showRight = Boolean(banner.owner) || legendPosition === 'top';

  return (
    <div
      className="px-6 py-5 border-b flex flex-row items-stretch justify-between gap-4"
      style={{
        background: tokens.headerGradient,
        borderColor: tokens.gridBorder,
      }}
    >
      <div className="space-y-1 self-center">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
          <span
            data-export-text="true"
            style={{ color: tokens.isLight ? primaryColor : '#a5b4fc' }}
          >
            {config.totalPeriods} {config.periodLabel} • {config.weeksPerPeriod}{' '}
            {Number(config.weeksPerPeriod) === 1 ? 'Week' : 'Weeks'} / {singularPeriod}
          </span>
          {banner.version && (
            <span
              data-export-text="true"
              style={{
                backgroundColor: `${primaryColor}22`,
                color: primaryColor,
                borderColor: `${primaryColor}55`,
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono"
            >
              <TagIcon className="w-2.5 h-2.5" />
              {banner.version}
            </span>
          )}
        </div>

        <h1
          data-export-text="true"
          style={{ color: tokens.textMain, ...NO_WORD_BREAK }}
          className="text-2xl font-extrabold tracking-tight leading-snug"
        >
          {config.name}
        </h1>
        {banner.subtitle && (
          <p
            data-export-text="true"
            style={{ color: tokens.textSecondary, ...NO_WORD_BREAK }}
            className="text-xs font-medium leading-snug"
          >
            {banner.subtitle}
          </p>
        )}

        {periods.length > 0 && (
          <div
            style={{ color: tokens.textSecondary }}
            className="flex items-center gap-2 text-xs font-mono"
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: tokens.textMuted }} />
            <span data-export-text="true">
              {periods[0].startDate} — {periods[periods.length - 1].endDate}
            </span>
          </div>
        )}
      </div>

      {showRight && (
        <div className="flex flex-col items-end justify-between gap-3">
          {banner.owner ? (
            <span
              data-export-text="true"
              style={{ color: tokens.textSecondary }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-right"
            >
              <User className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {banner.owner}
            </span>
          ) : (
            <span />
          )}
          {legendPosition === 'top' && (
            <LegendBar legend={legend} design={design} tokens={tokens} />
          )}
        </div>
      )}
    </div>
  );
}
