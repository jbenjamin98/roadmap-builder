/**
 * Single place that turns the hook's backup flags into one visible chip state:
 * draft-failing > sample > not-backed-up > backed-up.
 */
export function getBackupState({ persistable, hasUnbackedChanges, saveError }) {
  if (saveError) return 'draft-failing';
  if (!persistable) return 'sample';
  if (hasUnbackedChanges) return 'not-backed-up';
  return 'backed-up';
}
