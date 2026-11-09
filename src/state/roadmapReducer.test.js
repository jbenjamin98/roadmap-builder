import { describe, expect, it } from 'vitest';
import { roadmapReducer as reduce } from './roadmapReducer';
import {
  COALESCE_MS,
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  createHistory,
  historyReducer,
} from './history';

const base = () => ({
  id: 'rm',
  config: { design: {} },
  legend: [
    { id: 'l1', label: 'A' },
    { id: 'l2', label: 'B' },
  ],
  sections: [
    {
      id: 's1',
      title: 'S1',
      subSections: [
        { id: 'u1', title: 'U1' },
        { id: 'u2', title: 'U2' },
      ],
    },
    { id: 's2', title: 'S2', subSections: [{ id: 'u3', title: 'U3' }] },
  ],
  tasks: [
    { id: 't1', subSectionId: 'u1', title: 'T1' },
    { id: 't2', subSectionId: 'u1', title: 'T2' },
    { id: 't3', subSectionId: 'u2', title: 'T3' },
    { id: 't4', subSectionId: 'u3', title: 'T4' },
  ],
  timelineItems: [
    { id: 'i1', taskId: 't1', legendId: 'l1', startPeriod: 1, duration: 1, type: 'bar' },
    { id: 'i2', taskId: 't3', legendId: 'l2', startPeriod: 2, duration: 2, type: 'bar' },
    { id: 'i3', taskId: 't4', legendId: 'l1', startPeriod: 1, duration: 1, type: 'milestone' },
  ],
});

describe('cascade deletes', () => {
  it('deleting a section removes its sub-sections, tasks and items only', () => {
    const s = reduce(base(), { type: 'SECTION_DELETE', sectionId: 's1' });
    expect(s.sections.map((x) => x.id)).toEqual(['s2']);
    expect(s.tasks.map((x) => x.id)).toEqual(['t4']);
    expect(s.timelineItems.map((x) => x.id)).toEqual(['i3']);
  });

  it('deleting a sub-section removes its tasks and items only', () => {
    const s = reduce(base(), { type: 'SUBSECTION_DELETE', sectionId: 's1', subSectionId: 'u1' });
    expect(s.sections[0].subSections.map((x) => x.id)).toEqual(['u2']);
    expect(s.tasks.map((x) => x.id)).toEqual(['t3', 't4']);
    expect(s.timelineItems.map((x) => x.id)).toEqual(['i2', 'i3']);
  });

  it('deleting a task removes its items', () => {
    const s = reduce(base(), { type: 'TASK_DELETE', taskId: 't1' });
    expect(s.tasks.map((x) => x.id)).not.toContain('t1');
    expect(s.timelineItems.map((x) => x.id)).toEqual(['i2', 'i3']);
  });

  it('deleting a legend category reassigns its items to the first remaining category', () => {
    const s = reduce(base(), { type: 'LEGEND_DELETE', legendId: 'l1' });
    expect(s.legend.map((x) => x.id)).toEqual(['l2']);
    expect(s.timelineItems.every((i) => i.legendId === 'l2')).toBe(true);
  });

  it('deleting an unknown id changes nothing structurally', () => {
    const s = reduce(base(), { type: 'SECTION_DELETE', sectionId: 'nope' });
    expect(s.sections).toHaveLength(2);
    expect(s.tasks).toHaveLength(4);
  });
});

describe('add', () => {
  it('adding a section also creates a sub-section and a task', () => {
    const s = reduce(base(), {
      type: 'SECTION_ADD',
      sectionId: 'sN',
      subSectionId: 'uN',
      taskId: 'tN',
    });
    expect(s.sections.at(-1).subSections[0].id).toBe('uN');
    expect(s.tasks.at(-1)).toMatchObject({ id: 'tN', subSectionId: 'uN' });
  });

  it('adding a sub-section creates a starter task', () => {
    const s = reduce(base(), {
      type: 'SUBSECTION_ADD',
      sectionId: 's2',
      subSectionId: 'uN',
      taskId: 'tN',
    });
    expect(s.sections[1].subSections.map((x) => x.id)).toEqual(['u3', 'uN']);
    expect(s.tasks.at(-1).id).toBe('tN');
  });

  it('clamps and defaults timeline item fields', () => {
    const s = reduce(base(), {
      type: 'ITEM_ADD',
      id: 'iN',
      data: { taskId: 't2', startPeriod: -5, duration: 0, type: 'weird' },
    });
    expect(s.timelineItems.at(-1)).toMatchObject({
      startPeriod: 1,
      duration: 1,
      type: 'bar',
      legendId: 'l1',
      hasEndMilestone: false,
    });
  });

  it('refuses a bar that would overlap an existing bar on the same task', () => {
    const start = base();
    const s = reduce(start, {
      type: 'ITEM_ADD',
      id: 'iN',
      data: { taskId: 't1', startPeriod: 1, duration: 2, type: 'bar' },
    });
    expect(s).toBe(start);
  });
});

describe('reorder', () => {
  it('reorders sections and ignores unknown ids', () => {
    const s = reduce(base(), { type: 'SECTIONS_REORDER', activeId: 's2', overId: 's1' });
    expect(s.sections.map((x) => x.id)).toEqual(['s2', 's1']);
    const same = base();
    expect(reduce(same, { type: 'SECTIONS_REORDER', activeId: 'x', overId: 's1' })).toBe(same);
  });

  it('reorders sub-sections within one section', () => {
    const s = reduce(base(), {
      type: 'SUBSECTIONS_REORDER',
      sectionId: 's1',
      activeId: 'u2',
      overId: 'u1',
    });
    expect(s.sections[0].subSections.map((x) => x.id)).toEqual(['u2', 'u1']);
  });

  it('reorders tasks inside a sub-section without disturbing other tasks', () => {
    const s = reduce(base(), {
      type: 'TASKS_REORDER',
      subSectionId: 'u1',
      activeId: 't2',
      overId: 't1',
    });
    expect(s.tasks.map((x) => x.id)).toEqual(['t2', 't1', 't3', 't4']);
  });
});

describe('config update', () => {
  it('merges design over existing design and normalizes', () => {
    const s = reduce(base(), {
      type: 'CONFIG_UPDATE',
      config: { name: 'X', design: { numbering: { tasks: true } } },
    });
    expect(s.config.name).toBe('X');
    expect(s.config.design.numbering.tasks).toBe(true);
    expect(s.config.design.dateFormat).toBeDefined();
  });
});

describe('history', () => {
  const act = (h, a) => historyReducer(h, a);

  it('undoes and redoes', () => {
    let h = createHistory(base());
    h = act(h, { type: 'TASK_TITLE', taskId: 't1', title: 'New' });
    expect(canUndo(h)).toBe(true);
    h = act(h, { type: 'UNDO' });
    expect(h.present.tasks[0].title).toBe('T1');
    expect(canRedo(h)).toBe(true);
    h = act(h, { type: 'REDO' });
    expect(h.present.tasks[0].title).toBe('New');
  });

  it('a new edit clears the redo stack', () => {
    let h = createHistory(base());
    h = act(h, { type: 'TASK_TITLE', taskId: 't1', title: 'A' });
    h = act(h, { type: 'UNDO' });
    h = act(h, { type: 'TASK_TITLE', taskId: 't1', title: 'B' });
    expect(canRedo(h)).toBe(false);
  });

  it('no-op actions do not create history entries', () => {
    let h = createHistory(base());
    h = act(h, { type: 'SECTIONS_REORDER', activeId: 'x', overId: 'y' });
    expect(canUndo(h)).toBe(false);
  });

  it('coalesces rapid edits to the same thing into one undo step', () => {
    let h = createHistory(base());
    const edit = (title, at) =>
      act(h, { type: 'TASK_TITLE', taskId: 't1', title, coalesceKey: 'task:t1', at });
    h = edit('H', 1000);
    h = edit('He', 1200);
    h = edit('Hel', 1400);
    expect(h.past).toHaveLength(1);
    h = act(h, { type: 'UNDO' });
    expect(h.present.tasks[0].title).toBe('T1');
  });

  it('does not coalesce across the time window or different keys', () => {
    let h = createHistory(base());
    const edit = (title, at, key = 'task:t1') =>
      act(h, { type: 'TASK_TITLE', taskId: 't1', title, coalesceKey: key, at });
    h = edit('A', 1000);
    h = edit('B', 1000 + COALESCE_MS + 1);
    h = edit('C', 1000 + COALESCE_MS + 2, 'other');
    expect(h.past).toHaveLength(3);
  });

  it('caps history length', () => {
    let h = createHistory(base());
    for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
      h = act(h, { type: 'TASK_TITLE', taskId: 't1', title: `v${i}` });
    }
    expect(h.past).toHaveLength(HISTORY_LIMIT);
  });

  it('REPLACE with a different roadmap starts a fresh history (undo never crosses roadmaps)', () => {
    let h = createHistory(base());
    h = act(h, { type: 'SECTION_ADD', sectionId: 'x', subSectionId: 'xs', taskId: 'xt' });
    expect(canUndo(h)).toBe(true);
    h = act(h, { type: 'REPLACE', state: { ...base(), id: 'other' } });
    expect(h.present.id).toBe('other');
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
    expect(act(h, { type: 'UNDO' }).present.id).toBe('other');
  });

  it('REPLACE with the same roadmap (restoring a version) stays undoable', () => {
    let h = createHistory(base());
    h = act(h, {
      type: 'REPLACE',
      state: { ...base(), config: { ...base().config, name: 'Old' } },
    });
    expect(h.present.config.name).toBe('Old');
    h = act(h, { type: 'UNDO' });
    expect(h.present.id).toBe('rm');
    expect(h.present.config.name).not.toBe('Old');
  });
});

describe('theme change recolours legend presets', () => {
  const theme = (primary, accents) => ({ primary, secondary: '#000000', accents });
  const oldTheme = theme('#6366f1', ['#818cf8', '#ec4899', '#14b8a6', '#f59e0b']);
  const newTheme = theme('#10b981', ['#34d399', '#f43f5e', '#0ea5e9', '#eab308']);

  it('moves preset-coloured entries to the new theme and keeps custom colours', () => {
    const start = {
      ...base(),
      config: { ...base().config, theme: oldTheme },
      legend: [
        { id: 'l1', label: 'A', color: '#6366f1', gradient: 'x' },
        { id: 'l2', label: 'B', color: '#ec4899', gradient: 'x' },
        { id: 'l3', label: 'C', color: '#123456', gradient: 'keep' },
      ],
    };
    const s = reduce(start, { type: 'CONFIG_UPDATE', config: { theme: newTheme } });
    expect(s.legend[0].color).toBe('#10b981');
    expect(s.legend[1].color).toBe('#f43f5e');
    expect(s.legend[2]).toEqual(start.legend[2]);
  });
});
