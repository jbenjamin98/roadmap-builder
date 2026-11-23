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
  it('reports backed up otherwise', () => {
    expect(getBackupState(base)).toBe('backed-up');
  });
});
