import { Tag as TagIcon } from 'lucide-react';
import { getHeaderContainerVisuals, NO_WORD_BREAK } from './canvasHeaderStyles';
import { CadenceRow, DateRow, OwnerRow, RoadmapPinSlot } from './CanvasHeaderParts';
import { HeaderSwatch } from './HeaderSwatch';
import LegendBar from '../timeline/LegendBar';
import { AppianHeader } from './AppianParts';

export function CanvasHeaderVisual({
  styleId = 'gradient-banner',
  config = {},
  banner = {},
  tokens,
  primaryColor,
  singularPeriod,
  periods = [],
  legend,
  design,
  legendPosition = 'top',
  isSwatch = false,
}) {
  // Brand themes use their own locked header (node tag, logo, line-work).
  if (styleId === 'appian-brand') {
    return (
      <AppianHeader
        config={config}
        banner={banner}
        tokens={tokens}
        singularPeriod={singularPeriod}
        periods={periods}
        legend={legend}
        design={design}
        legendPosition={legendPosition}
        compact={isSwatch}
      />
    );
  }
  const visuals = getHeaderContainerVisuals(styleId, tokens, primaryColor);
  const showRight = Boolean(banner.owner) || legendPosition === 'top';
  const effectivePrimary = visuals.isTerminal ? '#38bdf8' : primaryColor;
  const effectiveTextMain = visuals.isTerminal ? '#f8fafc' : tokens.textMain;
  const effectiveTextSecondary = visuals.isTerminal ? '#94a3b8' : tokens.textSecondary;
  const hasSeparateLogo =
    visuals.hasBrandHero ||
    visuals.hasLogoShowcase ||
    visuals.hasStackedEmblem ||
    visuals.hasMediaBanner ||
    visuals.hasFloatingCrest ||
    visuals.hasExecutiveBillboard ||
    visuals.hasCrestMinimal ||
    visuals.hasBadgeStrip ||
    visuals.hasSplitBillboard ||
    visuals.hasDuckPond;

  // Swatch mode: delegated to HeaderSwatch
  if (isSwatch) {
    return (
      <HeaderSwatch
        visuals={visuals}
        styleId={styleId}
        config={config}
        banner={banner}
        effectivePrimary={effectivePrimary}
        effectiveTextMain={effectiveTextMain}
        hasSeparateLogo={hasSeparateLogo}
      />
    );
  }

  // Two-tone layout variation
  if (visuals.isTwoTone) {
    return (
      <div className={`${visuals.className} border-b`} style={{ borderColor: tokens.gridBorder }}>
        <div
          className="px-6 py-5 flex-1 flex flex-col justify-center space-y-1"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}18 0%, ${primaryColor}08 100%)`,
            borderRight: `1px solid ${tokens.gridBorder}`,
          }}
        >
          <CadenceRow
            config={config}
            banner={banner}
            tokens={tokens}
            primaryColor={primaryColor}
            singularPeriod={singularPeriod}
          />
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
          {periods.length > 0 && <DateRow periods={periods} tokens={tokens} />}
        </div>

        {showRight && (
          <div
            className="px-6 py-5 flex flex-col items-end justify-between gap-3 shrink-0"
            style={{ background: tokens.headerGradient }}
          >
            <OwnerRow banner={banner} tokens={tokens} primaryColor={primaryColor} />
            {legendPosition === 'top' && (
              <LegendBar legend={legend} design={design} tokens={tokens} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Hero-centered & Stacked-emblem layout variation
  if (visuals.isCentered) {
    return (
      <div className={visuals.className} style={visuals.style}>
        {visuals.hasStackedEmblem && (
          <RoadmapPinSlot logo={banner.logo} primaryColor={primaryColor} variant="stacked-emblem" />
        )}

        {visuals.hasCrestMinimal && (
          <RoadmapPinSlot logo={banner.logo} primaryColor={primaryColor} variant="crest-minimal" />
        )}

        <CadenceRow
          config={config}
          banner={banner}
          tokens={tokens}
          primaryColor={primaryColor}
          singularPeriod={singularPeriod}
          center
          hideLogo={hasSeparateLogo}
        />

        <div className="max-w-2xl space-y-1">
          <h1
            data-export-text="true"
            style={{ color: effectiveTextMain, ...NO_WORD_BREAK }}
            className="text-3xl font-extrabold tracking-tight leading-tight"
          >
            {config.name}
          </h1>
          {banner.subtitle && (
            <p
              data-export-text="true"
              style={{ color: effectiveTextSecondary, ...NO_WORD_BREAK }}
              className="text-sm font-medium leading-snug"
            >
              {banner.subtitle}
            </p>
          )}
        </div>

        {periods.length > 0 && <DateRow periods={periods} tokens={tokens} center />}

        {showRight && (
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <OwnerRow banner={banner} tokens={tokens} primaryColor={primaryColor} />
            {legendPosition === 'top' && (
              <LegendBar legend={legend} design={design} tokens={tokens} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Compact bar layout variation
  if (visuals.isCompact) {
    return (
      <div className={visuals.className} style={visuals.style}>
        <div className="flex items-center gap-3 flex-wrap">
          {banner.logo && (
            <img
              src={banner.logo}
              alt=""
              data-export-text="false"
              className="h-4 max-h-4 w-auto max-w-[72px] object-contain shrink-0 rounded-sm"
            />
          )}
          <h1
            data-export-text="true"
            style={{ color: tokens.textMain, ...NO_WORD_BREAK }}
            className="text-base font-extrabold tracking-tight"
          >
            {config.name}
          </h1>
          <span className="text-slate-400 text-xs">•</span>
          <span
            data-export-text="true"
            style={{ color: tokens.isLight ? primaryColor : '#a5b4fc' }}
            className="text-xs font-semibold"
          >
            {config.totalPeriods} {config.periodLabel}
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

        {showRight && (
          <div className="flex items-center gap-4 flex-wrap">
            <OwnerRow banner={banner} tokens={tokens} primaryColor={primaryColor} />
            {legendPosition === 'top' && (
              <LegendBar legend={legend} design={design} tokens={tokens} />
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard flexible layout used by most styles
  return (
    <div className={visuals.className} style={visuals.style}>
      <div
        className={`space-y-1 self-center ${
          visuals.hasSplitDivider ? 'border-r pr-6 border-slate-300 dark:border-slate-700/60' : ''
        }`}
      >
        <CadenceRow
          config={config}
          banner={banner}
          tokens={tokens}
          primaryColor={effectivePrimary}
          singularPeriod={singularPeriod}
          isTerminal={visuals.isTerminal}
          hideLogo={hasSeparateLogo}
        />

        <div className="flex items-center gap-3.5 sm:gap-4">
          {visuals.hasBrandHero && (
            <RoadmapPinSlot logo={banner.logo} primaryColor={primaryColor} variant="brand-hero" />
          )}

          {visuals.hasLogoShowcase && (
            <RoadmapPinSlot
              logo={banner.logo}
              primaryColor={primaryColor}
              variant="logo-showcase"
            />
          )}

          {visuals.hasMediaBanner && (
            <div className="flex items-center gap-3.5 shrink-0">
              <RoadmapPinSlot
                logo={banner.logo}
                primaryColor={primaryColor}
                variant="media-banner"
              />
              <div
                className="w-px h-10 self-center shrink-0 hidden sm:block"
                style={{ backgroundColor: `${primaryColor}44` }}
              />
            </div>
          )}

          {visuals.hasFloatingCrest && (
            <RoadmapPinSlot
              logo={banner.logo}
              primaryColor={primaryColor}
              variant="floating-crest"
            />
          )}

          {visuals.hasExecutiveBillboard && (
            <RoadmapPinSlot
              logo={banner.logo}
              primaryColor={primaryColor}
              variant="executive-billboard"
            />
          )}

          {visuals.hasBadgeStrip && (
            <RoadmapPinSlot logo={banner.logo} primaryColor={primaryColor} variant="badge-strip" />
          )}

          {visuals.hasSplitBillboard && (
            <RoadmapPinSlot
              logo={banner.logo}
              primaryColor={primaryColor}
              variant="split-billboard"
            />
          )}

          {visuals.hasDuckPond && (
            <RoadmapPinSlot logo={banner.logo} primaryColor={primaryColor} variant="duck-pond" />
          )}

          <div className="space-y-1">
            {visuals.hasTitlePill ? (
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-2xl border shadow-sm"
                style={{
                  backgroundColor: `${primaryColor}18`,
                  borderColor: `${primaryColor}44`,
                }}
              >
                <h1
                  data-export-text="true"
                  style={{ color: effectiveTextMain, ...NO_WORD_BREAK }}
                  className="text-xl font-extrabold tracking-tight"
                >
                  {config.name}
                </h1>
              </div>
            ) : (
              <h1
                data-export-text="true"
                style={{
                  color: effectiveTextMain,
                  ...NO_WORD_BREAK,
                  ...(visuals.hasTitleUnderline
                    ? {
                        borderBottom: `2.5px solid ${primaryColor}`,
                        paddingBottom: '2px',
                        display: 'inline-block',
                      }
                    : {}),
                }}
                className={`text-2xl font-extrabold tracking-tight leading-snug ${
                  visuals.isBrutalist ? 'uppercase tracking-wide font-black' : ''
                }`}
              >
                {visuals.isTerminal ? `> ${config.name}` : config.name}
              </h1>
            )}

            {banner.subtitle && (
              <p
                data-export-text="true"
                style={{ color: effectiveTextSecondary, ...NO_WORD_BREAK }}
                className="text-xs font-medium leading-snug"
              >
                {banner.subtitle}
              </p>
            )}
          </div>
        </div>

        {periods.length > 0 && (
          <DateRow periods={periods} tokens={tokens} isTerminal={visuals.isTerminal} />
        )}
      </div>

      {showRight && (
        <div className="flex flex-col items-end justify-between gap-3">
          <OwnerRow banner={banner} tokens={tokens} primaryColor={effectivePrimary} />
          {legendPosition === 'top' && (
            <LegendBar legend={legend} design={design} tokens={tokens} />
          )}
        </div>
      )}
    </div>
  );
}
