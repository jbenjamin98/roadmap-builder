import { PRESET_THEMES } from '../../constants/themes';
import {
  DUCK_THEME_PALETTE,
  getAppianDesign,
  getDuckModeDesign,
  getExitBrandDesign,
  getLockedTabs,
} from '../../constants/designOptions';

const BRAND_FONT = 'funnel';
const DEFAULT_FONT = 'sans';

/**
 * Brand-mode actions (Ultimate Duck Mode and the Appian themes) for the settings modal.
 * A plain factory (not a hook) so ConfigModal can call it after its early return.
 */
export function createBrandModes({
  design,
  fontStyle,
  setDesign,
  setFontStyle,
  setThemeId,
  setCustomTheme,
}) {
  const leaveBrandFont = () => {
    if (fontStyle === BRAND_FONT) setFontStyle(DEFAULT_FONT);
  };

  /** Leaves the Appian theme: brand styles revert to defaults and the font returns to Inter. */
  const exitBrandMode = (nextThemeId = PRESET_THEMES[0].id) => {
    setDesign((prev) => getExitBrandDesign(prev));
    leaveBrandFont();
    setThemeId(nextThemeId);
  };

  const selectAppian = (mode) => {
    setThemeId(`appian-${mode}`);
    setFontStyle(BRAND_FONT);
    setDesign((prev) => getAppianDesign(prev, mode));
  };

  /** Picking any other canvas theme exits the Appian theme first. */
  const selectTheme = (id) => {
    if (design?.brandTheme && id !== design.brandTheme) {
      setDesign((prev) => getExitBrandDesign(prev));
      leaveBrandFont();
    }
    setThemeId(id);
  };

  const handleToggleDuckMode = () => {
    if (design?.duckMode) {
      setDesign((prev) => ({
        ...prev,
        duckMode: false,
        headerStyle: 'gradient-banner',
      }));
      return;
    }
    if (design?.brandTheme) leaveBrandFont();
    setThemeId('custom');
    setCustomTheme(DUCK_THEME_PALETTE);
    setDesign((prev) => getDuckModeDesign(prev.brandTheme ? getExitBrandDesign(prev) : prev));
  };

  return {
    lockedTabs: getLockedTabs(design),
    exitBrandMode,
    selectAppian,
    selectTheme,
    handleToggleDuckMode,
  };
}
