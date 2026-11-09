import { MapPin } from 'lucide-react';
import { YellowDuckIcon } from './DuckParts';

export function HeaderSwatch({
  visuals,
  styleId,
  config,
  banner,
  effectivePrimary,
  effectiveTextMain,
  hasSeparateLogo,
}) {
  const swatchCls = visuals.hasFrostedCard
    ? 'p-2.5 rounded-xl border backdrop-blur-md flex flex-row items-stretch justify-between gap-2 overflow-hidden select-none'
    : `${visuals.className} ${
        styleId === 'compact-bar' ? 'py-2 px-3' : 'py-2.5 px-3'
      } text-left select-none overflow-hidden`;

  return (
    <div className={swatchCls} style={visuals.style}>
      <div className={`space-y-1 min-w-0 flex-1 ${visuals.isCentered ? 'text-center' : ''}`}>
        {/* Centered logo for stacked-emblem in swatch */}
        {visuals.hasStackedEmblem && (
          <div className="flex justify-center mb-0.5">
            {banner.logo ? (
              <img
                src={banner.logo}
                alt=""
                className="h-4 max-h-4 w-auto max-w-[36px] object-contain"
              />
            ) : (
              <div
                className="w-4 h-4 rounded-sm border flex items-center justify-center"
                style={{
                  backgroundColor: `${effectivePrimary}18`,
                  borderColor: `${effectivePrimary}55`,
                }}
              >
                <MapPin className="w-2.5 h-2.5" style={{ color: effectivePrimary }} />
              </div>
            )}
          </div>
        )}

        {/* Centered logo for crest-minimal in swatch */}
        {visuals.hasCrestMinimal && (
          <div className="flex justify-center mb-0.5">
            {banner.logo ? (
              <img
                src={banner.logo}
                alt=""
                className="h-3.5 max-h-3.5 w-auto max-w-[32px] object-contain rounded-full"
              />
            ) : (
              <div
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center"
                style={{
                  backgroundColor: `${effectivePrimary}18`,
                  borderColor: `${effectivePrimary}55`,
                }}
              >
                <MapPin className="w-2 h-2" style={{ color: effectivePrimary }} />
              </div>
            )}
          </div>
        )}

        {/* Metadata / Cadence Line (guaranteed single line without wrapping) */}
        <div
          className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap flex-nowrap overflow-hidden ${
            visuals.isCentered ? 'justify-center' : ''
          }`}
        >
          {!hasSeparateLogo && banner.logo ? (
            <img
              src={banner.logo}
              alt=""
              className="h-2.5 max-h-2.5 w-auto max-w-[22px] object-contain shrink-0 rounded-xs"
            />
          ) : null}
          <span
            style={{ color: visuals.isTerminal ? '#38bdf8' : effectivePrimary }}
            className="whitespace-nowrap shrink-0"
          >
            {config.totalPeriods || 8} {config.periodLabel || 'Sprints'}
          </span>
          <span
            style={{
              backgroundColor: `${effectivePrimary}22`,
              color: effectivePrimary,
            }}
            className="px-1.5 py-0.2 rounded-full text-[8px] font-mono whitespace-nowrap shrink-0"
          >
            {banner.version || 'v1.0'}
          </span>
        </div>

        {/* Title Area with larger logo elements */}
        <div className={`flex items-center gap-2 ${visuals.isCentered ? 'justify-center' : ''}`}>
          {visuals.hasBrandHero && (
            <div className="shrink-0 flex items-center">
              {banner.logo ? (
                <img
                  src={banner.logo}
                  alt=""
                  className="h-5 max-h-5 w-auto max-w-[32px] object-contain rounded-xs"
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-md border flex items-center justify-center"
                  style={{
                    backgroundColor: `${effectivePrimary}18`,
                    borderColor: `${effectivePrimary}44`,
                  }}
                >
                  <MapPin className="w-3 h-3" style={{ color: effectivePrimary }} />
                </div>
              )}
            </div>
          )}

          {visuals.hasLogoShowcase && (
            <div
              className="w-6 h-6 rounded-md border shadow-xs flex items-center justify-center shrink-0 overflow-hidden bg-white dark:bg-slate-900"
              style={{ borderColor: `${effectivePrimary}55` }}
            >
              {banner.logo ? (
                <img src={banner.logo} alt="" className="max-h-4 max-w-4 object-contain" />
              ) : (
                <MapPin className="w-3.5 h-3.5" style={{ color: effectivePrimary }} />
              )}
            </div>
          )}

          {visuals.hasMediaBanner && (
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 overflow-hidden bg-white/70 dark:bg-slate-900/70"
                style={{ borderColor: `${effectivePrimary}55` }}
              >
                {banner.logo ? (
                  <img src={banner.logo} alt="" className="max-h-3.5 max-w-3.5 object-contain" />
                ) : (
                  <MapPin className="w-3 h-3" style={{ color: effectivePrimary }} />
                )}
              </div>
              <div
                className="w-px h-3.5 shrink-0"
                style={{ backgroundColor: `${effectivePrimary}44` }}
              />
            </div>
          )}

          {visuals.hasFloatingCrest && (
            <div
              className="w-5 h-5 rounded-full border shadow-xs flex items-center justify-center shrink-0 overflow-hidden bg-white dark:bg-slate-900"
              style={{
                borderColor: `${effectivePrimary}66`,
                backgroundColor: `${effectivePrimary}18`,
              }}
            >
              {banner.logo ? (
                <img
                  src={banner.logo}
                  alt=""
                  className="max-h-3.5 max-w-3.5 object-contain rounded-full"
                />
              ) : (
                <MapPin className="w-3 h-3" style={{ color: effectivePrimary }} />
              )}
            </div>
          )}

          {visuals.hasExecutiveBillboard && (
            <div
              className="w-6 h-6 rounded-md border shadow-xs flex items-center justify-center shrink-0 overflow-hidden bg-white dark:bg-slate-900"
              style={{
                borderColor: `${effectivePrimary}66`,
                backgroundColor: `${effectivePrimary}14`,
              }}
            >
              {banner.logo ? (
                <img src={banner.logo} alt="" className="max-h-4 max-w-4 object-contain" />
              ) : (
                <MapPin className="w-3.5 h-3.5" style={{ color: effectivePrimary }} />
              )}
            </div>
          )}

          {visuals.hasBadgeStrip && (
            <div
              className="px-1.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 shrink-0 bg-white/70 dark:bg-slate-900/70"
              style={{
                borderColor: `${effectivePrimary}55`,
                backgroundColor: `${effectivePrimary}14`,
              }}
            >
              {banner.logo ? (
                <img src={banner.logo} alt="" className="max-h-2.5 max-w-4 object-contain" />
              ) : (
                <MapPin className="w-2.5 h-2.5" style={{ color: effectivePrimary }} />
              )}
            </div>
          )}

          {visuals.hasSplitBillboard && (
            <div
              className="w-5 h-5 rounded-md border shadow-2xs flex items-center justify-center shrink-0 overflow-hidden bg-white dark:bg-slate-900"
              style={{
                borderColor: `${effectivePrimary}55`,
                backgroundColor: `${effectivePrimary}18`,
              }}
            >
              {banner.logo ? (
                <img src={banner.logo} alt="" className="max-h-3.5 max-w-3.5 object-contain" />
              ) : (
                <MapPin className="w-3 h-3" style={{ color: effectivePrimary }} />
              )}
            </div>
          )}

          {visuals.hasDuckPond && (
            <div
              className="w-5 h-5 rounded-md border shadow-2xs flex items-center justify-center shrink-0 overflow-hidden bg-amber-50 dark:bg-slate-900"
              style={{ borderColor: '#f59e0b', backgroundColor: '#fef3c744' }}
            >
              {banner.logo ? (
                <img src={banner.logo} alt="" className="max-h-3.5 max-w-3.5 object-contain" />
              ) : (
                <YellowDuckIcon size={14} />
              )}
            </div>
          )}

          {visuals.hasTitlePill ? (
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: `${effectivePrimary}18`,
                borderColor: `${effectivePrimary}44`,
              }}
            >
              <span
                style={{ color: effectiveTextMain }}
                className="text-xs font-bold truncate max-w-[120px]"
              >
                {config.name || 'Roadmap'}
              </span>
            </div>
          ) : (
            <div
              className={`truncate ${visuals.hasTitleUnderline ? 'border-b pb-0.5' : ''}`}
              style={{
                color: effectiveTextMain,
                borderBottomColor: effectivePrimary,
              }}
            >
              <span className="text-xs font-extrabold truncate">
                {visuals.isTerminal ? `> ${config.name || 'Roadmap'}` : config.name || 'Roadmap'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Swatch right indicator */}
      <div className="flex flex-col items-end justify-center shrink-0">
        <div
          className="w-8 h-1.5 rounded-full"
          style={{ backgroundColor: `${effectivePrimary}55` }}
        />
      </div>
    </div>
  );
}
