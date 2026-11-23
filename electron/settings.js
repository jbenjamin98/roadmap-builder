import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';

const file = () => path.join(app.getPath('userData'), 'settings.json');

export function readSettings() {
  try {
    const parsed = JSON.parse(fs.readFileSync(file(), 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeSettings(patch) {
  const next = { ...readSettings(), ...patch };
  fs.mkdirSync(path.dirname(file()), { recursive: true });
  fs.writeFileSync(file(), JSON.stringify(next, null, 2), 'utf8');
  return next;
}

/** The roadmap library folder: the user's choice, else `Documents/Roadmaps`. */
export function getLibraryDir() {
  // ROADMAP_LIBRARY_DIR lets tests (and portable setups) pin the folder without touching settings.
  const chosen = process.env.ROADMAP_LIBRARY_DIR || readSettings().libraryDir;
  return typeof chosen === 'string' && chosen
    ? chosen
    : path.join(app.getPath('documents'), 'Roadmaps');
}
