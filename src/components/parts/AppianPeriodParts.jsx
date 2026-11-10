// Period header for the Appian themes (Appian Brand Guidelines, Sept 2026): an accent code tab
// with a 45 degree cut sitting flush on top of the cell, then the Medium title and Light dates.
import { DateRange } from './periodHeaderStyles';
import { getAccessibleInk } from '../canvasStyles';

/** Period header content (style id `appian-tab`). */
export function AppianPeriodBody({ period, tokens, showDates }) {
  const accent = tokens.brand?.accent || tokens.primary;
  return (
    <div className="flex flex-col items-start gap-1.5 w-full">
      <span
        data-export-text="true"
        style={{
          background: accent,
          color: getAccessibleInk(accent),
          letterSpacing: '0.25em',
          fontWeight: 600,
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)',
        }}
        className="inline-block pl-3 pr-4 pt-1 pb-2 text-[10px] uppercase leading-none"
      >
        {period.code}
      </span>
      <div className="flex flex-col gap-0.5 px-3 pb-0.5">
        <span
          data-export-text="true"
          style={{ color: tokens.textMain, fontWeight: 500 }}
          className="text-[13px] leading-tight whitespace-nowrap"
        >
          {period.title}
        </span>
        {showDates && (
          <span
            data-export-text="true"
            style={{ color: tokens.textMuted, fontWeight: 300 }}
            className="text-[10px] leading-snug"
          >
            <DateRange period={period} />
          </span>
        )}
      </div>
    </div>
  );
}
