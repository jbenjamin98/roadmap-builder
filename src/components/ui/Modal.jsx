import { useId, useRef } from 'react';
import useDialogBehavior from '../../hooks/useDialogBehavior';

/**
 * Accessible modal shell: role="dialog", aria-modal, labelled title, Escape to close, focus trap,
 * and focus restoration. Content is centred over a dimmed backdrop.
 */
export default function Modal({
  title,
  description,
  onClose,
  children,
  closeOnBackdrop = true,
  widthClass = 'max-w-md',
  testId,
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useDialogBehavior(panelRef, onClose);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/80"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-testid={testId}
        className={`w-full ${widthClass} max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl outline-none dark:border-slate-700 dark:bg-slate-900 sm:p-6`}
      >
        <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
