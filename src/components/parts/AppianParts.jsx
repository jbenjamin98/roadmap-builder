// Appian brand visuals (Appian Brand Guidelines, Sept 2026). Shared by the real canvas,
// the live preview and the theme cards, so they always match.
import LegendBar from '../timeline/LegendBar';
import { OwnerRow } from './CanvasHeaderParts';
import { NO_WORD_BREAK } from '../styleHelpers';
import { APPIAN_COLORS } from '../../constants/brandThemes';
import logoBlue from '../../assets/brand/appian-logo-blue.png';
import logoWhite from '../../assets/brand/appian-logo-white.png';

/**
 * The node, traced from the "i" dot of the Appian logo (53 x 80 units): a flat top, a short
 * vertical right edge, then a 45 degree diagonal down to the bottom-left. Never rotated or mirrored.
 * Used sparingly: the header node tag and sub-section markers only.
 */
const NODE_PATH = 'M0 0H53V27L0 80Z';
const NODE_RATIO = 53 / 80;

/** Brand tokens with a light-mode fallback (the theme presets always provide them). */
const brandOf = (tokens) =>
  tokens?.brand || {
    accent: APPIAN_COLORS.blue,
    tag: APPIAN_COLORS.blue,
    logo: 'blue',
  };

export function AppianNode({ height = 24, color, title, className = '' }) {
  return (
    <svg
      viewBox="0 0 53 80"
      height={height}
      width={height * NODE_RATIO}
      aria-hidden={title ? undefined : true}
      className={`shrink-0 ${className}`}
    >
      {title ? <title>{title}</title> : null}
      <path d={NODE_PATH} fill={color} />
    </svg>
  );
}

/**
 * Node tag (p. 53): top-left of the layout, inset a little from the left edge and hanging from
 * the top edge, in a primary color, never heavier than the logo.
 */
export function AppianNodeTag({ color, height = 40, inset = 20 }) {
  return (
    <div
      data-testid="appian-node-tag"
      data-export-text="false"
      className="absolute top-0 pointer-events-none"
      style={{ left: inset, lineHeight: 0 }}
    >
      <AppianNode height={height} color={color} title="Appian node" />
    </div>
  );
}

/** The Appian logo, used as supplied (never recolored or distorted). */
export function AppianLogo({ variant = 'blue', height = 32 }) {
  return (
    <img
      src={variant === 'white' ? logoWhite : logoBlue}
      alt="Appian"
      data-export-text="false"
      data-testid="appian-logo"
      style={{ height, width: 'auto' }}
      className="shrink-0 object-contain select-none"
      draggable={false}
    />
  );
}

/** 2px Appian blue to cyan line-work at 45 degrees. */
export function AppianLineWork({ className = '' }) {
  return (
    <div
      data-export-text="false"
      aria-hidden="true"
      className={`absolute left-0 right-0 bottom-0 ${className}`}
      style={{
        height: 2,
        background: `linear-gradient(45deg, ${APPIAN_COLORS.blue} 0%, ${APPIAN_COLORS.cyan} 100%)`,
      }}
    />
  );
}

/** Canvas header for the Appian themes (style id `appian-brand`). */
export function AppianHeader({
  config = {},
  banner = {},
  tokens,
  singularPeriod,
  periods = [],
  legend,
  design,
  legendPosition = 'top',
  compact = false,
}) {
  const brand = brandOf(tokens);
  const weeks = Number(config.weeksPerPeriod);
  const showLegend = legendPosition === 'top';

  return (
    <div
      data-testid="appian-header"
      className="relative border-b flex flex-row items-stretch justify-between gap-6"
      style={{
        background: tokens.headerGradient,
        borderColor: tokens.gridBorder,
        paddingLeft: compact ? 52 : 76,
        paddingRight: compact ? 16 : 28,
        paddingTop: compact ? 14 : 22,
        paddingBottom: compact ? 16 : 26,
      }}
    >
      <AppianNodeTag color={brand.tag} height={compact ? 30 : 40} inset={compact ? 14 : 20} />

      <div className="min-w-0 self-center space-y-1.5">
        <div
          className="flex flex-wrap items-center gap-2 text-[11px] uppercase"
          style={{ letterSpacing: '0.25em', fontWeight: 600 }}
        >
          <span data-export-text="true" style={{ color: brand.accent }}>
            {`${config.totalPeriods} ${config.periodLabel} • ${weeks} ${
              weeks === 1 ? 'Week' : 'Weeks'
            } / ${singularPeriod}`}
          </span>
          {banner.version && (
            <span
              data-export-text="true"
              style={{ color: brand.accent, borderColor: `${brand.accent}88` }}
              className="inline-flex items-center px-2 py-0.5 rounded-[5px] border text-[10px] tracking-wider normal-case"
            >
              {banner.version}
            </span>
          )}
        </div>
        <h1
          data-export-text="true"
          style={{
            color: tokens.textMain,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            ...NO_WORD_BREAK,
          }}
          className={compact ? 'text-xl' : 'text-[28px]'}
        >
          {config.name}
        </h1>
        {banner.subtitle && (
          <p
            data-export-text="true"
            style={{ color: tokens.textSecondary, fontWeight: 300, ...NO_WORD_BREAK }}
            className="text-sm leading-snug"
          >
            {banner.subtitle}
          </p>
        )}
        {periods.length > 0 && (
          <div
            data-export-text="true"
            style={{ color: tokens.textMuted, fontWeight: 300 }}
            className="text-xs"
          >
            {periods[0].startDate} — {periods[periods.length - 1].endDate}
          </div>
        )}
      </div>

      <div className="flex flex-col items-end justify-between gap-3 shrink-0">
        <AppianLogo variant={brand.logo} height={compact ? 24 : 32} />
        <div className="flex flex-col items-end gap-2">
          <OwnerRow banner={banner} tokens={tokens} primaryColor={brand.accent} />
          {showLegend && <LegendBar legend={legend} design={design} tokens={tokens} />}
        </div>
      </div>

      <AppianLineWork />
    </div>
  );
}
