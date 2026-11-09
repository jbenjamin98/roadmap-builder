import { roadmapReducer } from './roadmapReducer';

export const HISTORY_LIMIT = 100;
/** Consecutive actions with the same coalesceKey closer together than this share one undo step. */
export const COALESCE_MS = 1000;

export function createHistory(present) {
  return { past: [], present, future: [], lastKey: null, lastAt: 0 };
}

export const canUndo = (h) => h.past.length > 0;
export const canRedo = (h) => h.future.length > 0;

/**
 * Wraps roadmapReducer with undo/redo. Actions may carry `coalesceKey` + `at` (ms timestamp) so a
 * burst of edits to the same thing (typing in a title, dragging a bar) becomes one undo step.
 */
export function historyReducer(history, action) {
  switch (action.type) {
    case 'UNDO': {
      if (!history.past.length) return history;
      const previous = history.past[history.past.length - 1];
      return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
        lastKey: null,
        lastAt: 0,
      };
    }
    case 'REDO': {
      if (!history.future.length) return history;
      const [next, ...rest] = history.future;
      return {
        past: [...history.past, history.present],
        present: next,
        future: rest,
        lastKey: null,
        lastAt: 0,
      };
    }
    case 'REPLACE': {
      // Loading a different roadmap (new, imported, opened from Drive) starts a fresh history, so
      // Undo can never jump into an unrelated roadmap. Reloading the SAME roadmap (restoring a
      // Drive version) stays undoable.
      if (action.state?.id !== history.present.id) return createHistory(action.state);
      return pushState(history, action);
    }
    default:
      return pushState(history, action);
  }
}

function pushState(history, action) {
  const next = roadmapReducer(history.present, action);
  if (next === history.present) return history;
  const key = action.coalesceKey ?? null;
  const at = action.at ?? 0;
  const coalesce = key !== null && key === history.lastKey && at - history.lastAt <= COALESCE_MS;
  const past = coalesce ? history.past : [...history.past, history.present].slice(-HISTORY_LIMIT);
  return { past, present: next, future: [], lastKey: key, lastAt: at };
}
