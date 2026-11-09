import { CanvasHeaderVisual } from '../StyleParts';

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
  return (
    <CanvasHeaderVisual
      styleId={design?.headerStyle || 'gradient-banner'}
      config={config}
      banner={banner}
      tokens={tokens}
      primaryColor={primaryColor}
      singularPeriod={singularPeriod}
      periods={periods}
      legend={legend}
      design={design}
      legendPosition={legendPosition}
    />
  );
}
