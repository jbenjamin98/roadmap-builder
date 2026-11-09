/**
 * Single place that turns the hook's backup flags into one visible chip state:
 * draft-failing > syncing (uploading to Drive) > attention (Drive needs the user) > sample >
 * not-backed-up > backed-up.
 */
export function getBackupState({
  persistable,
  hasUnbackedChanges,
  saveError,
  driveSyncing = false,
  driveAttention = false,
}) {
  if (saveError) return 'draft-failing';
  if (driveSyncing) return 'syncing';
  if (driveAttention) return 'attention';
  if (!persistable) return 'sample';
  if (hasUnbackedChanges) return 'not-backed-up';
  return 'backed-up';
}
