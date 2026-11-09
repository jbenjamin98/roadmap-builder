import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoadmap } from '../state/roadmapContext';
import { clearDriveLink, loadDriveLink, saveDriveLink } from '../data/driveLinks';
import { showToast } from '../utils/toast';
import {
  DriveError,
  getStoredAccessToken,
  getStoredUserProfile,
  listAppRoadmaps,
  loadFromGoogleDrive,
  restoreFromTrash,
  saveToGoogleDrive,
  signInWithGoogle,
  signOutGoogle,
} from '../utils/googleDrive';

/** Wait this long after the last edit before uploading (design: ~30 s debounce). */
export const AUTO_DEBOUNCE_MS = 30 * 1000;
/** Never upload more often than this, so autosave does not flood Drive with revisions. */
export const AUTO_MIN_INTERVAL_MS = 60 * 1000;

/** Turns a failure into the state the UI shows. `network` is transient; the rest need the user. */
export function classifyDriveError(err) {
  const code = err instanceof DriveError ? err.code : 'other';
  const message = err?.message || 'Something went wrong with Google Drive.';
  if (code === 'auth_expired' || code === 'not_signed_in') return { kind: 'auth', message };
  if (code === 'network') return { kind: 'network', message };
  if (code === 'not_found' || code === 'forbidden') return { kind: 'missing', message };
  if (code === 'trashed') return { kind: 'trashed', message };
  return { kind: 'other', message };
}

/** Problems that stop automatic backups until the user fixes them. */
export const isBlockingProblem = (problem) =>
  Boolean(problem) && ['auth', 'trashed', 'missing', 'conflict', 'account'].includes(problem.kind);

/**
 * Everything about backing the current roadmap up to Google Drive: sign-in state, the per-roadmap
 * file link, manual and automatic (debounced) uploads, conflicts, and recovery from a trashed,
 * deleted or other-account file. Must be used inside the roadmap context.
 */
export default function useDriveBackup() {
  const { roadmapState, hasUnbackedChanges, markBackedUp, importRoadmap } = useRoadmap();
  const roadmapId = roadmapState.id;

  // The link lives in localStorage (not in the document). `linkState` caches the last read; when the
  // roadmap changes we fall back to reading the new roadmap's link.
  const [linkState, setLinkState] = useState(() => ({
    id: roadmapId,
    link: loadDriveLink(roadmapId),
  }));
  const link = useMemo(
    () => (linkState.id === roadmapId ? linkState.link : loadDriveLink(roadmapId)),
    [linkState, roadmapId]
  );
  const [auth, setAuth] = useState(() => ({
    connected: Boolean(getStoredAccessToken()),
    profile: getStoredUserProfile(),
  }));
  const [syncing, setSyncing] = useState(false);
  const [problem, setProblem] = useState(null);
  const [conflictOpen, setConflictOpen] = useState(false);

  const linkedElsewhere = Boolean(
    link?.accountId && auth.profile?.email && link.accountId !== auth.profile.email
  );

  // Latest values for async callbacks and timers (refs are written after commit).
  const stateRef = useRef(roadmapState);
  const linkRef = useRef(link);
  const authRef = useRef(auth);
  const syncingRef = useRef(false);
  const lastUploadRef = useRef(0);
  useEffect(() => {
    stateRef.current = roadmapState;
    linkRef.current = link;
    authRef.current = auth;
  }, [roadmapState, link, auth]);

  const rememberLink = useCallback((id, res, accountId = null) => {
    saveDriveLink(id, {
      fileId: res.fileId,
      headRevisionId: res.headRevisionId,
      fileName: res.fileName,
      lastSyncedAt: Date.now(),
      accountId: accountId ?? authRef.current.profile?.email ?? null,
    });
    setLinkState({ id, link: loadDriveLink(id) });
  }, []);

  const reportFailure = useCallback((err, silent) => {
    if (err instanceof DriveError && err.code === 'cancelled') {
      if (!silent) showToast({ message: 'Google sign-in was cancelled.', tone: 'info' });
      return;
    }
    const next = classifyDriveError(err);
    if (next.kind === 'auth') setAuth((a) => ({ ...a, connected: false }));
    setProblem(next);
    if (!silent) showToast({ message: next.message, tone: 'error' });
  }, []);

  /** Uploads the current document. `silent` runs (autosave) never pop toasts or sign-in UI. */
  const runSync = useCallback(
    /**
     * @param {{ interactive?: boolean, forceOverwrite?: boolean, asNew?: boolean, profile?: any }} [options]
     */
    async ({ interactive = false, forceOverwrite = false, asNew = false, profile } = {}) => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      setSyncing(true);
      const silent = !interactive;
      const snapshot = stateRef.current;
      const current = linkRef.current;
      try {
        let activeProfile = profile ?? authRef.current.profile;
        if (!getStoredAccessToken()) {
          const signedIn = await signInWithGoogle({
            prompt: interactive ? '' : 'none',
            hint: activeProfile?.email,
          });
          activeProfile = signedIn.profile || activeProfile;
          setAuth({ connected: true, profile: activeProfile });
        }

        const res = await saveToGoogleDrive({
          fileId: asNew ? null : current?.fileId,
          name: snapshot.config?.name || 'Roadmap',
          roadmapState: snapshot,
          currentHeadRevisionId: forceOverwrite || asNew ? null : current?.headRevisionId,
        });

        if (res.conflict) {
          setProblem({ kind: 'conflict', remoteMeta: res.remoteMeta });
          if (interactive) setConflictOpen(true);
          return;
        }
        if (res.problem) {
          setProblem({ kind: res.problem, remoteMeta: res.remoteMeta });
          return;
        }

        rememberLink(snapshot.id, res, activeProfile?.email);
        markBackedUp('google-drive', snapshot);
        lastUploadRef.current = Date.now();
        setProblem(null);
        setConflictOpen(false);
        if (interactive) showToast({ message: 'Roadmap saved to Google Drive.', tone: 'success' });
      } catch (err) {
        reportFailure(err, silent);
      } finally {
        syncingRef.current = false;
        setSyncing(false);
      }
    },
    [markBackedUp, rememberLink, reportFailure]
  );

  /** Signs in. With `backup: false` (e.g. "Open from Drive") nothing is uploaded afterwards. */
  const connect = useCallback(
    async (options) => {
      // Click handlers pass an event as the first argument; only a plain object counts as options.
      const backup = !(options && options.backup === false);
      try {
        const { profile } = await signInWithGoogle({ prompt: '' });
        setAuth({ connected: true, profile });
        setProblem(null);
        if (!backup) return;
        const existing = linkRef.current;
        if (existing?.accountId && profile?.email && existing.accountId !== profile.email) {
          setProblem({ kind: 'account', message: `Linked to ${existing.accountId}` });
          return;
        }
        await runSync({ interactive: true, profile });
      } catch (err) {
        reportFailure(err, false);
      }
    },
    [reportFailure, runSync]
  );

  const disconnect = useCallback(() => {
    signOutGoogle();
    setAuth({ connected: false, profile: null });
    setProblem(null);
    showToast({ message: 'Disconnected Google Drive.', tone: 'info' });
  }, []);

  const unlink = useCallback(() => {
    const id = stateRef.current.id;
    clearDriveLink(id);
    setLinkState({ id, link: null });
    setProblem(null);
    setConflictOpen(false);
  }, []);

  const syncNow = useCallback(() => runSync({ interactive: true }), [runSync]);
  const saveAsNewFile = useCallback(() => runSync({ interactive: true, asNew: true }), [runSync]);

  const restoreTrashedFile = useCallback(async () => {
    const current = linkRef.current;
    if (!current) return;
    try {
      await restoreFromTrash(current.fileId);
      setProblem(null);
      await runSync({ interactive: true, forceOverwrite: true });
    } catch (err) {
      reportFailure(err, false);
    }
  }, [reportFailure, runSync]);

  /** Conflict choices: keep this version, take Drive's, or save this one as a separate file. */
  const resolveConflict = useCallback(
    async (choice) => {
      setConflictOpen(false);
      if (choice === 'mine') return runSync({ interactive: true, forceOverwrite: true });
      if (choice === 'copy') return runSync({ interactive: true, asNew: true });
      if (choice !== 'theirs') return undefined;
      const current = linkRef.current;
      if (!current) return undefined;
      try {
        syncingRef.current = true;
        setSyncing(true);
        const res = await loadFromGoogleDrive(current.fileId);
        const next = importRoadmap(res.data);
        rememberLink(next.id, res);
        markBackedUp('google-drive', next);
        setProblem(null);
        showToast({ message: 'Loaded the Google Drive version.', tone: 'success' });
      } catch (err) {
        reportFailure(err, false);
      } finally {
        syncingRef.current = false;
        setSyncing(false);
      }
      return undefined;
    },
    [importRoadmap, markBackedUp, rememberLink, reportFailure, runSync]
  );

  /** One page of this app's roadmaps in the signed-in Drive (open them on any device). */
  const listFiles = useCallback((options) => listAppRoadmaps(options), []);

  const openFile = useCallback(
    async (fileId) => {
      try {
        const res = await loadFromGoogleDrive(fileId);
        const next = importRoadmap(res.data);
        rememberLink(next.id, res);
        markBackedUp('google-drive', next);
        setProblem(null);
        showToast({ message: `Opened "${res.fileName}" from Google Drive.`, tone: 'success' });
        return true;
      } catch (err) {
        reportFailure(err, false);
        return false;
      }
    },
    [importRoadmap, markBackedUp, rememberLink, reportFailure]
  );

  // ---- Automatic backups: only for roadmaps the user already linked to a Drive file ----
  const syncRef = useRef(runSync);
  useEffect(() => {
    syncRef.current = runSync;
  }, [runSync]);

  const autoEligible =
    Boolean(link) && hasUnbackedChanges && !linkedElsewhere && !isBlockingProblem(problem);

  useEffect(() => {
    if (!autoEligible) return undefined;
    const sinceLast = lastUploadRef.current + AUTO_MIN_INTERVAL_MS - Date.now();
    const timer = setTimeout(() => syncRef.current(), Math.max(AUTO_DEBOUNCE_MS, sinceLast));
    return () => clearTimeout(timer);
    // `roadmapState` restarts the debounce on every edit.
  }, [autoEligible, roadmapState]);

  useEffect(() => {
    if (!autoEligible) return undefined;
    const flush = () => syncRef.current();
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('online', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('online', flush);
    };
  }, [autoEligible]);

  return useMemo(
    () => ({
      link,
      auth,
      syncing,
      problem,
      linkedElsewhere: linkedElsewhere || problem?.kind === 'account',
      conflictOpen,
      setConflictOpen,
      connect,
      disconnect,
      unlink,
      syncNow,
      saveAsNewFile,
      restoreTrashedFile,
      resolveConflict,
      listFiles,
      openFile,
    }),
    [
      link,
      auth,
      syncing,
      problem,
      linkedElsewhere,
      conflictOpen,
      connect,
      disconnect,
      unlink,
      syncNow,
      saveAsNewFile,
      restoreTrashedFile,
      resolveConflict,
      listFiles,
      openFile,
    ]
  );
}
