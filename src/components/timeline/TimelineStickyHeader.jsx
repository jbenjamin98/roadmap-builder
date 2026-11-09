import { PeriodHeaderCell } from '../StyleParts';

export default function TimelineStickyHeader({
  leftW,
  periods,
  colWidth,
  todayVisible,
  todayInfo,
  singularPeriod,
  periodHeaderStyle,
  accents,
  primaryColor,
  tokens,
  density,
  design,
  subtleGridDemarcations,
}) {
  return (
    <div
      data-sticky-header="true"
      style={{
        backgroundColor: tokens.stickyBg,
        borderColor: subtleGridDemarcations ? tokens.gridBorder : 'transparent',
      }}
      className="flex items-stretch sticky top-0 z-[60] border-b shadow-sm"
    >
      <div
        style={{
          width: `${leftW}px`,
          backgroundColor: tokens.stickyBg,
          borderColor: subtleGridDemarcations ? tokens.gridBorder : 'transparent',
        }}
        className="shrink-0 sticky left-0 z-50 border-r"
      />

      <div className="flex flex-col relative" style={{ width: `${periods.length * colWidth}px` }}>
        {/* Strip above the period headers so the flag never covers a header */}
        {todayVisible && (
          <div className="relative h-5 shrink-0" style={{ backgroundColor: tokens.stickyBg }}>
            <span
              data-export-text="true"
              style={{
                left: `${todayInfo.periodIndex * colWidth}px`,
              }}
              className="pointer-events-none absolute top-0.5 -translate-x-full -ml-1 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white shadow-md whitespace-nowrap"
            >
              This {singularPeriod}
            </span>
          </div>
        )}

        <div className="flex items-stretch">
          {periods.map((period, idx) => (
            <PeriodHeaderCell
              key={period.index}
              styleId={periodHeaderStyle}
              period={period}
              accent={accents[idx % accents.length] || primaryColor}
              tokens={tokens}
              density={density}
              isAltCol={design.alternateColumnShading && period.index % 2 === 0}
              subtleGrid={subtleGridDemarcations}
              width={`${colWidth}px`}
              testId={`period-header-${period.index}`}
            />
          ))}
        </div>

        {/* Dotted line continues from the flag down through the header */}
        {todayVisible && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-0 border-l-2 border-dashed border-rose-500/85"
            style={{ left: `${todayInfo.periodIndex * colWidth}px` }}
          />
        )}
      </div>
    </div>
  );
}
