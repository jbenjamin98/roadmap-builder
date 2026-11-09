// Period header layouts for the Appian themes (Appian Brand Guidelines, Sept 2026).
// Every layout uses Funnel Sans weights from the type hierarchy (Light dates, Medium titles,
// tracked SemiBold eyebrows) and the theme's accent color. Option ids live in brandThemes.js.
import { DateRange } from './periodHeaderStyles';
import { getAccessibleInk } from '../canvasStyles';
import { APPIAN_COLORS } from '../../constants/brandThemes';

const accentOf = (tokens) => tokens.brand?.accent || tokens.primary;

const Title = ({ period, tokens }) => (
  <span
    data-export-text="true"
    style={{ color: tokens.textMain, fontWeight: 500 }}
    className="text-[13px] leading-tight whitespace-nowrap"
  >
    {period.title}
  </span>
);

const Dates = ({ period, tokens }) => (
  <span
    data-export-text="true"
    style={{ color: tokens.textMuted, fontWeight: 300 }}
    className="text-[10px] leading-snug"
  >
    <DateRange period={period} />
  </span>
);

/** Large light numeral beside the title and dates. */
function Index({ period, tokens, showDates }) {
  const accent = accentOf(tokens);
  return (
    <div className="flex items-center gap-3">
      <span
        data-export-text="true"
        style={{ color: accent, fontWeight: 300 }}
        className="text-[30px] leading-none tabular-nums"
      >
        {String(period.index).padStart(2, '0')}
      </span>
      <div
        className="flex flex-col gap-0.5 min-w-0 pl-2.5"
        style={{ borderLeft: `1px solid ${tokens.gridBorder}` }}
      >
        <Title period={period} tokens={tokens} />
        {showDates && <Dates period={period} tokens={tokens} />}
      </div>
    </div>
  );
}

/** Accent tab with the 45 degree cut sitting flush on top of the cell. */
function Tab({ period, tokens, showDates }) {
  const accent = accentOf(tokens);
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
        <Title period={period} tokens={tokens} />
        {showDates && <Dates period={period} tokens={tokens} />}
      </div>
    </div>
  );
}

/** Title over a start-to-end rule with end ticks and the dates at each end. */
function Span({ period, tokens, showDates }) {
  const accent = accentOf(tokens);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Title period={period} tokens={tokens} />
      <div className="flex items-center" style={{ height: 10 }} aria-hidden="true">
        <span style={{ width: 2, height: 10, background: accent }} />
        <span
          className="flex-1"
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${APPIAN_COLORS.blue}, ${APPIAN_COLORS.cyan})`,
          }}
        />
        <span style={{ width: 2, height: 10, background: APPIAN_COLORS.cyan }} />
      </div>
      {showDates && (
        <span
          data-export-text="true"
          style={{ color: tokens.textMuted, fontWeight: 300 }}
          className="flex justify-between gap-2 text-[10px] leading-none whitespace-nowrap"
        >
          <span>{period.startDate}</span>
          <span>{period.endDate}</span>
        </span>
      )}
    </div>
  );
}

/** Code chip with 5px corners beside the title. */
function Chip({ period, tokens, showDates }) {
  const accent = accentOf(tokens);
  return (
    <div className="flex items-center gap-2.5">
      <span
        data-export-text="true"
        style={{
          background: accent,
          color: getAccessibleInk(accent),
          borderRadius: 5,
          fontWeight: 600,
          letterSpacing: '0.12em',
        }}
        className="px-2 py-1.5 text-[11px] leading-none"
      >
        {period.code}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <Title period={period} tokens={tokens} />
        {showDates && <Dates period={period} tokens={tokens} />}
      </div>
    </div>
  );
}

/** Tracked code, Medium title, Light dates (the cell adds a 2px rule beneath). */
function Eyebrow({ period, tokens, showDates }) {
  return (
    <div className="flex flex-col min-w-0 gap-0.5">
      <span
        data-export-text="true"
        style={{ color: accentOf(tokens), letterSpacing: '0.25em', fontWeight: 600 }}
        className="text-[10px] uppercase leading-none whitespace-nowrap"
      >
        {period.code}
      </span>
      <Title period={period} tokens={tokens} />
      {showDates && <Dates period={period} tokens={tokens} />}
    </div>
  );
}

const LAYOUTS = {
  'appian-index': Index,
  'appian-tab': Tab,
  'appian-span': Span,
  'appian-chip': Chip,
  'appian-eyebrow': Eyebrow,
};

/** Period header content for any Appian period layout (falls back to the default layout). */
export function AppianPeriodBody({ styleId, period, tokens, showDates }) {
  const Layout = LAYOUTS[styleId] || Index;
  return <Layout period={period} tokens={tokens} showDates={showDates} />;
}
