import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLibrary } from './libraryStore';
import { createVersionStore } from './versionStore';

const mk = (id, name, extra = {}) => ({ id, config: { name }, sections: [], ...extra });

let dir;
let lib;
let vs;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'rb-lib-'));
  lib = createLibrary({ getDir: () => dir });
  vs = createVersionStore({ getDir: () => dir });
});
afterEach(() => fs.rm(dir, { recursive: true, force: true }));

describe('library store', () => {
  it('names the file after the roadmap and keeps it when the roadmap is renamed', async () => {
    expect((await lib.save(mk('rm-1', 'Q3 Plan'))).file).toBe('Q3 Plan.roadmap.json');
    await lib.save(mk('rm-1', 'Renamed'));
    const files = (await fs.readdir(dir)).filter((n) => n.endsWith('.roadmap.json'));
    expect(files).toEqual(['Q3 Plan.roadmap.json']);
    expect((await lib.read('rm-1')).config.name).toBe('Renamed');
  });

  it('gives a second roadmap with the same name its own file', async () => {
    await lib.save(mk('rm-1', 'Plan'));
    expect((await lib.save(mk('rm-2', 'Plan'))).file).toBe('Plan (2).roadmap.json');
  });

  it('reports unreadable files instead of failing, and refuses unsafe ids', async () => {
    await fs.writeFile(path.join(dir, 'bad.roadmap.json'), '{nope');
    expect((await lib.list()).unreadable).toEqual(['bad.roadmap.json']);
    await expect(lib.save({ id: '../evil', config: {} })).rejects.toThrow();
    await expect(lib.read('../evil')).rejects.toThrow();
  });

  it('never lets an import overwrite a roadmap with the same id', async () => {
    await lib.save(mk('rm-1', 'Original'));
    const imported = await lib.importText(JSON.stringify(mk('rm-1', 'Other')), () => 'rm-new');
    expect(imported.id).toBe('rm-new');
    expect((await lib.read('rm-1')).config.name).toBe('Original');
  });

  it('duplicates under a new id and name', async () => {
    await lib.save(mk('rm-1', 'Plan'));
    const copy = await lib.duplicate('rm-1', () => 'rm-copy');
    expect(copy.id).toBe('rm-copy');
    expect(copy.config.name).toBe('Plan (copy)');
  });
});

describe('version store', () => {
  it('snapshots the first save, then waits for the interval unless forced', async () => {
    const s = mk('rm-1', 'v', { n: 1 });
    expect(await vs.maybeAutoSnapshot('rm-1', s, { now: 1000 })).toBeTruthy();
    expect(await vs.maybeAutoSnapshot('rm-1', { ...s, n: 2 }, { now: 2000 })).toBeNull();
    expect(
      await vs.maybeAutoSnapshot('rm-1', { ...s, n: 2 }, { now: 2000, force: true })
    ).toBeTruthy();
    expect(await vs.maybeAutoSnapshot('rm-1', { ...s, n: 2 }, { force: true })).toBeNull();
  });

  it('prunes old autosaves but never a pinned master', async () => {
    const s = mk('rm-1', 'v');
    const master = await vs.create('rm-1', { ...s, n: 0 }, { label: 'Q3 master', pinned: true }, 1);
    for (let i = 0; i < 60; i += 1)
      await vs.create('rm-1', { ...s, n: i + 1 }, { auto: true }, 10 + i);
    const list = await vs.list('rm-1');
    expect(list.filter((v) => !v.pinned)).toHaveLength(50);
    expect(list.find((v) => v.id === master.id)?.pinned).toBe(true);
    expect((await vs.read('rm-1', master.id)).n).toBe(0);
  });

  it('renames, unpins and rejects path-like version ids', async () => {
    const v = await vs.create('rm-1', mk('rm-1', 'v'), { pinned: true });
    await vs.update('rm-1', v.id, { label: 'Renamed', pinned: false });
    const [entry] = await vs.list('rm-1');
    expect(entry).toMatchObject({ label: 'Renamed', pinned: false });
    await expect(vs.read('rm-1', '../../x')).rejects.toThrow();
  });
});
