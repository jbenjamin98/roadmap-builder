import { describe, it, expect, beforeEach, vi } from 'vitest';
import { showToast, dismissToast, subscribeToasts, _resetToasts } from './toast';

describe('toast notification pub/sub', () => {
  beforeEach(() => {
    _resetToasts();
  });

  it('notifies subscribers when a toast is shown', () => {
    const events = [];
    const unsub = subscribeToasts((evt) => events.push(evt));

    const id = showToast({ message: 'Task deleted', tone: 'success' });
    expect(id).toBe(1);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'add',
      toast: {
        id: 1,
        message: 'Task deleted',
        tone: 'success',
        duration: 6000,
      },
    });

    unsub();
    showToast({ message: 'Another' });
    expect(events).toHaveLength(1);
  });

  it('notifies subscribers on dismissToast', () => {
    const events = [];
    subscribeToasts((evt) => events.push(evt));

    const id = showToast({ message: 'Saved' });
    dismissToast(id);

    expect(events).toHaveLength(2);
    expect(events[1]).toEqual({ type: 'remove', id });
  });

  it('includes action callback in the event', () => {
    const onAction = vi.fn();
    const events = [];
    subscribeToasts((evt) => events.push(evt));

    showToast({ message: 'Deleted', actionLabel: 'Undo', onAction });
    expect(events[0].toast.actionLabel).toBe('Undo');
    events[0].toast.onAction();
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
