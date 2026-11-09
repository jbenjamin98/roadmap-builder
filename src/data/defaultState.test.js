import { describe, expect, it } from 'vitest';
import { createBlankRoadmapState, normalizeRoadmapState } from './defaultState';
import { validateRoadmapImport } from './roadmapSchema';

describe('createBlankRoadmapState', () => {
  it('produces a consistent minimal document', () => {
    const s = createBlankRoadmapState({ name: 'Plan' });
    expect(s.config.name).toBe('Plan');
    expect(s.sections[0].subSections[0].id).toBe(s.tasks[0].subSectionId);
    expect(s.legend.length).toBeGreaterThan(0);
  });
});

describe('normalizeRoadmapState', () => {
  it('returns the sample for non-objects', () => {
    expect(normalizeRoadmapState(null).sections.length).toBeGreaterThan(0);
  });

  it('keeps ids and fills defaults', () => {
    const s = normalizeRoadmapState({
      id: 'rm-1',
      sections: [{ id: 'a', subSections: [{ id: 'b' }] }],
      tasks: [{ id: 't', subSectionId: 'b' }],
      timelineItems: [{ id: 'i', taskId: 't', startPeriod: 0, duration: -3 }],
    });
    expect(s.id).toBe('rm-1');
    expect(s.config.design).toBeDefined();
    expect(s.timelineItems[0]).toMatchObject({
      type: 'bar',
      startPeriod: 1,
      duration: 1,
      hasEndMilestone: false,
    });
    expect(s.timelineItems[0].legendId).toBe(s.legend[0].id);
  });

  it('generates a new id when forceNewId is set', () => {
    const s = normalizeRoadmapState({ id: 'rm-1', sections: [] }, { forceNewId: true });
    expect(s.id).not.toBe('rm-1');
  });

  it('falls back to default accents unless 4+ are provided', () => {
    const s = normalizeRoadmapState({ config: { theme: { accents: ['#fff'] } } });
    expect(s.config.theme.accents).toHaveLength(4);
  });
});

describe('validateRoadmapImport', () => {
  it('accepts documents with config or sections', () => {
    expect(validateRoadmapImport({ config: {} }).ok).toBe(true);
    expect(validateRoadmapImport({ sections: [] }).ok).toBe(true);
  });

  it('rejects non-roadmap JSON with a readable message', () => {
    const r = validateRoadmapImport({ hello: 'world' });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Invalid roadmap JSON/);
  });

  it('rejects wrong types', () => {
    expect(validateRoadmapImport({ sections: 'nope' }).ok).toBe(false);
    expect(validateRoadmapImport(null).ok).toBe(false);
  });
});

describe('versioning', () => {
  it('rejects files from a newer app version', () => {
    const r = validateRoadmapImport({ version: 99, config: {} });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/newer version/);
  });

  it('stamps the current version on normalized output', () => {
    expect(normalizeRoadmapState({ sections: [] }).version).toBe(1);
  });
});
