import { useEffect, useRef } from 'react';
import { desktop, isDesktop } from '../storage/desktop';
import { showToast } from '../utils/toast';

/**
 * Subscribes to native menu actions. `handlers` maps an action name (e.g. 'new', 'export') to a
 * function; actions without a handler here are ignored so several components can each own some.
 * A no-op on the web.
 */
export function useDesktopMenu(handlers) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });
  useEffect(() => {
    if (!isDesktop) return undefined;
    return desktop.onMenu((action) => ref.current[action]?.());
  }, []);
}

/** Turns auto-update status from the desktop shell into toasts. A no-op on the web. */
export function useDesktopUpdates() {
  useEffect(() => {
    if (!isDesktop) return undefined;
    return desktop.onUpdate((info) => {
      if (info.kind === 'downloading') {
        showToast({ message: `Downloading update ${info.version}…`, tone: 'info' });
      } else if (info.kind === 'ready') {
        showToast({
          message: `Version ${info.version} is ready. It installs when you quit, or restart now.`,
          actionLabel: 'Restart now',
          onAction: () => desktop.installUpdate(),
          tone: 'success',
          duration: 30000,
        });
      } else if (info.kind === 'available') {
        showToast({
          message: `Version ${info.version} is available.`,
          actionLabel: 'Download',
          onAction: () => desktop.openReleasePage(),
          tone: 'info',
          duration: 30000,
        });
      }
    });
  }, []);
}
