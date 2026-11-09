import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createId } from '../utils/ids';
import { showToast } from '../utils/toast';
import { createBlankRoadmapState, normalizeRoadmapState } from '../data/defaultState';
import {
  fingerprint,
  loadBackupMeta,
  loadDraft,
  restoreLastGood,
  saveBackupMeta,
  saveDraft,
} from '../data/persistence';
import { saveDraftToIdb, requestPersistentStorage } from '../data/indexedDbDraft';
import { canRedo, canUndo, createHistory, historyReducer } from '../state/history';

/**
 * Owns the roadmap document: reducer + undo/redo history, the temporary browser draft
 * (debounced), and backup bookkeeping. `actions` uses the `on*` prop names the UI expects.
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
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState(null);
  const pendingRef = useRef(false);

  const flush = useCallback(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    const result = saveDraft(stateRef.current);
    saveDraftToIdb(stateRef.current);
    requestPersistentStorage();
    setSaveError(result.ok ? null : result);
    if (result.ok) setLastDraftSavedAt(Date.now());
  }, []);

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

  // ---- Backup tracking ("is there a copy outside this browser?") ----
  const [backupMeta, setBackupMeta] = useState(() => loadBackupMeta());
  const currentFingerprint = useMemo(() => fingerprint(roadmapState), [roadmapState]);
  const isBackedUp = backupMeta.backedUpFingerprint === currentFingerprint;
  const hasUnbackedChanges = persistable && !isBackedUp;

  /**
   * @param {string} method
   * @param {object} [snapshot] The exact document that was backed up. Async backups (Drive) must
   *   pass it, otherwise edits made while the upload was running would be wrongly marked as saved.
   */
  const markBackedUp = useCallback((method, snapshot = undefined) => {
    const meta = {
      lastBackupAt: Date.now(),
      backedUpFingerprint: fingerprint(snapshot || stateRef.current),
      method,
    };
    saveBackupMeta(meta);
    setBackupMeta(meta);
  }, []);

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
    createRoadmap,
    updateConfig,
    undo,
    redo,
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    // draft + backup status
    persistable,
    saveError,
    lastDraftSavedAt,
    isBackedUp,
    hasUnbackedChanges,
    lastBackupAt: backupMeta.lastBackupAt,
    backupMethod: backupMeta.method,
    markBackedUp,
    recovery,
    restoreBackup,
    dismissRecovery,
  };
}
