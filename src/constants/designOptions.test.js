import { describe, expect, it } from 'vitest';
import {
  CANVAS_CORNER_STYLES,
  CANVAS_HEADER_STYLES,
  DUCK_THEME_PALETTE,
  LOGO_HEADER_STYLES,
  MILESTONE_SHAPES,
  SECTION_STYLES,
  SPINE_SECTION_STYLES,
  STANDARD_HEADER_STYLES,
  STANDARD_SECTION_STYLES,
  applyEffectToggle,
  getCanvasCornerVisuals,
  getDefaultDesign,
  getDensity,
  getDuckModeDesign,
  getRandomDesignConfig,
  normalizeDesign,
} from './designOptions';

describe('CANVAS_CORNER_STYLES', () => {
  it('provides 5 corner styles with valid attributes', () => {
    expect(CANVAS_CORNER_STYLES).toHaveLength(5);
    for (const style of CANVAS_CORNER_STYLES) {
      expect(style.id).toBeTypeOf('string');
      expect(style.name).toBeTypeOf('string');
      expect(style.desc).toBeTypeOf('string');
      expect(style.radius).toBeTypeOf('number');
      expect(style.twClass).toBeTypeOf('string');
      expect(style.bottomTwClass).toBeTypeOf('string');
    }
  });

  it('getCanvasCornerVisuals returns matching visuals or curved default', () => {
    expect(getCanvasCornerVisuals('sharp').radius).toBe(0);
    expect(getCanvasCornerVisuals('pill').radius).toBe(32);
    expect(getCanvasCornerVisuals('unknown-id').radius).toBe(24);
  });
});

describe('CANVAS_HEADER_STYLES', () => {
  it('provides 24 distinct header options with id, name, and desc', () => {
    expect(CANVAS_HEADER_STYLES).toHaveLength(24);
    const ids = new Set();
    for (const style of CANVAS_HEADER_STYLES) {
      expect(style.id).toBeTypeOf('string');
      expect(style.name).toBeTypeOf('string');
      expect(style.desc).toBeTypeOf('string');
      expect(ids.has(style.id)).toBe(false);
      ids.add(style.id);
    }
    expect(ids.has('outline-card')).toBe(true);
    expect(ids.has('badge-spotlight')).toBe(false);
    expect(ids.has('brand-hero')).toBe(true);
    expect(ids.has('logo-showcase')).toBe(true);
    expect(ids.has('stacked-emblem')).toBe(true);
    expect(ids.has('media-banner')).toBe(true);
    expect(ids.has('floating-crest')).toBe(true);
    expect(ids.has('executive-billboard')).toBe(true);
    expect(ids.has('crest-minimal')).toBe(true);
    expect(ids.has('badge-strip')).toBe(true);
    expect(ids.has('split-billboard')).toBe(true);
  });

  it('splits headers into multiples of 3 for standard and logo sub-sections', () => {
    expect(STANDARD_HEADER_STYLES).toHaveLength(15);
    expect(STANDARD_HEADER_STYLES.length % 3).toBe(0);
    const standardIds = new Set(STANDARD_HEADER_STYLES.map((s) => s.id));
    expect(standardIds.has('outline-card')).toBe(true);
    expect(standardIds.has('badge-spotlight')).toBe(false);

    expect(LOGO_HEADER_STYLES).toHaveLength(9);
    expect(LOGO_HEADER_STYLES.length % 3).toBe(0);

    const logoIds = new Set(LOGO_HEADER_STYLES.map((s) => s.id));
    expect(logoIds.has('brand-hero')).toBe(true);
    expect(logoIds.has('logo-showcase')).toBe(true);
    expect(logoIds.has('stacked-emblem')).toBe(true);
    expect(logoIds.has('media-banner')).toBe(true);
    expect(logoIds.has('floating-crest')).toBe(true);
    expect(logoIds.has('executive-billboard')).toBe(true);
    expect(logoIds.has('crest-minimal')).toBe(true);
    expect(logoIds.has('badge-strip')).toBe(true);
    expect(logoIds.has('split-billboard')).toBe(true);
  });
});

describe('SECTION_STYLES', () => {
  it('provides 21 section styles split into multiples of 3 for standard and spines', () => {
    expect(SECTION_STYLES).toHaveLength(21);
    expect(STANDARD_SECTION_STYLES).toHaveLength(12);
    expect(STANDARD_SECTION_STYLES.length % 3).toBe(0);
    expect(SPINE_SECTION_STYLES).toHaveLength(9);
    expect(SPINE_SECTION_STYLES.length % 3).toBe(0);

    const standardIds = new Set(STANDARD_SECTION_STYLES.map((s) => s.id));
    expect(standardIds.has('accent-badge')).toBe(true);

    const spineIds = new Set(SPINE_SECTION_STYLES.map((s) => s.id));
    expect(spineIds.has('rotated-accent-notch')).toBe(true);
    expect(spineIds.has('rotated-minimal')).toBe(true);
  });
});

describe('Duck Mode and Randomizer', () => {
  it('groups milestone shapes: flags together, pins together, ducks together', () => {
    const ids = MILESTONE_SHAPES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(15);
    const at = (id) => ids.indexOf(id);
    expect(Math.abs(at('flag') - at('appian-flag'))).toBe(1);
    expect(Math.abs(at('map-pin') - at('push-pin'))).toBe(1);
    expect(Math.abs(at('duck-egg') - at('yellow-duck'))).toBe(1);
    // flags -> pins -> ducks, in that order
    expect(Math.max(at('flag'), at('appian-flag'))).toBeLessThan(
      Math.min(at('map-pin'), at('push-pin'))
    );
    expect(Math.max(at('map-pin'), at('push-pin'))).toBeLessThan(
      Math.min(at('duck-egg'), at('yellow-duck'))
    );
  });

  it('provides duck-egg and yellow-duck in MILESTONE_SHAPES', () => {
    const ids = MILESTONE_SHAPES.map((s) => s.id);
    expect(ids).toContain('duck-egg');
    expect(ids).toContain('yellow-duck');
  });

  it('provides valid DUCK_THEME_PALETTE and getDuckModeDesign', () => {
    expect(DUCK_THEME_PALETTE.primary).toBe('#eab308');
    expect(DUCK_THEME_PALETTE.accents).toHaveLength(4);

    const duckDesign = getDuckModeDesign({ headerStyle: 'solid-band' });
    expect(duckDesign.duckMode).toBe(true);
    expect(duckDesign.headerStyle).toBe('duck-pond');
    expect(duckDesign.sectionStyle).toBe('rotated-badge');
    expect(duckDesign.canvasCorners).toBe('pill');
    expect(duckDesign.milestone.shape).toBe('duck-egg');
  });

  it('getRandomDesignConfig produces complete randomized configuration', () => {
    const config = getRandomDesignConfig();
    expect(config.themeId).toBeTypeOf('string');
    expect(config.fontStyle).toBeTypeOf('string');
    expect(config.headerStyle).toBeTypeOf('string');
    expect(config.periodHeaderStyle).toBeTypeOf('string');
    expect(config.sectionStyle).toBeTypeOf('string');
    expect(config.subSectionStyle).toBeTypeOf('string');
    expect(config.taskStyle).toBeTypeOf('string');
    expect(config.itemStyle).toBeTypeOf('string');
    expect(config.canvasCorners).toBeTypeOf('string');
    expect(config.numberingStyle).toBeTypeOf('string');
    expect(config.milestoneShape).toBeTypeOf('string');
  });
});

describe('normalizeDesign', () => {
  it('returns defaults for empty input', () => {
    expect(normalizeDesign(null)).toMatchObject({
      dateFormat: 'MM/dd/yyyy',
      headerStyle: 'gradient-banner',
      canvasCorners: 'curved',
      banner: { subtitle: '', owner: '', version: '', logo: '' },
    });
  });

  it('merges partial input over defaults', () => {
    const d = normalizeDesign({
      numbering: { tasks: true },
      headerStyle: 'terminal-dark',
      canvasCorners: 'sharp',
      banner: { logo: 'data:image/png;base64,abc' },
    });
    expect(d.numbering.tasks).toBe(true);
    expect(d.numbering.sections).toBe(false);
    expect(d.headerStyle).toBe('terminal-dark');
    expect(d.canvasCorners).toBe('sharp');
    expect(d.banner.logo).toBe('data:image/png;base64,abc');
  });

  it('flat disables every other effect', () => {
    const d = normalizeDesign({ effects: { flat: true, glass: true } });
    expect(d.effects.glass).toBe(false);
    expect(d.effects.flat).toBe(true);
  });
});

describe('applyEffectToggle', () => {
  it('sets the requested effect', () => {
    const next = applyEffectToggle(getDefaultDesign().effects, 'glass', true);
    expect(next.glass).toBe(true);
  });
});

describe('getDensity', () => {
  it('returns a density object for no condensed modes', () => {
    expect(getDensity({ condensedModes: [] })).toBeTypeOf('object');
  });
});
