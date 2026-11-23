import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createId } from '../utils/ids';
import { showToast } from '../utils/toast';
import { createBlankRoadmapState, normalizeRoadmapState } from '../data/defaultState';
import { fingerprint, loadDraft, restoreLastGood, saveDraft } from '../data/persistence';
import { saveDraftToIdb, requestPersistentStorage } from '../data/indexedDbDraft';
import { desktop, isDesktop } from '../storage/desktop';
import { canRedo, canUndo, createHistory, historyReducer } from '../state/history';

/**
 * Owns the roadmap document: reducer + undo/redo history and its persistence (the temporary
 * browser draft on the web, the roadmap file on desktop; both debounced). `actions` uses the `on*` prop names the UI expects.
 */
export default function useRoadmapState() {
  const [initial] = useState(() => loadDraft());
  const [history, dispatch] = useReducer(historyReducer, initial.state, createHistory);
  const roadmapState = history.present;

  // Latest values for callbacks that must not change identity (updated after each commit).
  const historyRef = useRef(history);
  const stateRef = useRef(roadmapState);
  useEffect(() => {
    historyRef.current = history;
    stateRef.current = roadmapState;
  }, [history, roadmapState]);

  // ---- Draft persistence (debounced; flushed when the tab is hidden or closed) ----
  // The untouched sample is never written, only real edits are.
  const persistable = !initial.isSample || roadmapState !== initial.state;
  const [saveError, setSaveError] = useState(null);
  const pendingRef = useRef(false);
  // Desktop app: saves to the roadmap's file run one after another, never overlapping.
  const fileQueueRef = useRef(Promise.resolve());
  const lastFileFingerprintRef = useRef(null);

  /** Writes the roadmap to its library file (desktop only). Resolves when the write is done. */
  const saveToFile = useCallback((snapshot) => {
    const fp = fingerprint(snapshot);
    if (fp === lastFileFingerprintRef.current) return fileQueueRef.current;
    fileQueueRef.current = fileQueueRef.current.then(async () => {
      try {
        await desktop.library.save(snapshot);
        lastFileFingerprintRef.current = fp;
        setSaveError(null);
      } catch (err) {
        setSaveError({ ok: false, reason: 'file', message: err?.message || String(err) });
      }
    });
    return fileQueueRef.current;
  }, []);

  /** Saves any pending edit now. The returned promise settles when the file write has finished. */
  const flush = useCallback(() => {
    if (pendingRef.current) {
      pendingRef.current = false;
      const result = saveDraft(stateRef.current);
      saveDraftToIdb(stateRef.current);
      requestPersistentStorage();
      if (isDesktop) {
        // The draft restored at launch has not been edited yet. Writing it back would clobber a
        // file that was changed outside the app (a text editor, OneDrive/Dropbox sync).
        if (stateRef.current === initial.state) return fileQueueRef.current;
        return saveToFile(stateRef.current);
      }
      setSaveError(result.ok ? null : result);
    }
    return fileQueueRef.current;
  }, [saveToFile, initial.state]);

  useEffect(() => {
    if (!persistable) return undefined;
    pendingRef.current = true;
    const timer = setTimeout(flush, 400);
    return () => clearTimeout(timer);
  }, [roadmapState, persistable, flush]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  // A failed save is the one thing the user must hear about; tell them once per failure.
  const saveErrorMessage = saveError
    ? saveError.message || saveError.reason || 'unknown error'
    : null;
  useEffect(() => {
    if (!saveErrorMessage) return;
    showToast({
      message: `Changes could not be saved (${saveErrorMessage}). Export a copy so you do not lose your work.`,
      tone: 'error',
      duration: 15000,
    });
  }, [saveErrorMessage]);

  // Desktop: let the window wait for the final write before it closes.
  useEffect(() => {
    if (!isDesktop) return undefined;
    return desktop.onBeforeClose(() => flush());
  }, [flush]);

  // ---- Corrupt-draft recovery ----
  const [recovery, setRecovery] = useState(initial.recovery);
  const restoreBackup = useCallback(() => {
    const restored = restoreLastGood();
    if (restored) dispatch({ type: 'REPLACE', state: restored });
    setRecovery(null);
  }, []);
  const dismissRecovery = useCallback(() => setRecovery(null), []);

  // ---- Undo / redo ----
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  // ---- Document-level operations ----
  /** Replaces the document (undoable). Returns the normalized state that is now current. */
  const importRoadmap = useCallback((parsedJson) => {
    const next = normalizeRoadmapState(parsedJson, { forceNewId: !parsedJson.id });
    dispatch({ type: 'REPLACE', state: next });
    return next;
  }, []);
  /**
   * Desktop: loads a roadmap that already lives in the library. Undoable like any replace, but it
   * is not re-written (and its modified time not bumped) just because it was opened.
   */
  const openRoadmapFile = useCallback((json) => {
    const next = normalizeRoadmapState(json, { forceNewId: !json.id });
    lastFileFingerprintRef.current = fingerprint(next);
    dispatch({ type: 'REPLACE', state: next });
    return next;
  }, []);
  const createRoadmap = useCallback((config) => {
    dispatch({ type: 'REPLACE', state: createBlankRoadmapState(config) });
  }, []);
  const updateConfig = useCallback((config) => {
    dispatch({ type: 'CONFIG_UPDATE', config });
  }, []);

  // ---- Edit actions (same `on*` names the workspace components already consume) ----
  const actions = useMemo(() => {
    const coalesced = (action, key) => dispatch({ ...action, coalesceKey: key, at: Date.now() });

    /** Dispatch a delete, then offer an Undo that only fires if nothing else happened since. */
    const destructive = (action, message) => {
      dispatch(action);
      const stepsAfterDelete = historyRef.current.past.length + 1;
      showToast({
        message,
        actionLabel: 'Undo',
        tone: 'info',
        onAction: () => {
          if (historyRef.current.past.length === stepsAfterDelete) dispatch({ type: 'UNDO' });
          else showToast({ message: 'Other edits were made since. Use Ctrl+Z to step back.' });
        },
      });
    };

    return {
      onUpdatePeriod: (index, patch) =>
        coalesced({ type: 'PERIOD_UPDATE', index, patch }, `period:${index}`),
      onBulkPeriods: (bulk) => dispatch({ type: 'PERIODS_BULK', bulk }),

      onAddLegendCategory: (c) => dispatch({ type: 'LEGEND_ADD', id: createId('leg'), ...c }),
      onUpdateLegendCategory: (legendId, updates) =>
        coalesced({ type: 'LEGEND_UPDATE', legendId, updates }, `leg:${legendId}`),
      onDeleteLegendCategory: (legendId) =>
        destructive({ type: 'LEGEND_DELETE', legendId }, 'Legend category deleted'),

      onAddSection: () =>
        dispatch({
          type: 'SECTION_ADD',
          sectionId: createId('sec'),
          subSectionId: createId('sub'),
          taskId: createId('task'),
        }),
      onUpdateSectionTitle: (sectionId, title) =>
        coalesced({ type: 'SECTION_TITLE', sectionId, title }, `sec:${sectionId}`),
      onDeleteSection: (sectionId) =>
        destructive({ type: 'SECTION_DELETE', sectionId }, 'Section deleted'),
      onReorderSections: (activeId, overId) =>
        dispatch({ type: 'SECTIONS_REORDER', activeId, overId }),

      onAddSubSection: (sectionId) =>
        dispatch({
          type: 'SUBSECTION_ADD',
          sectionId,
          subSectionId: createId('sub'),
          taskId: createId('task'),
        }),
      onUpdateSubSectionTitle: (sectionId, subSectionId, title) =>
        coalesced(
          { type: 'SUBSECTION_TITLE', sectionId, subSectionId, title },
          `sub:${subSectionId}`
        ),
      onDeleteSubSection: (sectionId, subSectionId) =>
        destructive({ type: 'SUBSECTION_DELETE', sectionId, subSectionId }, 'Sub-section deleted'),
      onReorderSubSections: (sectionId, activeId, overId) =>
        dispatch({ type: 'SUBSECTIONS_REORDER', sectionId, activeId, overId }),

      onAddTask: (subSectionId) =>
        dispatch({ type: 'TASK_ADD', subSectionId, taskId: createId('task') }),
      onUpdateTaskTitle: (taskId, title) =>
        coalesced({ type: 'TASK_TITLE', taskId, title }, `task:${taskId}`),
      onDeleteTask: (taskId) => destructive({ type: 'TASK_DELETE', taskId }, 'Task deleted'),
      onReorderTasks: (subSectionId, activeId, overId) =>
        dispatch({ type: 'TASKS_REORDER', subSectionId, activeId, overId }),

      onAddTimelineItem: (data) => {
        const id = createId('item');
        dispatch({ type: 'ITEM_ADD', id, data });
        return id;
      },
      onUpdateTimelineItem: (itemId, updates) =>
        coalesced({ type: 'ITEM_UPDATE', itemId, updates }, `item:${itemId}`),
      onDeleteTimelineItem: (itemId) =>
        destructive({ type: 'ITEM_DELETE', itemId }, 'Timeline item deleted'),
    };
  }, []);

  return {
    roadmapState,
    actions,
    importRoadmap,
    openRoadmapFile,
    flushNow: flush,
    createRoadmap,
    updateConfig,
    undo,
    redo,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    // draft / file save status
    persistable,
    saveError,
    recovery,
    restoreBackup,
    dismissRecovery,
  };
}
