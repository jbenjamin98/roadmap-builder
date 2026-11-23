// Sandboxed preload: the only bridge between the web app and the main process.
// Exposes a narrow, promise-based API as `window.desktop`; no Node or Electron objects leak.
const { contextBridge, ipcRenderer } = require('electron');

const call =
  (channel) =>
  (...args) =>
    ipcRenderer.invoke(`desktop:${channel}`, ...args);

const subscribe = (channel, cb) => {
  const handler = (_event, payload) => cb(payload);
  ipcRenderer.on(`desktop:${channel}`, handler);
  return () => ipcRenderer.removeListener(`desktop:${channel}`, handler);
};

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  appInfo: call('app-info'),

  library: {
    getPath: call('library-path'),
    chooseFolder: call('library-choose-folder'),
    openFolder: call('library-open-folder'),
    list: call('library-list'),
    read: call('library-read'),
    save: call('library-save'),
    remove: call('library-remove'),
    duplicate: call('library-duplicate'),
    importFile: call('library-import-file'),
    reveal: call('library-reveal'),
  },

  versions: {
    list: call('versions-list'),
    create: call('versions-create'),
    read: call('versions-read'),
    restore: call('versions-restore'),
    update: call('versions-update'),
    remove: call('versions-remove'),
  },

  saveFile: call('save-file'),
  printToPdf: call('print-pdf'),

  installUpdate: call('install-update'),
  openReleasePage: call('open-release-page'),

  onMenu: (cb) => subscribe('menu', cb),
  onUpdate: (cb) => subscribe('update', cb),
  /** `handler` may return a promise; the window waits for it (max ~2s) before closing. */
  onBeforeClose: (handler) => {
    const listener = async () => {
      try {
        await handler();
      } finally {
        ipcRenderer.send('desktop:flushed');
      }
    };
    ipcRenderer.on('desktop:before-close', listener);
    return () => ipcRenderer.removeListener('desktop:before-close', listener);
  },
});
