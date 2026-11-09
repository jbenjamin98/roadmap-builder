import useDriveBackup from '../../hooks/useDriveBackup';
import { DriveBackupContext } from '../../state/driveBackupContext';
import GoogleDriveConflictDialog from './GoogleDriveConflictDialog';

/** Owns Drive backup state for the whole app so the chip, banner and dialogs share one source. */
export default function DriveBackupProvider({ children }) {
  const drive = useDriveBackup();
  const conflict = drive.problem?.kind === 'conflict' && drive.conflictOpen;

  return (
    <DriveBackupContext.Provider value={drive}>
      {children}
      {conflict && (
        <GoogleDriveConflictDialog
          isOpen
          remoteMeta={drive.problem.remoteMeta}
          onKeepMine={() => drive.resolveConflict('mine')}
          onLoadRemote={() => drive.resolveConflict('theirs')}
          onSaveAsCopy={() => drive.resolveConflict('copy')}
          onCancel={() => drive.setConflictOpen(false)}
        />
      )}
    </DriveBackupContext.Provider>
  );
}
