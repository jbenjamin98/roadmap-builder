import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain, Menu, net, protocol, session, shell } from 'electron';
import { isInside } from './lib/fileNames.js';
import { createLibrary } from './lib/libraryStore.js';
import { createVersionStore } from './lib/versionStore.js';
import { getLibraryDir, readSettings, writeSettings } from './settings.js';
import { buildMenu } from './menu.js';
import { initUpdater } from './updater.js';

const RELEASE_URL = 'https://github.com/jbenjamin98/roadmap-builder/releases/latest';
const EXTERNAL_ALLOWLIST = ['https://github.com/jbenjamin98/', 'https://jacob-benjamin.com'];
const DEV_URL = process.env.ELECTRON_RENDERER_URL || '';
const isDev = !app.isPackaged;
const MAX_EXPORT_BYTES = 256 * 1024 * 1024;

// Serve the built app from app://roadmap/ (a real origin, so storage, fetch and the CSP behave
// exactly like the hosted site, which file:// does not allow).
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

// Tests point the profile at a throwaway folder so they never touch real settings.
if (process.env.ROADMAP_USER_DATA) app.setPath('userData', process.env.ROADMAP_USER_DATA);

const makeId = () => `rm-${crypto.randomUUID()}`;
const distDir = () => path.join(app.getAppPath(), 'dist');

const library = createLibrary({
  getDir: getLibraryDir,
  trash: (file) => shell.trashItem(file),
});
const versions = createVersionStore({ getDir: getLibraryDir });

/** @type {BrowserWindow | null} */
let mainWindow = null;
let lastSaved = null; // the roadmap most recently written, for the closing snapshot
let updater = { install: () => {} };

const send = (channel, payload) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, payload);
};

/** IPC is only honoured from our own pages. */
function assertTrusted(event) {
  const url = event.senderFrame?.url || '';
  const ok = url.startsWith('app://roadmap/') || (DEV_URL && url.startsWith(DEV_URL));
  if (!ok) throw new Error('Untrusted sender.');
}

const handle = (channel, fn) =>
  ipcMain.handle(`desktop:${channel}`, async (event, ...args) => {
    assertTrusted(event);
    return fn(event, ...args);
  });

async function chooseLibraryFolder() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose your roadmap library folder',
    defaultPath: getLibraryDir(),
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || !result.filePaths[0]) return null;
  writeSettings({ libraryDir: result.filePaths[0] });
  await library.ensureDir();
  send('desktop:menu', 'library-changed');
  return result.filePaths[0];
}

async function openLibraryFolder() {
  await library.ensureDir();
  await shell.openPath(getLibraryDir());
}

function registerIpc() {
  handle('app-info', () => ({ version: app.getVersion(), platform: process.platform }));

  handle('library-path', () => getLibraryDir());
  handle('library-choose-folder', () => chooseLibraryFolder());
  handle('library-open-folder', () => openLibraryFolder());
  handle('library-list', () => library.list());
  handle('library-read', (_e, id) => library.read(id));
  handle('library-save', async (_e, state) => {
    const result = await library.save(state);
    lastSaved = state;
    versions
      .maybeAutoSnapshot(state.id, state)
      .catch((err) => console.warn('Snapshot failed:', err));
    return result;
  });
  handle('library-remove', (_e, id) => library.remove(id));
  handle('library-duplicate', (_e, id) => library.duplicate(id, makeId));
  handle('library-reveal', async (_e, id) => {
    const file = await library.fileForId(id);
    if (file) shell.showItemInFolder(file);
  });
  handle('library-import-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import a roadmap file',
      filters: [{ name: 'Roadmap JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const stat = await fs.stat(result.filePaths[0]);
    if (stat.size > 50 * 1024 * 1024) throw new Error('That file is larger than the 50 MB limit.');
    return JSON.parse(await fs.readFile(result.filePaths[0], 'utf8'));
  });

  handle('versions-list', (_e, id) => versions.list(id));
  handle('versions-create', async (_e, id, opts) => {
    const state = await library.read(id);
    return versions.create(id, state, {
      label: String(opts?.label ?? '').slice(0, 120),
      pinned: Boolean(opts?.pinned),
    });
  });
  handle('versions-read', (_e, id, versionId) => versions.read(id, versionId));
  handle('versions-restore', async (_e, id, versionId) => {
    // Keep what is there now so a restore can itself be undone from the history list.
    const current = await library.read(id).catch(() => null);
    if (current) await versions.maybeAutoSnapshot(id, current, { force: true });
    return versions.read(id, versionId);
  });
  handle('versions-update', (_e, id, versionId, patch) => versions.update(id, versionId, patch));
  handle('versions-remove', (_e, id, versionId) => versions.remove(id, versionId));

  handle('save-file', async (_e, { suggestedName, data }) => {
    const bytes = Buffer.from(data);
    if (bytes.length > MAX_EXPORT_BYTES) throw new Error('Export is too large to save.');
    const ext = path
      .extname(String(suggestedName || ''))
      .replace('.', '')
      .toLowerCase();
    const settings = readSettings();
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.join(
        settings.lastExportDir || app.getPath('documents'),
        path.basename(String(suggestedName || 'roadmap'))
      ),
      filters: ext ? [{ name: ext.toUpperCase(), extensions: [ext] }] : [],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    await fs.writeFile(result.filePath, bytes);
    writeSettings({ lastExportDir: path.dirname(result.filePath) });
    return { canceled: false, file: result.filePath };
  });

  handle('print-pdf', async (event, { suggestedName }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const pdf = await event.sender.printToPDF({ printBackground: true, preferCSSPageSize: true });
    const result = await dialog.showSaveDialog(win, {
      defaultPath: path.join(
        readSettings().lastExportDir || app.getPath('documents'),
        path.basename(String(suggestedName || 'roadmap.pdf'))
      ),
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    await fs.writeFile(result.filePath, pdf);
    writeSettings({ lastExportDir: path.dirname(result.filePath) });
    return { canceled: false, file: result.filePath };
  });

  handle('install-update', () => updater.install());
  handle('open-release-page', () => shell.openExternal(RELEASE_URL));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#0b0f19',
    title: 'Roadmap Builder Studio',
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  mainWindow = win;
  win.once('ready-to-show', () => win.show());

  // Keep the app on its own origin; send external links to the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('app://roadmap/')) return { action: 'allow' };
    if (EXTERNAL_ALLOWLIST.some((prefix) => url.startsWith(prefix))) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('app://roadmap/') && !(DEV_URL && url.startsWith(DEV_URL))) {
      event.preventDefault();
    }
  });

  // Let the page flush its autosave, then take a closing snapshot, before the window goes away.
  let closing = false;
  win.on('close', (event) => {
    if (closing) return;
    event.preventDefault();
    closing = true;
    let finished = false;
    const finish = async () => {
      if (finished) return;
      finished = true;
      if (lastSaved) {
        await versions.maybeAutoSnapshot(lastSaved.id, lastSaved, { force: true }).catch(() => {});
      }
      win.destroy();
    };
    ipcMain.once('desktop:flushed', finish);
    win.webContents.send('desktop:before-close');
    setTimeout(finish, 2000);
  });
  win.on('closed', () => {
    if (mainWindow === win) mainWindow = null;
  });

  win.loadURL(DEV_URL || 'app://roadmap/index.html');
  return win;
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    protocol.handle('app', (request) => {
      const { pathname } = new URL(request.url);
      const relative = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
      const file = path.join(distDir(), relative);
      if (!isInside(distDir(), file)) return new Response('Forbidden', { status: 403 });
      return net.fetch(pathToFileURL(file).toString());
    });

    // The app needs no device permissions; refuse them all.
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) =>
      callback(false)
    );

    registerIpc();
    await library.ensureDir().catch((err) => console.warn('Library folder unavailable:', err));
    Menu.setApplicationMenu(
      buildMenu({
        send: (action) => send('desktop:menu', action),
        chooseLibraryFolder,
        openLibraryFolder,
        isDev,
      })
    );
    createWindow();
    updater = initUpdater({
      releaseUrl: RELEASE_URL,
      notify: (payload) => send('desktop:update', payload),
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
