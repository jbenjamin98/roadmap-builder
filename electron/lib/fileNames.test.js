import { describe, expect, it } from 'vitest';
import { isInside, isSafeId, sanitizeFileBase, uniqueFileName } from './fileNames';

describe('sanitizeFileBase', () => {
  it('strips characters that are illegal in file names', () => {
    expect(sanitizeFileBase('Q3: Plan/2026?')).toBe('Q3 Plan 2026');
  });
  it('falls back for empty, dotted and reserved names', () => {
    expect(sanitizeFileBase('')).toBe('roadmap');
    expect(sanitizeFileBase('...')).toBe('roadmap');
    expect(sanitizeFileBase('CON')).toBe('roadmap');
  });
  it('does not allow path traversal to survive', () => {
    expect(sanitizeFileBase('../../etc/passwd')).not.toContain('/');
    expect(sanitizeFileBase('..\\..\\x')).not.toContain('\\');
  });
});

describe('uniqueFileName', () => {
  it('appends a counter when the name is taken (case-insensitive)', () => {
    const taken = new Set(['plan.roadmap.json', 'plan (2).roadmap.json']);
    expect(uniqueFileName('Plan', taken)).toBe('Plan (3).roadmap.json');
    expect(uniqueFileName('Other', taken)).toBe('Other.roadmap.json');
  });
});

describe('isInside / isSafeId', () => {
  it('accepts children and rejects escapes', () => {
    expect(isInside('/lib', '/lib/a.roadmap.json')).toBe(true);
    expect(isInside('/lib', '/lib/../etc/x')).toBe(false);
    expect(isInside('/lib', '/libx/a')).toBe(false);
  });
  it('only accepts simple ids', () => {
    expect(isSafeId('rm-abc_123')).toBe(true);
    expect(isSafeId('../x')).toBe(false);
    expect(isSafeId('')).toBe(false);
  });
});
