/** Lets the settings modal preview its draft canvas theme on the custom cursor before it is applied. */
const EVENT = 'roadmap-cursor-theme';

export function publishCursorTheme(theme) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: theme }));
}

export function subscribeCursorTheme(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
