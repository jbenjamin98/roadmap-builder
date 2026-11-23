/**
 * Bridge to the Electron shell. `window.desktop` only exists inside the desktop app (injected by
 * electron/preload.cjs); on the hosted web version both exports are falsy and every caller keeps
 * its browser behaviour (localStorage drafts, file downloads, window.print).
 */
export const desktop = typeof window !== 'undefined' ? window.desktop : undefined;
export const isDesktop = Boolean(desktop?.isDesktop);
