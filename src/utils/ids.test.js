import { describe, expect, it } from 'vitest';
import { createId } from './ids';

describe('createId', () => {
  it('prefixes ids', () => {
    expect(createId('task')).toMatch(/^task-/);
  });

  it('does not collide when called many times in the same tick', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => createId('item')));
    expect(ids.size).toBe(5000);
  });
});
