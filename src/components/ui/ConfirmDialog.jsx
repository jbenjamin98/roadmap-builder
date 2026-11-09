import Modal from './Modal';

const BTN =
  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

/**
 * Generic multi-choice confirmation.
 * actions: [{ label, onClick, variant?: 'primary' | 'danger' | 'neutral', autoFocus?: boolean }]
 */
export default function ConfirmDialog({ title, description, actions, onCancel, testId }) {
  return (
    <Modal title={title} description={description} onClose={onCancel} testId={testId}>
      <div className="flex flex-wrap justify-end gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            data-autofocus={a.autoFocus ? '' : undefined}
            data-testid={a.testId}
            onClick={a.onClick}
            className={`${BTN} ${
              a.variant === 'primary'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-purple-500'
                : a.variant === 'danger'
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-200/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
