import { describe, expect, it } from 'vitest';
import {
  APPIAN_PRESETS,
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
  isRotatedSectionStyle,
  normalizeDesign,
} from './designOptions';
import { getAccessibleInk, getCanvasTokens, getTimelineBarStyle } from '../components/canvasStyles';
import { getAppianPeriodCellStyle } from '../components/parts/appianPeriodCell';

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
      expect(d.taskStyle).toBe('appian-plain');
      expect(d.canvasCorners).toBe('subtle');
      expect(Object.values(d.effects).every((v) => v === false)).toBe(true);
      expect(d.milestone.shape).toBe('appian-flag');
    }
    expect(getAppianDesign(prev, 'light').milestone).toMatchObject({
      color: '#2322F0',
      borderColor: '#FFFFFF',
    });
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
    expect(d.taskStyle).toBe('appian-plain');
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
    for (const t of [
      'timeline',
      'banner',
      'themes',
      'legend',
      'condensed',
      'grid',
      'numbering',
      'milestones',
    ]) {
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

  it('every Appian theme has an opaque sub-section band and a hairline', () => {
    for (const id of ['appian-light', 'appian-dark', 'appian-slate']) {
      const t = getCanvasTokens({ themeId: id });
      expect(t.subHeaderBg).toMatch(/^#[0-9A-Fa-f]{6}$/); // opaque, so sticky cells can reuse it
      expect(t.subHeaderBg).not.toBe(t.stickyBg);
      expect(t.brand.subRowBorder).toBeTruthy();
    }
  });
});

describe('Appian single layouts', () => {
  const prev = getDefaultDesign();

  it('uses one approved layout per area', () => {
    for (const mode of /** @type {const} */ (['light', 'dark', 'slate'])) {
      const d = getAppianDesign(prev, mode);
      expect(d.sectionStyle).toBe('appian-spine');
      expect(d.periodHeaderStyle).toBe('appian-tab');
      expect(d.taskStyle).toBe('appian-plain');
    }
    expect(isRotatedSectionStyle('appian-spine')).toBe(true); // renders as a vertical spine
  });

  it('the tab period header has no top border', () => {
    expect(getAppianPeriodCellStyle('appian-tab')).toEqual({
      paddingTop: 0,
      paddingLeft: 0,
      paddingRight: 0,
    });
  });

  it('the spine uses the theme band colors (Slate uses the Standard Slate third tone)', () => {
    const tk = (id) => getCanvasTokens({ themeId: id }).brand;
    expect(tk('appian-light')).toMatchObject({ band: '#020A51', bandText: '#FFFFFF' });
    expect(tk('appian-dark')).toMatchObject({ band: '#2322F0', bandText: '#FFFFFF' });
    expect(tk('appian-slate')).toMatchObject({ band: '#5B7499', bandText: '#FFFFFF' });
  });

  it('migrates every earlier layout id to the single layouts', () => {
    const d = normalizeDesign({
      brandTheme: 'appian-light',
      sectionStyle: 'appian-rail',
      periodHeaderStyle: 'appian-index',
      taskStyle: 'appian-rule', // earlier id
    });
    expect(d.sectionStyle).toBe('appian-spine');
    expect(d.periodHeaderStyle).toBe('appian-tab');
    expect(d.taskStyle).toBe('appian-plain');
  });
});

describe('Appian milestone shapes', () => {
  const prev = getDefaultDesign();

  it('starts with the brand flag when entering from a non-brand theme', () => {
    expect(getAppianDesign(prev, 'dark').milestone.shape).toBe('appian-flag');
    expect(
      getAppianDesign({ ...prev, duckMode: true, milestone: { shape: 'duck-egg' } }, 'light')
        .milestone.shape
    ).toBe('appian-flag');
  });

  it('keeps the chosen shape between Appian themes but always uses the theme colors', () => {
    const dark = getAppianDesign(prev, 'dark');
    const picked = {
      ...dark,
      milestone: { ...dark.milestone, shape: 'map-pin', color: '#ff0000' },
    };
    const slate = getAppianDesign(picked, 'slate');
    expect(slate.milestone.shape).toBe('map-pin');
    expect(slate.milestone.color).toBe('#E5EDF6'); // colors stay brand-locked
    expect(slate.milestone.borderColor).toBe('#2F3A52');
  });

  it('normalizeDesign preserves the picked shape and migrates the retired ones', () => {
    expect(
      normalizeDesign({ brandTheme: 'appian-dark', milestone: { shape: 'push-pin' } }).milestone
        .shape
    ).toBe('push-pin');
    for (const old of ['appian-diamond', 'appian-node']) {
      expect(
        normalizeDesign({ brandTheme: 'appian-dark', milestone: { shape: old } }).milestone.shape
      ).toBe('appian-flag');
    }
  });

  it('unlocks the Milestones tab in Appian themes (and still locks it in Duck Mode)', () => {
    expect(getLockedTabs(getAppianDesign(prev, 'light')).has('milestones')).toBe(false);
    expect(getLockedTabs(getDuckModeDesign(prev)).has('milestones')).toBe(true);
  });

  it('Owner / Team is no longer treated as a brand field', () => {
    const d = getAppianDesign(
      { ...prev, banner: { owner: 'Platform Team', subtitle: '', version: '' } },
      'dark'
    );
    expect(d.banner.owner).toBe('Platform Team');
  });
});
