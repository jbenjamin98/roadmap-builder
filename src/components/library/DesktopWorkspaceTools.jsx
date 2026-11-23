import { useEffect, useState } from 'react';
import { desktop, isDesktop } from '../../storage/desktop';
import { OPEN_SAVE_VERSION, OPEN_VERSION_HISTORY } from '../../storage/desktopEvents';
import { useDesktopMenu } from '../../hooks/useDesktopEvents';
import { useRoadmap } from '../../state/roadmapContext';
import { showToast } from '../../utils/toast';
import SaveVersionDialog from './SaveVersionDialog';
import VersionHistoryDialog from './VersionHistoryDialog';

/**
 * Desktop only. Owns the version dialogs and the workspace-level native menu actions (Save
 * Version, Version History, Export). The backup chip opens the same dialogs via window events.
 */
export default function DesktopWorkspaceTools({ onOpenExport }) {
  const { roadmapState, importRoadmap, flushNow, persistable } = useRoadmap();
  const [dialog, setDialog] = useState(null); // 'save' | 'history' | null

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

  useEffect(() => {
    if (!isDesktop) return undefined;
    const save = () => open('save');
    const history = () => open('history');
    window.addEventListener(OPEN_SAVE_VERSION, save);
    window.addEventListener(OPEN_VERSION_HISTORY, history);
    return () => {
      window.removeEventListener(OPEN_SAVE_VERSION, save);
      window.removeEventListener(OPEN_VERSION_HISTORY, history);
    };
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
