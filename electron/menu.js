import { Menu } from 'electron';

/**
 * Native menu. Menu items that need the app (new, open, versions, export) are forwarded to the
 * renderer as action names. Undo/redo use the native roles so text fields keep working; the app's
 * own Ctrl+Z handler covers the canvas, so nothing fires twice.
 * @param {{ send: (action: string) => void, chooseLibraryFolder: () => void, openLibraryFolder: () => void, isDev: boolean }} deps
 */
export function buildMenu({ send, chooseLibraryFolder, openLibraryFolder, isDev }) {
  const mac = process.platform === 'darwin';
  const template = [
    ...(mac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New Roadmap…', accelerator: 'CmdOrCtrl+N', click: () => send('new') },
        {
          label: 'Open from Library…',
          accelerator: 'CmdOrCtrl+O',
          click: () => send('open-library'),
        },
        { label: 'Import Roadmap File…', click: () => send('open-file') },
        { type: 'separator' },
        { label: 'Save Version…', accelerator: 'CmdOrCtrl+S', click: () => send('save-version') },
        {
          label: 'Version History…',
          accelerator: 'CmdOrCtrl+Shift+H',
          click: () => send('version-history'),
        },
        { type: 'separator' },
        { label: 'Export…', accelerator: 'CmdOrCtrl+E', click: () => send('export') },
        { type: 'separator' },
        { label: 'Change Library Folder…', click: chooseLibraryFolder },
        { label: 'Show Library Folder', click: openLibraryFolder },
        { type: 'separator' },
        mac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ type: 'separator' }, { role: 'reload' }, { role: 'toggleDevTools' }] : []),
      ],
    },
    { role: 'windowMenu' },
  ];
  return Menu.buildFromTemplate(template);
}
