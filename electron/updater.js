import { app } from 'electron';
import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;

/**
 * Checks GitHub Releases for a newer version.
 *
 * Builds are unsigned, so macOS cannot install updates by itself: there the user is told a new
 * version exists and pointed at the release page. Windows and Linux AppImage download and install
 * on quit (unsigned updates still work there).
 * @param {{ notify: (payload: object) => void, releaseUrl: string }} deps
 */
export function initUpdater({ notify, releaseUrl }) {
  if (!app.isPackaged) return { install: () => {} };

  const canAutoInstall =
    process.platform === 'win32' || (process.platform === 'linux' && Boolean(process.env.APPIMAGE));
  autoUpdater.autoDownload = canAutoInstall;
  autoUpdater.autoInstallOnAppQuit = canAutoInstall;

  autoUpdater.on('update-available', (info) => {
    notify({
      kind: canAutoInstall ? 'downloading' : 'available',
      version: info.version,
      releaseUrl,
    });
  });
  autoUpdater.on('update-downloaded', (info) => {
    notify({ kind: 'ready', version: info.version });
  });
  autoUpdater.on('error', (err) => {
    console.warn('Update check failed:', err?.message || err);
  });

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  setTimeout(check, 8000);
  setInterval(check, 6 * 60 * 60 * 1000);

  return { install: () => autoUpdater.quitAndInstall() };
}
