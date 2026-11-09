import { describe, expect, it } from 'vitest';
import { classifyDriveError, isBlockingProblem } from './useDriveBackup';
import { DriveError } from '../utils/googleAuth';

describe('classifyDriveError', () => {
  it.each([
    ['auth_expired', 'auth'],
    ['not_signed_in', 'auth'],
    ['network', 'network'],
    ['not_found', 'missing'],
    ['forbidden', 'missing'],
    ['trashed', 'trashed'],
    ['http', 'other'],
  ])('maps %s to %s', (code, kind) => {
    expect(classifyDriveError(new DriveError(code, 'msg')).kind).toBe(kind);
  });

  it('treats unknown errors as other and keeps the message', () => {
    expect(classifyDriveError(new Error('boom'))).toEqual({ kind: 'other', message: 'boom' });
  });
});

describe('isBlockingProblem', () => {
  it('blocks autosave for problems that need the user', () => {
    for (const kind of ['auth', 'trashed', 'missing', 'conflict', 'account']) {
      expect(isBlockingProblem({ kind })).toBe(true);
    }
  });
  it('keeps retrying through offline and unknown blips', () => {
    expect(isBlockingProblem({ kind: 'network' })).toBe(false);
    expect(isBlockingProblem({ kind: 'other' })).toBe(false);
    expect(isBlockingProblem(null)).toBe(false);
  });
});
