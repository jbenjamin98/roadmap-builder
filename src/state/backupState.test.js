import { describe, expect, it } from 'vitest';
import { getBackupState } from './backupState';

describe('getBackupState', () => {
  const base = { persistable: true, hasUnbackedChanges: false, saveError: null };

  it('prioritises a failing draft over everything', () => {
    expect(
      getBackupState({ ...base, hasUnbackedChanges: true, saveError: { reason: 'quota' } })
    ).toBe('draft-failing');
  });
  it('shows the untouched sample as such', () => {
    expect(getBackupState({ ...base, persistable: false })).toBe('sample');
  });
  it('flags unbacked changes', () => {
    expect(getBackupState({ ...base, hasUnbackedChanges: true })).toBe('not-backed-up');
  });
  it('shows uploading to Drive while a sync runs', () => {
    expect(getBackupState({ ...base, hasUnbackedChanges: true, driveSyncing: true })).toBe(
      'syncing'
    );
  });
  it('asks for attention when Drive needs the user', () => {
    expect(getBackupState({ ...base, hasUnbackedChanges: true, driveAttention: true })).toBe(
      'attention'
    );
  });
  it('a failing draft still wins over Drive states', () => {
    expect(
      getBackupState({ ...base, saveError: {}, driveSyncing: true, driveAttention: true })
    ).toBe('draft-failing');
  });
  it('reports backed up otherwise', () => {
    expect(getBackupState(base)).toBe('backed-up');
  });
});
