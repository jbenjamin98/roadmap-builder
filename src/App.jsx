import { lazy, Suspense, useEffect, useState } from 'react';
import SmallScreenGuard from './components/SmallScreenGuard';
import CustomCursor from './components/CustomCursor';
import ToastHost from './components/ToastHost';
import RecoveryBanner from './components/backup/RecoveryBanner';
import DraftNoticeDialog from './components/backup/DraftNoticeDialog';
import DriveBackupProvider from './components/backup/DriveBackupProvider';
import ConfirmDialog from './components/ui/ConfirmDialog';
import useRoadmapState from './hooks/useRoadmapState';
import { RoadmapContext } from './state/roadmapContext';
import { hasSeenDraftNotice, markDraftNoticeSeen } from './data/persistence';
import { loadUiThemeMode, saveUiThemeMode } from './data/defaultState';
import { downloadRoadmapJson } from './utils/download';
import { showToast } from './utils/toast';

// Heavy views are code-split so the first paint only loads what the current view needs.
const LandingPage = lazy(() => import('./components/LandingPage'));
const ConfigModal = lazy(() => import('./components/ConfigModal'));
const RoadmapWorkspace = lazy(() => import('./components/RoadmapWorkspace'));

const isEditableTarget = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export default function App() {
  const roadmap = useRoadmapState();
  const {
    roadmapState,
    importRoadmap,
    createRoadmap,
    updateConfig,
    undo,
    redo,
    hasUnbackedChanges,
    markBackedUp,
    recovery,
    restoreBackup,
    dismissRecovery,
  } = roadmap;

  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'workspace'
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [themeMode, setThemeMode] = useState(() => loadUiThemeMode());
  // Set when the user is about to replace an un-backed-up roadmap: { verb, apply }.
  const [pendingReplace, setPendingReplace] = useState(null);
  const [showDraftNotice, setShowDraftNotice] = useState(false);

  // Sync light/dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    saveUiThemeMode(themeMode);
  }, [themeMode]);

  // Preload editor and modal chunks immediately so opening the modal or switching views is instant.
  useEffect(() => {
    import('./components/RoadmapWorkspace');
    import('./components/ConfigModal');
  }, []);

  // Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y. Native undo wins inside text fields.
  useEffect(() => {
    if (currentView !== 'workspace') return undefined;
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || isEditableTarget(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentView, undo, redo]);

  // Warn before leaving only when there is work that exists nowhere but this browser.
  useEffect(() => {
    if (!hasUnbackedChanges) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnbackedChanges]);

  const enterWorkspace = () => {
    setCurrentView('workspace');
    if (!hasSeenDraftNotice()) setShowDraftNotice(true);
  };

  const closeDraftNotice = () => {
    markDraftNoticeSeen();
    setShowDraftNotice(false);
  };

  // View A -> Trigger View B (Blank Configuration Modal)
  const handleTriggerCreateRoadmap = () => {
    setIsCreatingNew(true);
    setIsConfigModalOpen(true);
  };

  const applyImport = (parsedJson) => {
    importRoadmap(parsedJson);
    enterWorkspace();
    showToast({ message: 'Roadmap imported.', tone: 'success' });
  };

  // View A -> Upload JSON creates/updates a roadmap and routes to editor.
  // Replacing work that has no backup asks first, so nothing is lost by accident.
  const handleUploadRoadmapJson = (parsedJson) => {
    if (hasUnbackedChanges)
      setPendingReplace({ verb: 'Importing', apply: () => applyImport(parsedJson) });
    else applyImport(parsedJson);
  };

  // Save Configuration from ConfigModal (View B)
  const finishSaveConfig = (updatedConfig) => {
    if (isCreatingNew) createRoadmap(updatedConfig);
    else updateConfig(updatedConfig);

    setIsConfigModalOpen(false);
    setIsCreatingNew(false);
    enterWorkspace();
  };

  const handleSaveConfig = (updatedConfig) => {
    // A new roadmap replaces the current one and has its own undo history, so ask first.
    if (isCreatingNew && hasUnbackedChanges) {
      setPendingReplace({
        verb: 'Creating a new roadmap',
        apply: () => finishSaveConfig(updatedConfig),
      });
      return;
    }
    finishSaveConfig(updatedConfig);
  };

  return (
    <RoadmapContext.Provider value={roadmap}>
      <DriveBackupProvider>
        <SmallScreenGuard />
        <CustomCursor
          themeMode={themeMode}
          isWorkspace={currentView === 'workspace'}
          roadmapTheme={roadmapState.config?.theme}
        />
        <ToastHost />
        <RecoveryBanner recovery={recovery} onRestore={restoreBackup} onDismiss={dismissRecovery} />
        <Suspense fallback={null}>
          {currentView === 'landing' ? (
            <LandingPage
              onCreateRoadmap={handleTriggerCreateRoadmap}
              onUploadRoadmap={handleUploadRoadmapJson}
              onDriveRoadmapOpened={enterWorkspace}
              continueRoadmap={
                roadmap.persistable ? { name: roadmapState.config?.name, hasUnbackedChanges } : null
              }
              onContinueRoadmap={enterWorkspace}
              themeMode={themeMode}
              onChangeThemeMode={setThemeMode}
            />
          ) : (
            <RoadmapWorkspace
              onOpenConfigModal={() => {
                setIsCreatingNew(false);
                setIsConfigModalOpen(true);
              }}
              onNavigateHome={() => {
                setCurrentView('landing');
              }}
              themeMode={themeMode}
              onChangeThemeMode={setThemeMode}
            />
          )}
        </Suspense>

        <Suspense
          fallback={
            <div
              className="fixed inset-0 z-[200] bg-slate-900/65 dark:bg-slate-950/85 backdrop-blur-md pointer-events-none"
              aria-hidden="true"
            />
          }
        >
          {isConfigModalOpen && (
            <ConfigModal
              key={isCreatingNew ? 'create-blank' : `edit-${roadmapState.id}`}
              isOpen={isConfigModalOpen}
              onClose={() => {
                setIsConfigModalOpen(false);
                setIsCreatingNew(false);
              }}
              initialConfig={isCreatingNew ? null : roadmapState.config}
              onSaveConfig={handleSaveConfig}
              isCreatingNew={isCreatingNew}
            />
          )}
        </Suspense>

        {showDraftNotice && currentView === 'workspace' && (
          <DraftNoticeDialog
            onContinue={closeDraftNotice}
            onDownload={() => {
              downloadRoadmapJson(roadmapState);
              markBackedUp('download');
              closeDraftNotice();
            }}
          />
        )}

        {pendingReplace && (
          <ConfirmDialog
            testId="import-confirm"
            title="Replace your current roadmap?"
            description={`Your current roadmap has changes that are not backed up. ${pendingReplace.verb} replaces it.`}
            onCancel={() => setPendingReplace(null)}
            actions={[
              { label: 'Cancel', onClick: () => setPendingReplace(null) },
              {
                label: 'Replace anyway',
                variant: 'danger',
                testId: 'import-replace-btn',
                onClick: () => {
                  const { apply } = pendingReplace;
                  setPendingReplace(null);
                  apply();
                },
              },
              {
                label: 'Download current, then replace',
                variant: 'primary',
                autoFocus: true,
                testId: 'import-backup-replace-btn',
                onClick: () => {
                  const { apply } = pendingReplace;
                  downloadRoadmapJson(roadmapState);
                  markBackedUp('download');
                  setPendingReplace(null);
                  apply();
                },
              },
            ]}
          />
        )}
      </DriveBackupProvider>
    </RoadmapContext.Provider>
  );
}
