import { desktop, isDesktop } from '../../storage/desktop';
import { useDesktopMenu } from '../../hooks/useDesktopEvents';
import { useRoadmap } from '../../state/roadmapContext';
import { showToast } from '../../utils/toast';
import SaveVersionDialog from './SaveVersionDialog';
import VersionHistoryDialog from './VersionHistoryDialog';

/**
 * Desktop only. Renders the version dialogs and handles the workspace-level native menu actions
 * (Save Version, Version History, Export). The workspace owns `dialog` ('save' | 'history' | null)
 * so its header Versions button can open the same dialogs.
 */
export default function DesktopWorkspaceTools({ dialog, setDialog, onOpenExport }) {
  const { roadmapState, importRoadmap, flushNow, persistable } = useRoadmap();

  const open = (which) => {
    if (!persistable) {
      showToast({ message: 'Make a change first. Untouched samples are not saved.', tone: 'info' });
      return;
    }
    setDialog(which);
  };

  useDesktopMenu({
    'save-version': () => open('save'),
    'version-history': () => open('history'),
    export: () => onOpenExport(),
  });

  if (!isDesktop || !dialog) return null;

  if (dialog === 'save') {
    return (
      <SaveVersionDialog
        onClose={() => setDialog(null)}
        onSave={async ({ label, pinned }) => {
          try {
            await flushNow(); // versions are cut from the saved file, so make sure it is current
            await desktop.versions.create(roadmapState.id, { label, pinned });
            showToast({
              message: pinned ? 'Master version saved.' : 'Version saved.',
              tone: 'success',
            });
            setDialog(null);
          } catch (err) {
            showToast({ message: `Could not save version: ${err?.message || err}`, tone: 'error' });
          }
        }}
      />
    );
  }

  return (
    <VersionHistoryDialog
      roadmapId={roadmapState.id}
      onClose={() => setDialog(null)}
      onSaveVersion={() => setDialog('save')}
      onRestore={(state) => {
        importRoadmap(state);
        showToast({ message: 'Version restored. Undo is available.', tone: 'success' });
      }}
      onOpenCopy={(state) => {
        importRoadmap({
          ...state,
          id: undefined,
          config: { ...state.config, name: `${state.config?.name || 'Roadmap'} (restored copy)` },
        });
        showToast({ message: 'Opened that version as a new roadmap.', tone: 'success' });
      }}
    />
  );
}
