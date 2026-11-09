import { validateRoadmapImport } from '../data/roadmapSchema';

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

const getWin = () => /** @type {any} */ (window);

export async function verifyPermission(fileHandle, readWrite = true) {
  const options = { mode: readWrite ? 'readwrite' : 'read' };
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export async function pickLocalFileToSave(suggestedName = 'roadmap.json') {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser.');
  }

  const handle = await getWin().showSaveFilePicker({
    suggestedName,
    types: [
      {
        description: 'Roadmap JSON File',
        accept: { 'application/json': ['.json'] },
      },
    ],
  });

  return handle;
}

export async function pickLocalFileToOpen() {
  if (typeof window === 'undefined' || !('showOpenFilePicker' in window)) {
    throw new Error('File System Access API is not supported in this browser.');
  }

  const [handle] = await getWin().showOpenFilePicker({
    types: [
      {
        description: 'Roadmap JSON File',
        accept: { 'application/json': ['.json'] },
      },
    ],
    multiple: false,
  });

  const file = await handle.getFile();
  const text = await file.text();
  const parsed = JSON.parse(text);
  const result = validateRoadmapImport(parsed);
  if (!result.ok) {
    throw new Error(/** @type {any} */ (result).error);
  }

  return { handle, data: parsed, fileName: file.name };
}

export async function writeRoadmapToHandle(handle, roadmapState) {
  const hasPermission = await verifyPermission(handle, true);
  if (!hasPermission) {
    throw new Error('Permission to write to the file was not granted.');
  }

  const writable = await handle.createWritable();
  const content = JSON.stringify(roadmapState, null, 2);
  await writable.write(content);
  await writable.close();
}

export async function readRoadmapFromHandle(handle) {
  const hasPermission = await verifyPermission(handle, false);
  if (!hasPermission) {
    throw new Error('Permission to read the file was not granted.');
  }

  const file = await handle.getFile();
  const text = await file.text();
  const parsed = JSON.parse(text);
  const result = validateRoadmapImport(parsed);
  if (!result.ok) {
    throw new Error(/** @type {any} */ (result).error);
  }

  return { data: parsed, fileName: file.name };
}
