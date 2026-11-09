// Wrapper-cell style (padding/borders) for the Appian period header layouts.
const accentOf = (tokens) => tokens.brand?.accent || tokens.primary;

/** Extra inline style for the period cell wrapper (padding/borders) per layout. */
export function getAppianPeriodCellStyle(styleId, tokens) {
  const accent = accentOf(tokens);
  switch (styleId) {
    case 'appian-eyebrow':
      return { borderBottom: `2px solid ${accent}` };
    case 'appian-tab':
      return { paddingTop: 0, paddingLeft: 0, paddingRight: 0, borderTop: `2px solid ${accent}` };
    default:
      return {};
  }
}
