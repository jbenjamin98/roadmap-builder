import ConfirmDialog from '../ui/ConfirmDialog';
import { formatRelativeTime } from '../../utils/download';

export default function GoogleDriveConflictDialog({
  isOpen,
  remoteMeta,
  onKeepMine,
  onLoadRemote,
  onSaveAsCopy,
  onCancel,
}) {
  if (!isOpen) return null;

  const modifiedText = remoteMeta?.modifiedTime
    ? formatRelativeTime(remoteMeta.modifiedTime)
    : 'recently';

  return (
    <ConfirmDialog
      testId="drive-conflict-dialog"
      title="Google Drive Version Conflict"
      description={`A newer version of this roadmap was saved to Google Drive ${modifiedText}. Saving now would overwrite those changes.`}
      onCancel={onCancel}
      actions={[
        { label: 'Cancel', onClick: onCancel },
        {
          label: 'Save as Copy',
          variant: 'default',
          onClick: onSaveAsCopy,
        },
        {
          label: 'Load Drive Version',
          variant: 'default',
          onClick: onLoadRemote,
        },
        {
          label: 'Overwrite Drive',
          variant: 'danger',
          onClick: onKeepMine,
        },
      ]}
    />
  );
}
