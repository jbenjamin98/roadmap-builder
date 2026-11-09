import { Calendar, MapPin, Tag as TagIcon, User } from 'lucide-react';
import { DuckEggIcon, YellowDuckIcon } from './DuckParts';

export function RoadmapPinSlot({ logo, primaryColor, variant = 'brand-hero' }) {
  switch (variant) {
    case 'badge':
      return (
        <div
          className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
          style={{
            backgroundColor: `${primaryColor}18`,
            borderColor: `${primaryColor}44`,
          }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-9 max-w-9 object-contain" />
          ) : (
            <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'brand-hero':
      return (
        <div className="shrink-0 flex items-center">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="h-12 max-h-12 w-auto max-w-[140px] object-contain shrink-0 rounded-md"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: `${primaryColor}18`,
                borderColor: `${primaryColor}44`,
              }}
            >
              <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
          )}
        </div>
      );

    case 'logo-showcase':
      return (
        <div
          className="w-20 h-20 rounded-2xl border shadow-md flex items-center justify-center p-2.5 shrink-0 bg-white dark:bg-slate-900 overflow-hidden"
          style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}10` }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-14 max-w-[70px] object-contain" />
          ) : (
            <MapPin className="w-10 h-10" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'stacked-emblem':
      return (
        <div className="shrink-0 mb-1 flex justify-center">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="h-14 max-h-14 w-auto max-w-[180px] object-contain shrink-0 rounded-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center bg-white dark:bg-slate-900"
              style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}14` }}
            >
              <MapPin className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
          )}
        </div>
      );

    case 'media-banner':
      return (
        <div
          className="w-16 h-16 rounded-2xl border shadow-sm flex items-center justify-center p-2 shrink-0 bg-white/80 dark:bg-slate-900/80 overflow-hidden"
          style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}10` }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-12 max-w-[56px] object-contain" />
          ) : (
            <MapPin className="w-8 h-8" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'floating-crest':
      return (
        <div
          className="w-14 h-14 rounded-full border-2 shadow-md flex items-center justify-center p-2 shrink-0 bg-white dark:bg-slate-900 overflow-hidden"
          style={{
            borderColor: `${primaryColor}66`,
            backgroundColor: `${primaryColor}14`,
            boxShadow: `0 0 16px ${primaryColor}22`,
          }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-10 max-w-10 object-contain rounded-full" />
          ) : (
            <MapPin className="w-7 h-7" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'executive-billboard':
      return (
        <div
          className="w-20 h-20 rounded-2xl border shadow-md flex items-center justify-center p-2.5 shrink-0 bg-white dark:bg-slate-900 overflow-hidden"
          style={{
            borderColor: `${primaryColor}55`,
            backgroundColor: `${primaryColor}12`,
            boxShadow: `0 4px 14px ${primaryColor}15`,
          }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-15 max-w-[72px] object-contain" />
          ) : (
            <MapPin className="w-10 h-10" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'crest-minimal':
      return (
        <div className="shrink-0 mb-1 flex justify-center">
          {logo ? (
            <img
              src={logo}
              alt=""
              className="h-12 max-h-12 w-auto max-w-[140px] object-contain shrink-0 rounded-full"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full border shadow-sm flex items-center justify-center bg-white dark:bg-slate-900"
              style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}14` }}
            >
              <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
          )}
        </div>
      );

    case 'badge-strip':
      return (
        <div
          className="px-3 py-1.5 rounded-full border shadow-xs flex items-center gap-2 shrink-0 bg-white/70 dark:bg-slate-900/70"
          style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}10` }}
        >
          {logo ? (
            <img src={logo} alt="" className="h-6 max-h-6 w-auto max-w-[60px] object-contain" />
          ) : (
            <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'split-billboard':
      return (
        <div
          className="w-16 h-16 rounded-xl border shadow-sm flex items-center justify-center p-2 shrink-0 bg-white dark:bg-slate-900 overflow-hidden"
          style={{ borderColor: `${primaryColor}44`, backgroundColor: `${primaryColor}12` }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-12 max-w-[56px] object-contain" />
          ) : (
            <MapPin className="w-8 h-8" style={{ color: primaryColor }} />
          )}
        </div>
      );

    case 'duck-pond':
      return (
        <div
          className="w-16 h-16 rounded-2xl border-2 shadow-md flex items-center justify-center p-1.5 shrink-0 bg-amber-50 dark:bg-slate-900 overflow-hidden"
          style={{ borderColor: '#f59e0b', backgroundColor: '#fef3c733' }}
        >
          {logo ? (
            <img src={logo} alt="" className="max-h-12 max-w-[56px] object-contain" />
          ) : (
            <div className="relative flex items-center justify-center">
              <YellowDuckIcon size={36} wake />
              <div className="absolute -top-1 -right-1">
                <DuckEggIcon size={12} />
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

export function CadenceRow({
  config,
  banner,
  tokens,
  primaryColor,
  singularPeriod,
  center = false,
  isTerminal = false,
  hideLogo = false,
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${
        center ? 'justify-center' : ''
      }`}
    >
      {!hideLogo && banner?.logo ? (
        <img
          src={banner.logo}
          alt=""
          data-export-text="false"
          className="h-4 max-h-4 w-auto max-w-[72px] object-contain shrink-0 rounded-sm"
        />
      ) : null}

      <span
        data-export-text="true"
        style={{ color: isTerminal ? '#38bdf8' : tokens.isLight ? primaryColor : '#a5b4fc' }}
      >
        {isTerminal
          ? `[${config.totalPeriods} ${config.periodLabel} // ${config.weeksPerPeriod}W]`
          : `${config.totalPeriods} ${config.periodLabel} • ${config.weeksPerPeriod} ${
              Number(config.weeksPerPeriod) === 1 ? 'Week' : 'Weeks'
            } / ${singularPeriod}`}
      </span>

      {banner?.version && (
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
  );
}

export function DateRow({ periods, tokens, center = false, isTerminal = false }) {
  return (
    <div
      style={{ color: isTerminal ? '#94a3b8' : tokens.textSecondary }}
      className={`flex items-center gap-2 text-xs font-mono ${center ? 'justify-center' : ''}`}
    >
      <Calendar
        className="w-3.5 h-3.5"
        style={{ color: isTerminal ? '#38bdf8' : tokens.textMuted }}
      />
      <span data-export-text="true">
        {periods[0].startDate} — {periods[periods.length - 1].endDate}
      </span>
    </div>
  );
}

export function OwnerRow({ banner, tokens, primaryColor }) {
  if (!banner?.owner) return <span />;
  return (
    <span
      data-export-text="true"
      style={{ color: tokens.textSecondary }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-right"
    >
      <User className="w-3.5 h-3.5" style={{ color: primaryColor }} />
      {banner.owner}
    </span>
  );
}
