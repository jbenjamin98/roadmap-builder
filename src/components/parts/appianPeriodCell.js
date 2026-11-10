// Wrapper-cell style for the Appian period header. The tab sits flush on the top-left of the
// cell, so the cell drops its padding; there is deliberately no line across the top.
export function getAppianPeriodCellStyle(styleId) {
  return styleId === 'appian-tab' ? { paddingTop: 0, paddingLeft: 0, paddingRight: 0 } : {};
}
