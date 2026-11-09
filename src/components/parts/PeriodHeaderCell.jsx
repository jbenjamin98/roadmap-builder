import { PeriodHeaderBody } from './periodHeaderStyles';

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

  return (
    <div
      style={cellStyle}
      data-testid={testId}
      className="px-3 flex flex-col justify-center relative border-r"
    >
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
    </div>
  );
}
