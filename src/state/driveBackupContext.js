import { createContext, useContext } from 'react';

/** Holds the value returned by hooks/useDriveBackup (Drive link, sign-in state, sync actions). */
export const DriveBackupContext = createContext(null);

export function useDriveBackupContext() {
  const value = useContext(DriveBackupContext);
  if (!value) throw new Error('useDriveBackupContext must be used inside <DriveBackupProvider>');
  return value;
}
