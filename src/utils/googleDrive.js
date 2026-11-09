import { validateRoadmapImport } from '../data/roadmapSchema';
import { DriveError, getStoredAccessToken, setStoredAccessToken } from './googleAuth';

export {
  DriveError,
  fetchUserProfile,
  getStoredAccessToken,
  getStoredUserProfile,
  setStoredAccessToken,
  setStoredUserProfile,
  signInWithGoogle,
  signOutGoogle,
} from './googleAuth';

const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'Roadmap Builder';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const APP_ID = 'roadmap-builder';
const FILE_FIELDS = 'id,name,headRevisionId,modifiedTime';

/**
 * Authenticated fetch that turns every failure into a typed {@link DriveError}, so callers (and the
 * UI) can tell "sign in again" from "file deleted" from "offline".
 * @param {string} url
 * @param {RequestInit} [init]
 */
async function driveFetch(url, init = {}) {
  const token = getStoredAccessToken();
  if (!token) throw new DriveError('not_signed_in', 'Not signed into Google Drive.');

  let res;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new DriveError('network', 'Could not reach Google Drive. Check your connection.');
  }
  if (res.ok) return res;

  if (res.status === 401) {
    setStoredAccessToken(null);
    throw new DriveError(
      'auth_expired',
      'Your Google sign-in expired. Reconnect to continue.',
      401
    );
  }
  if (res.status === 404) {
    throw new DriveError('not_found', 'That file no longer exists in Google Drive.', 404);
  }
  if (res.status === 403) {
    throw new DriveError('forbidden', 'Google Drive denied access to that file.', 403);
  }
  throw new DriveError('http', `Google Drive request failed (${res.status}).`, res.status);
}

const jsonInit = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

function buildMultipart(metadata, content) {
  const boundary = '-------RoadmapBuilderBoundary' + Math.random().toString(36).substring(2);
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    '\r\n' +
    `--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    content +
    '\r\n' +
    `--${boundary}--`;
  return { body, contentType: `multipart/related; boundary=${boundary}` };
}

export async function getFileMetadata(fileId) {
  const res = await driveFetch(
    `${API}/files/${fileId}?fields=${FILE_FIELDS},trashed,parents,appProperties`
  );
  return res.json();
}

/** Finds the visible "Roadmap Builder" folder this app created, or creates it. */
async function findOrCreateAppFolder() {
  const q = encodeURIComponent(
    `mimeType='${FOLDER_MIME}' and trashed=false and appProperties has { key='roadmapBuilderFolder' and value='1' }`
  );
  const found = await driveFetch(`${API}/files?q=${q}&fields=files(id)&pageSize=1`);
  const existing = (await found.json()).files?.[0]?.id;
  if (existing) return existing;

  const created = await driveFetch(
    `${API}/files?fields=id`,
    jsonInit('POST', {
      name: FOLDER_NAME,
      mimeType: FOLDER_MIME,
      appProperties: { roadmapBuilderFolder: '1' },
    })
  );
  return (await created.json()).id;
}

const appPropertiesFor = (roadmapState) => ({
  app: APP_ID,
  roadmapId: String(roadmapState?.id ?? ''),
  schemaVersion: String(roadmapState?.version ?? ''),
});

/**
 * Creates or updates the roadmap's Drive file. Files are tracked by id (never by name or path), so
 * renaming or moving them in Drive keeps working.
 *
 * Resolves to one of:
 *  - `{ success, fileId, headRevisionId, modifiedTime, fileName }`
 *  - `{ conflict: true, remoteMeta }`   someone else changed the file since we last saw it
 *  - `{ problem: 'trashed' | 'missing', remoteMeta? }`   the linked file is in the Trash / gone
 * Anything else (offline, signed out, ...) rejects with a {@link DriveError}.
 */
export async function saveToGoogleDrive({ fileId, name, roadmapState, currentHeadRevisionId }) {
  if (!getStoredAccessToken())
    throw new DriveError('not_signed_in', 'Not signed into Google Drive.');

  const fileName = name.endsWith('.json') ? name : `${name}.json`;
  const content = JSON.stringify(roadmapState, null, 2);
  const appProperties = appPropertiesFor(roadmapState);

  if (fileId) {
    let meta;
    try {
      meta = await getFileMetadata(fileId);
    } catch (err) {
      if (err instanceof DriveError && (err.code === 'not_found' || err.code === 'forbidden')) {
        return { problem: 'missing' };
      }
      throw err;
    }
    if (meta.trashed) return { problem: 'trashed', remoteMeta: meta };
    if (
      currentHeadRevisionId &&
      meta.headRevisionId &&
      meta.headRevisionId !== currentHeadRevisionId
    ) {
      return { conflict: true, remoteMeta: meta };
    }

    // One request updates the content, the name (renames follow the roadmap) and the tags.
    const { body, contentType } = buildMultipart({ name: fileName, appProperties }, content);
    const res = await driveFetch(
      `${UPLOAD}/files/${fileId}?uploadType=multipart&fields=${FILE_FIELDS}`,
      { method: 'PATCH', headers: { 'Content-Type': contentType }, body }
    );
    const updated = await res.json();
    return {
      success: true,
      fileId,
      headRevisionId: updated.headRevisionId,
      modifiedTime: updated.modifiedTime,
      fileName,
    };
  }

  // New file: put it in the visible "Roadmap Builder" folder. If the folder cannot be made we still
  // save to My Drive rather than failing the backup.
  let parents;
  try {
    parents = [await findOrCreateAppFolder()];
  } catch (err) {
    if (
      err instanceof DriveError &&
      ['auth_expired', 'not_signed_in', 'network'].includes(err.code)
    ) {
      throw err;
    }
  }

  const { body, contentType } = buildMultipart(
    {
      name: fileName,
      mimeType: 'application/json',
      description: 'Roadmap created with Roadmap Builder Studio',
      appProperties,
      ...(parents ? { parents } : {}),
    },
    content
  );
  const res = await driveFetch(`${UPLOAD}/files?uploadType=multipart&fields=${FILE_FIELDS}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });
  const created = await res.json();
  return {
    success: true,
    fileId: created.id,
    headRevisionId: created.headRevisionId,
    modifiedTime: created.modifiedTime,
    fileName: created.name,
  };
}

export async function loadFromGoogleDrive(fileId) {
  const meta = await getFileMetadata(fileId);
  if (meta.trashed) {
    throw new DriveError('trashed', 'This file is in the Google Drive Trash.');
  }
  const contentRes = await driveFetch(`${API}/files/${fileId}?alt=media`);
  const parsed = await contentRes.json();
  const validation = validateRoadmapImport(parsed);
  if (!validation.ok) {
    throw new Error(/** @type {any} */ (validation).error);
  }
  return {
    data: parsed,
    fileId,
    fileName: meta.name,
    headRevisionId: meta.headRevisionId,
    modifiedTime: meta.modifiedTime,
  };
}

/**
 * Roadmaps this app has saved to the signed-in account (any device), one page at a time.
 * Searching and sorting happen in Drive so this stays fast with hundreds of files.
 * @param {{ query?: string, sort?: 'recent' | 'name', pageToken?: string, pageSize?: number }} [options]
 * @returns {Promise<{ files: any[], nextPageToken: string | null }>}
 */
export async function listAppRoadmaps({
  query = '',
  sort = 'recent',
  pageToken,
  pageSize = 25,
} = {}) {
  const search = query.trim().replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const filters = [
    'trashed=false',
    "mimeType='application/json'",
    `appProperties has { key='app' and value='${APP_ID}' }`,
  ];
  if (search) filters.push(`name contains '${search}'`);

  const params = new URLSearchParams({
    q: filters.join(' and '),
    fields: 'nextPageToken,files(id,name,modifiedTime,headRevisionId)',
    orderBy: sort === 'name' ? 'name' : 'modifiedTime desc',
    pageSize: String(pageSize),
  });
  if (pageToken) params.set('pageToken', pageToken);

  const res = await driveFetch(`${API}/files?${params}`);
  const data = await res.json();
  return { files: data.files || [], nextPageToken: data.nextPageToken || null };
}

export async function restoreFromTrash(fileId) {
  const res = await driveFetch(
    `${API}/files/${fileId}?fields=${FILE_FIELDS}`,
    jsonInit('PATCH', { trashed: false })
  );
  return res.json();
}

export async function listRevisions(fileId) {
  const res = await driveFetch(
    `${API}/files/${fileId}/revisions?fields=revisions(id,modifiedTime,keepForever,size,lastModifyingUser(displayName,emailAddress))&pageSize=100`
  );
  return (await res.json()).revisions || [];
}

/** Pins a revision so Drive's automatic clean-up never deletes it. */
export async function setRevisionPinned(fileId, revisionId, keepForever = true) {
  const res = await driveFetch(
    `${API}/files/${fileId}/revisions/${revisionId}?fields=id,keepForever`,
    jsonInit('PATCH', { keepForever })
  );
  return res.json();
}

export async function restoreDriveRevision(fileId, revisionId) {
  const res = await driveFetch(`${API}/files/${fileId}/revisions/${revisionId}?alt=media`);
  const parsed = await res.json();
  const validation = validateRoadmapImport(parsed);
  if (!validation.ok) {
    throw new Error(/** @type {any} */ (validation).error);
  }
  return parsed;
}
