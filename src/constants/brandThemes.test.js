import { describe, expect, it } from 'vitest';
import {
  APPIAN_PERIOD_STYLES,
  APPIAN_PRESETS,
  APPIAN_SECTION_STYLES,
  APPIAN_STYLE_IDS,
  getAppianDesign,
  getBrandAccent,
  getDuckModeDesign,
  getLockedTabs,
  isAppianTheme,
} from './brandThemes';
import { PRESET_THEMES } from './themePresets';
import {
  getDefaultDesign,
  getExitBrandDesign,
  getRandomDesignConfig,
  normalizeDesign,
} from './designOptions';
import { getAccessibleInk, getCanvasTokens, getTimelineBarStyle } from '../components/canvasStyles';
import { getSectionVisuals } from '../components/styleHelpers';

describe('Appian presets', () => {
  it('registers light, dark and slate brand presets hidden from the galleries', () => {
    const ids = PRESET_THEMES.filter((t) => t.isBrand).map((t) => t.id);
    expect(ids).toEqual(['appian-light', 'appian-dark', 'appian-slate']);
    expect(APPIAN_PRESETS.map((p) => p.isLight)).toEqual([true, false, false]);
    expect(APPIAN_PRESETS.map((p) => p.tokenOverrides.brand.logo)).toEqual([
      'blue',
      'white',
      'white',
    ]);
  });

  it('uses the approved brand colors', () => {
    const [light, dark, slate] = APPIAN_PRESETS;
    expect(light.primary).toBe('#2322F0');
    expect(light.secondary).toBe('#FFFFFF');
    expect(dark.secondary).toBe('#020A51');
    // Slate mode: 50% standard slate, 25% cyan, 5% Cloud Mist highlight.
    expect(slate.secondary).toBe('#2F3A52');
    expect(slate.primary).toBe('#2AE3FF');
    expect(slate.tokenOverrides.brand.milestone.color).toBe('#E5EDF6');
  });

  it('node tags only use primary palette colors', () => {
    const primary = ['#2322F0', '#020A51', '#FFFFFF'];
    for (const p of APPIAN_PRESETS) expect(primary).toContain(p.tokenOverrides.brand.tag);
  });

  it('getCanvasTokens applies the brand text, surface and brand tokens', () => {
    const light = getCanvasTokens({ themeId: 'appian-light' });
    const dark = getCanvasTokens({ themeId: 'appian-dark' });
    const slate = getCanvasTokens({ themeId: 'appian-slate' });
    expect(light.isLight).toBe(true);
    expect(light.textMain).toBe('#020A51');
    expect(dark.isLight).toBe(false);
    expect(dark.textMain).toBe('#FFFFFF');
    expect(dark.stickyBg).toBe('#020A51');
    expect(slate.surfaceBg).toBe('#2F3A52');
    expect(slate.brand.accent).toBe('#2AE3FF');
  });
});

describe('getAppianDesign', () => {
  const prev = {
    ...getDefaultDesign(),
    legendPosition: 'bottom',
    condensedModes: ['compact-rows'],
    dateFormat: 'yyyy-MM-dd',
    banner: { subtitle: 'Goals', owner: 'Team', version: 'v1', logo: 'data:logo' },
  };

  it('sets every locked field for light, dark and slate', () => {
    for (const mode of /** @type {const} */ (['light', 'dark', 'slate'])) {
      const d = getAppianDesign(prev, mode);
      expect(d.brandTheme).toBe(`appian-${mode}`);
      expect(d.duckMode).toBe(false);
      for (const [key, id] of Object.entries(APPIAN_STYLE_IDS)) expect(d[key]).toBe(id);
      expect(d.taskStyle).toBe('appian-rule');
      expect(d.canvasCorners).toBe('subtle');
      expect(Object.values(d.effects).every((v) => v === false)).toBe(true);
      expect(d.milestone.shape).toBe('appian-flag');
    }
    expect(getAppianDesign(prev, 'light').milestone.color).toBe('#2322F0');
    expect(getAppianDesign(prev, 'dark').milestone.color).toBe('#2AE3FF');
    expect(getAppianDesign(prev, 'slate').milestone).toMatchObject({
      color: '#E5EDF6',
      borderColor: '#2F3A52',
    });
  });

  it('keeps the editable settings (legend, condensed, dates, header details)', () => {
    const d = getAppianDesign(prev, 'light');
    expect(d.legendPosition).toBe('bottom');
    expect(d.condensedModes).toEqual(['compact-rows']);
    expect(d.dateFormat).toBe('yyyy-MM-dd');
    expect(d.banner.owner).toBe('Team'); // kept, just hidden while the theme is active
    expect(d.banner.logo).toBe('data:logo');
  });

  it('getExitBrandDesign leaves no Appian ids behind', () => {
    for (const mode of /** @type {const} */ (['dark', 'slate'])) {
      const exited = getExitBrandDesign(getAppianDesign(prev, mode));
      const defaults = getDefaultDesign();
      expect(exited.brandTheme).toBe('');
      for (const key of Object.keys(APPIAN_STYLE_IDS)) expect(exited[key]).toBe(defaults[key]);
      expect(exited.milestone).toEqual(defaults.milestone);
      expect(exited.canvasCorners).toBe(defaults.canvasCorners);
      expect(exited.effects.gradients).toBe(true);
      expect(exited.legendPosition).toBe('bottom');
      expect(JSON.stringify(exited)).not.toMatch(/appian-/);
    }
  });

  it('is mutually exclusive with Duck Mode', () => {
    const duck = getDuckModeDesign(getAppianDesign(prev, 'light'));
    expect(duck.duckMode).toBe(true);
    expect(duck.brandTheme).toBe('');
    expect(getAppianDesign(duck, 'dark').duckMode).toBe(false);
    expect(normalizeDesign({ duckMode: true, brandTheme: 'appian-dark' }).duckMode).toBe(false);
  });
});

describe('normalizeDesign brandTheme', () => {
  it('drops unknown values and keeps valid ones', () => {
    expect(normalizeDesign({ brandTheme: 'nope' }).brandTheme).toBe('');
    expect(normalizeDesign({}).brandTheme).toBe('');
    expect(normalizeDesign({ brandTheme: 'appian-light' }).brandTheme).toBe('appian-light');
    expect(normalizeDesign({ brandTheme: 'appian-slate' }).brandTheme).toBe('appian-slate');
    expect(isAppianTheme('appian-dark')).toBe(true);
    expect(isAppianTheme('aurora-glass')).toBe(false);
  });

  it('migrates roadmaps saved with the earlier brand style ids', () => {
    const d = normalizeDesign({
      brandTheme: 'appian-dark',
      taskStyle: 'appian-tick',
      milestone: { shape: 'appian-node', color: '#2AE3FF' },
    });
    expect(d.taskStyle).toBe('appian-rule');
    expect(d.milestone.shape).toBe('appian-flag');
    expect(d.milestone.borderColor).toBe('#020A51');
  });
});

describe('getLockedTabs', () => {
  it('locks nothing without a brand mode', () => {
    expect(getLockedTabs(getDefaultDesign()).size).toBe(0);
  });

  it('keeps the requested Appian tabs editable', () => {
    const locked = getLockedTabs(getAppianDesign(getDefaultDesign(), 'light'));
    for (const t of ['timeline', 'banner', 'themes', 'legend', 'condensed', 'grid', 'numbering']) {
      expect(locked.has(t)).toBe(false);
    }
    for (const t of [
      'fonts',
      'effects',
      'header',
      'period',
      'section',
      'subsection',
      'task',
      'bars',
      'milestones',
    ]) {
      expect(locked.has(t)).toBe(true);
    }
  });

  it('keeps the Duck Mode lock list unchanged', () => {
    const locked = getLockedTabs(getDuckModeDesign(getDefaultDesign()));
    expect([...locked].sort()).toEqual(
      [
        'fonts',
        'effects',
        'header',
        'period',
        'section',
        'subsection',
        'task',
        'numbering',
        'bars',
        'milestones',
        'legend',
        'condensed',
        'grid',
      ].sort()
    );
  });
});

describe('brand rendering helpers', () => {
  it('never offers a brand theme to Surprise Me', () => {
    for (let i = 0; i < 80; i++) {
      expect(isAppianTheme(getRandomDesignConfig().themeId)).toBe(false);
    }
  });

  it('getBrandAccent follows the mode', () => {
    expect(getBrandAccent('appian-light')).toBe('#2322F0');
    expect(getBrandAccent('appian-dark')).toBe('#2AE3FF');
    expect(getBrandAccent('appian-slate')).toBe('#2AE3FF');
    expect(getBrandAccent('')).toBeUndefined();
  });

  it('appian-bar has a 5px radius, no shadow, and an accessible label color', () => {
    const design = getAppianDesign(getDefaultDesign(), 'light');
    const dark = getTimelineBarStyle({ color: '#2322F0' }, design, true, {});
    expect(dark.borderRadius).toBe('5px');
    expect(dark.boxShadow).toBe('none');
    expect(dark.color).toBe('#FFFFFF');
    expect(getTimelineBarStyle({ color: '#2AE3FF' }, design, true, {}).color).toBe('#020A51');
    expect(getAccessibleInk('#FCB858')).toBe('#020A51');
  });

  it('appian-solid section uses the theme band color with its light title', () => {
    const tk = (id) => getCanvasTokens({ themeId: id });
    const light = getSectionVisuals('appian-solid', '#2322F0', tk('appian-light'), true);
    const dark = getSectionVisuals('appian-solid', '#2AE3FF', tk('appian-dark'), true);
    const slate = getSectionVisuals('appian-solid', '#2AE3FF', tk('appian-slate'), true);
    expect(light.leftCell.backgroundColor).toBe('#020A51');
    expect(dark.leftCell.backgroundColor).toBe('#2322F0');
    expect(slate.leftCell.backgroundColor).toBe('#5B7499'); // Standard Slate third tone, not cyan
    for (const v of [light, dark, slate]) expect(v.titleColor).toBe('#FFFFFF');
  });

  it('appian-rail and appian-underline keep the row neutral with an accent', () => {
    const tokens = getCanvasTokens({ themeId: 'appian-light' });
    const rail = getSectionVisuals('appian-rail', '#2322F0', tokens, true);
    const underline = getSectionVisuals('appian-underline', '#2322F0', tokens, true);
    expect(rail.leftCell.borderLeft).toContain('#2322F0');
    expect(rail.titleColor).toBe('#020A51');
    expect(underline.leftCell.boxShadow).toContain('#2322F0');
    expect(underline.bannerBg).toContain('#2322F0');
  });
});

describe('brand layout options', () => {
  const prev = getDefaultDesign();

  it('offers three section and five period layouts', () => {
    expect(APPIAN_SECTION_STYLES.map((o) => o.id)).toEqual([
      'appian-rail',
      'appian-underline',
      'appian-solid',
    ]);
    expect(APPIAN_PERIOD_STYLES).toHaveLength(5);
  });

  it('keeps a chosen layout across theme switches and exits cleanly', () => {
    const picked = { ...prev, sectionStyle: 'appian-solid', periodHeaderStyle: 'appian-chip' };
    const dark = getAppianDesign(picked, 'dark');
    expect(dark.sectionStyle).toBe('appian-solid');
    expect(dark.periodHeaderStyle).toBe('appian-chip');
    const slate = getAppianDesign(dark, 'slate');
    expect(slate.periodHeaderStyle).toBe('appian-chip');
    const exited = getExitBrandDesign(slate);
    expect(exited.sectionStyle).toBe(prev.sectionStyle);
    expect(exited.periodHeaderStyle).toBe(prev.periodHeaderStyle);
  });

  it('falls back to the defaults for ids that are not brand layouts (e.g. old appian-band)', () => {
    const d = normalizeDesign({
      brandTheme: 'appian-light',
      sectionStyle: 'appian-band',
      periodHeaderStyle: 'pill-badge',
    });
    expect(d.sectionStyle).toBe('appian-rail');
    expect(d.periodHeaderStyle).toBe('appian-index');
  });
});
