import { describe, expect, it } from 'vitest';
import { getDefaultDesign, normalizeDesign, applyEffectToggle, getDensity } from './designOptions';

describe('normalizeDesign', () => {
  it('returns defaults for empty input', () => {
    expect(normalizeDesign(null)).toMatchObject({ dateFormat: 'MM/dd/yyyy' });
  });

  it('merges partial input over defaults', () => {
    const d = normalizeDesign({ numbering: { tasks: true } });
    expect(d.numbering.tasks).toBe(true);
    expect(d.numbering.sections).toBe(false);
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
