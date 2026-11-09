/** Tiny pub/sub toast store so any module (hooks included) can raise a toast without prop drilling. */
let listeners = new Set();
let nextId = 1;

export function subscribeToasts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * @param {{ message: string, actionLabel?: string, onAction?: () => void,
 *   tone?: 'info' | 'success' | 'warning' | 'error', duration?: number }} toast
 * @returns {number} toast id
 */
export function showToast(toast) {
  const id = nextId++;
  listeners.forEach((fn) =>
    fn({ type: 'add', toast: { tone: 'info', duration: 6000, ...toast, id } })
  );
  return id;
}

export function dismissToast(id) {
  listeners.forEach((fn) => fn({ type: 'remove', id }));
}

/** Test helper. */
export function _resetToasts() {
  listeners = new Set();
  nextId = 1;
}
