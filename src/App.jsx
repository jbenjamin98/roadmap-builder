import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import SmallScreenGuard from './components/SmallScreenGuard';
import CustomCursor from './components/CustomCursor';
import ToastHost from './components/ToastHost';
import RecoveryBanner from './components/backup/RecoveryBanner';
import ConfirmDialog from './components/ui/ConfirmDialog';
import ConfigModal from './components/ConfigModal';
import useRoadmapState from './hooks/useRoadmapState';
import { RoadmapContext } from './state/roadmapContext';
import { loadUiThemeMode, saveUiThemeMode } from './data/defaultState';
import LibraryModal from './components/library/LibraryModal';
import { validateRoadmapImport } from './data/roadmapSchema';
import { useDesktopMenu, useDesktopUpdates } from './hooks/useDesktopEvents';
import { desktop, isDesktop } from './storage/desktop';
import { downloadRoadmapJson } from './utils/download';
import { showToast } from './utils/toast';

// Heavy views are code-split so the first paint only loads what the current view needs.
const LandingPage = lazy(() => import('./components/LandingPage'));
const RoadmapWorkspace = lazy(() => import('./components/RoadmapWorkspace'));

const isEditableTarget = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export default function App() {
  const roadmap = useRoadmapState();
  const {
    roadmapState,
    importRoadmap,
    openRoadmapFile,
    createRoadmap,
    updateConfig,
    undo,
    redo,
    recovery,
    restoreBackup,
    dismissRecovery,
  } = roadmap;

  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'workspace'
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [themeMode, setThemeMode] = useState(() => loadUiThemeMode());
  // Web only: set when the user is about to replace the roadmap held in the browser draft.
  const [pendingReplace, setPendingReplace] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false); // desktop only

  // Sync light/dark class on <html> synchronously before paint to prevent theme lag
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    saveUiThemeMode(themeMode);
  }, [themeMode]);

  // Preload editor chunk immediately so switching views is instant.
  useEffect(() => {
    import('./components/RoadmapWorkspace');
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

  const enterWorkspace = () => {
    setCurrentView('workspace');
  };

  // The web draft lives only in this browser, so replacing it asks first. The desktop app saves
  // every roadmap to its own file (and keeps version history), so it never needs to ask.
  const confirmReplace = (verb, apply) => {
    if (!isDesktop && roadmap.persistable) setPendingReplace({ verb, apply });
    else apply();
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
  // Replacing the web draft asks first, so nothing is lost by accident (see confirmReplace).
  const handleUploadRoadmapJson = async (parsedJson) => {
    let json = parsedJson;
    if (isDesktop && json.id) {
      // A file from outside the library must never overwrite a library roadmap that shares its id
      // (an old export, a copy someone sent): give it a new id so it lands beside the original.
      try {
        const { items } = await desktop.library.list();
        if (items.some((item) => item.id === json.id)) json = { ...json, id: undefined };
      } catch {
        /* library unreadable: autosave will report it */
      }
    }
    confirmReplace('Importing', () => applyImport(json));
  };

  // ---- Desktop library ----
  const openFromLibrary = async (id) => {
    try {
      await roadmap.flushNow();
      const json = await desktop.library.read(id);
      openRoadmapFile(json);
      setShowLibrary(false);
      enterWorkspace();
    } catch (err) {
      showToast({ message: `Could not open roadmap: ${err?.message || err}`, tone: 'error' });
    }
  };

  const importFileFromDisk = async () => {
    try {
      const json = await desktop.library.importFile();
      if (!json) return;
      const result = validateRoadmapImport(json);
      if (!result.ok) {
        showToast({ message: result.error, tone: 'error' });
        return;
      }
      setShowLibrary(false);
      await handleUploadRoadmapJson(json);
    } catch (err) {
      showToast({ message: `Could not import file: ${err?.message || err}`, tone: 'error' });
    }
  };

  useDesktopUpdates();
  useDesktopMenu({
    new: () => handleTriggerCreateRoadmap(),
    'open-library': () => setShowLibrary(true),
    'open-file': () => importFileFromDisk(),
  });

  // Save Configuration from ConfigModal (View B)
  const finishSaveConfig = (updatedConfig) => {
    if (isCreatingNew) createRoadmap(updatedConfig);
    else updateConfig(updatedConfig);

    setIsConfigModalOpen(false);
    setIsCreatingNew(false);
    enterWorkspace();
  };

  const handleSaveConfig = (updatedConfig) => {
    // A new roadmap replaces the current one and has its own undo history, so ask first (web).
    if (isCreatingNew)
      confirmReplace('Creating a new roadmap', () => finishSaveConfig(updatedConfig));
    else finishSaveConfig(updatedConfig);
  };

  return (
    <RoadmapContext.Provider value={roadmap}>
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
            onOpenLibrary={isDesktop ? () => setShowLibrary(true) : undefined}
            continueRoadmap={roadmap.persistable ? { name: roadmapState.config?.name } : null}
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

      {isDesktop && showLibrary && (
        <LibraryModal
          currentId={roadmap.persistable ? roadmapState.id : null}
          onClose={() => setShowLibrary(false)}
          onOpen={openFromLibrary}
          onImportFile={importFileFromDisk}
        />
      )}

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

      {pendingReplace && (
        <ConfirmDialog
          testId="import-confirm"
          title="Replace your current roadmap?"
          description={`Your current roadmap is only stored as a draft in this browser. ${pendingReplace.verb} replaces it.`}
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
              label: 'Export current, then replace',
              variant: 'primary',
              autoFocus: true,
              testId: 'import-backup-replace-btn',
              onClick: () => {
                const { apply } = pendingReplace;
                downloadRoadmapJson(roadmapState);
                setPendingReplace(null);
                apply();
              },
            },
          ]}
        />
      )}
    </RoadmapContext.Provider>
  );
}
