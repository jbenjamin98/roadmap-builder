import { describe, expect, it } from 'vitest';
import { clearDriveLink, DRIVE_LINKS_KEY, loadDriveLink, saveDriveLink } from './driveLinks';

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe('driveLinks', () => {
  it('remembers which Drive file belongs to which roadmap', () => {
    const storage = memoryStorage();
    saveDriveLink('rm-1', { fileId: 'f1', accountId: 'a@x.com' }, storage);
    saveDriveLink('rm-2', { fileId: 'f2' }, storage);
    expect(loadDriveLink('rm-1', storage)).toMatchObject({ fileId: 'f1', accountId: 'a@x.com' });
    expect(loadDriveLink('rm-2', storage)?.fileId).toBe('f2');
  });

  it('survives a "reload" because it lives in storage, not in the document', () => {
    const storage = memoryStorage();
    saveDriveLink('rm-1', { fileId: 'f1' }, storage);
    const afterReload = memoryStorage({ [DRIVE_LINKS_KEY]: storage.getItem(DRIVE_LINKS_KEY) });
    expect(loadDriveLink('rm-1', afterReload)?.fileId).toBe('f1');
  });

  it('returns null for unknown roadmaps and unusable data', () => {
    expect(loadDriveLink('nope', memoryStorage())).toBeNull();
    expect(loadDriveLink(undefined, memoryStorage())).toBeNull();
    expect(loadDriveLink('rm', memoryStorage({ [DRIVE_LINKS_KEY]: '{not json' }))).toBeNull();
    expect(loadDriveLink('rm', memoryStorage({ [DRIVE_LINKS_KEY]: '{"rm":{"x":1}}' }))).toBeNull();
  });

  it('unlinks one roadmap without touching others', () => {
    const storage = memoryStorage();
    saveDriveLink('rm-1', { fileId: 'f1' }, storage);
    saveDriveLink('rm-2', { fileId: 'f2' }, storage);
    clearDriveLink('rm-1', storage);
    expect(loadDriveLink('rm-1', storage)).toBeNull();
    expect(loadDriveLink('rm-2', storage)?.fileId).toBe('f2');
  });
});
