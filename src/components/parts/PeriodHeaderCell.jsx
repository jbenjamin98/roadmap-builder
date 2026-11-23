import { PeriodHeaderBody } from './periodHeaderStyles';
import { AppianPeriodBody } from './AppianPeriodParts';
import { getAppianPeriodCellStyle } from './appianPeriodCell';

export { DateRange } from './periodHeaderStyles';

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
  onSelect,
  selected = false,
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
  const isBrand = String(styleId).startsWith('appian-');
  if (isBrand) Object.assign(cellStyle, getAppianPeriodCellStyle(styleId, tokens));

  const interactive = typeof onSelect === 'function';

  return (
    <div
      style={cellStyle}
      data-testid={testId}
      {...(interactive && {
        role: 'button',
        tabIndex: 0,
        title: 'Click to rename or change the length of this period',
        'aria-haspopup': 'dialog',
        'aria-expanded': selected,
        onClick: (e) => onSelect(e.currentTarget),
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(e.currentTarget);
          }
        },
      })}
      className={`px-3 flex flex-col justify-center relative border-r ${
        interactive
          ? 'cursor-pointer hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400'
          : ''
      }`}
    >
      {period.isCustomLength && (
        <span
          data-testid={`period-weeks-badge-${period.index}`}
          data-export-text="true"
          className="absolute right-1 top-1 rounded-full bg-black/25 px-1.5 text-[9px] font-bold leading-4 text-white"
        >
          {period.weeks}w
        </span>
      )}
      {isBrand ? (
        <AppianPeriodBody period={period} tokens={tokens} showDates={showDates} />
      ) : (
        <PeriodHeaderBody
          styleId={styleId}
          period={period}
          accent={accent}
          tokens={tokens}
          showDates={showDates}
          textMain={textMain}
          muted={muted}
          title={title}
        />
      )}
    </div>
  );
}
