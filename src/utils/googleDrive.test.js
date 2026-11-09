import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  DriveError,
  saveToGoogleDrive,
  loadFromGoogleDrive,
  listAppRoadmaps,
  listRevisions,
  restoreDriveRevision,
  restoreFromTrash,
  setRevisionPinned,
  getStoredAccessToken,
  setStoredAccessToken,
  signOutGoogle,
} from './googleDrive';

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (status) => ({ ok: false, status, json: async () => ({}) });

const validRoadmap = (id) => ({
  version: 1,
  id,
  updatedAt: '2026-11-08T12:00:00Z',
  config: { name: 'Saved' },
  legend: [],
  sections: [],
  tasks: [],
  timelineItems: [],
});

describe('googleDrive storage service', () => {
  beforeEach(() => {
    setStoredAccessToken('mock-access-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    signOutGoogle();
    vi.unstubAllGlobals();
  });

  describe('authentication', () => {
    it('throws a typed error if no access token is stored', async () => {
      signOutGoogle();
      const attempt = saveToGoogleDrive({ fileId: null, name: 'test', roadmapState: {} });
      await expect(attempt).rejects.toThrow('Not signed into Google Drive');
      await expect(attempt).rejects.toMatchObject({ code: 'not_signed_in' });
    });

    it('forgets an expired token', () => {
      setStoredAccessToken('short-lived', -10);
      expect(getStoredAccessToken()).toBeNull();
    });

    it('clears the token and reports auth_expired on a 401', async () => {
      fetch.mockResolvedValueOnce(fail(401));
      await expect(listRevisions('file-1')).rejects.toMatchObject({ code: 'auth_expired' });
      expect(getStoredAccessToken()).toBeNull();
    });

    it('reports network failures distinctly', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      await expect(listRevisions('file-1')).rejects.toMatchObject({ code: 'network' });
    });
  });

  describe('creating files', () => {
    it('reuses the Roadmap Builder folder and tags the file', async () => {
      fetch
        .mockResolvedValueOnce(ok({ files: [{ id: 'folder-1' }] })) // folder search
        .mockResolvedValueOnce(
          ok({
            id: 'new-file-id-123',
            name: 'My Roadmap.json',
            headRevisionId: 'rev-1',
            modifiedTime: '2026-11-08T12:00:00Z',
          })
        );

      const res = await saveToGoogleDrive({
        fileId: null,
        name: 'My Roadmap',
        roadmapState: { version: 1, id: 'rm-7', config: { name: 'My Roadmap' } },
      });

      expect(res).toMatchObject({
        success: true,
        fileId: 'new-file-id-123',
        headRevisionId: 'rev-1',
      });
      const [url, init] = fetch.mock.calls[1];
      expect(url).toContain('uploadType=multipart');
      expect(init.method).toBe('POST');
      expect(init.headers.Authorization).toBe('Bearer mock-access-token');
      expect(init.body).toContain('"parents":["folder-1"]');
      expect(init.body).toContain('"roadmapId":"rm-7"');
      expect(init.body).toContain('"app":"roadmap-builder"');
    });

    it('creates the folder once when it does not exist yet', async () => {
      fetch
        .mockResolvedValueOnce(ok({ files: [] })) // search: none
        .mockResolvedValueOnce(ok({ id: 'folder-new' })) // create folder
        .mockResolvedValueOnce(ok({ id: 'file-1', name: 'R.json', headRevisionId: 'r1' }));

      await saveToGoogleDrive({ fileId: null, name: 'R', roadmapState: { id: 'rm' } });

      const [folderUrl, folderInit] = fetch.mock.calls[1];
      expect(folderUrl).toContain('/drive/v3/files');
      expect(folderInit.body).toContain('application/vnd.google-apps.folder');
      expect(fetch.mock.calls[2][1].body).toContain('"parents":["folder-new"]');
    });

    it('still saves to My Drive if the folder cannot be created', async () => {
      fetch
        .mockResolvedValueOnce(fail(403)) // folder search denied
        .mockResolvedValueOnce(ok({ id: 'file-1', name: 'R.json', headRevisionId: 'r1' }));

      const res = await saveToGoogleDrive({ fileId: null, name: 'R', roadmapState: { id: 'rm' } });
      expect(res.success).toBe(true);
      expect(fetch.mock.calls[1][1].body).not.toContain('"parents"');
    });
  });

  describe('updating files', () => {
    const meta = (extra = {}) => ({
      id: 'file-123',
      name: 'My Roadmap.json',
      headRevisionId: 'rev-1',
      modifiedTime: '2026-11-08T12:00:00Z',
      trashed: false,
      ...extra,
    });

    it('detects a conflict when the remote head revision changed', async () => {
      fetch.mockResolvedValueOnce(ok(meta({ headRevisionId: 'rev-2' })));
      const res = await saveToGoogleDrive({
        fileId: 'file-123',
        name: 'My Roadmap',
        roadmapState: { version: 1 },
        currentHeadRevisionId: 'rev-1',
      });
      expect(res.conflict).toBe(true);
      expect(res.remoteMeta.headRevisionId).toBe('rev-2');
      expect(fetch).toHaveBeenCalledTimes(1); // nothing was overwritten
    });

    it('updates content, name and tags in a single upload when the head matches', async () => {
      fetch
        .mockResolvedValueOnce(ok(meta()))
        .mockResolvedValueOnce(ok({ id: 'file-123', headRevisionId: 'rev-2' }));

      const res = await saveToGoogleDrive({
        fileId: 'file-123',
        name: 'Renamed',
        roadmapState: { version: 1, id: 'rm' },
        currentHeadRevisionId: 'rev-1',
      });

      expect(res).toMatchObject({
        success: true,
        headRevisionId: 'rev-2',
        fileName: 'Renamed.json',
      });
      expect(fetch).toHaveBeenCalledTimes(2);
      const [url, init] = fetch.mock.calls[1];
      expect(url).toContain('/files/file-123?uploadType=multipart');
      expect(init.method).toBe('PATCH');
      expect(init.body).toContain('"name":"Renamed.json"');
    });

    it('reports a trashed file instead of overwriting it', async () => {
      fetch.mockResolvedValueOnce(ok(meta({ trashed: true })));
      const res = await saveToGoogleDrive({
        fileId: 'file-123',
        name: 'R',
        roadmapState: { id: 'rm' },
      });
      expect(res.problem).toBe('trashed');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it.each([404, 403])('reports a missing file on %i', async (status) => {
      fetch.mockResolvedValueOnce(fail(status));
      const res = await saveToGoogleDrive({
        fileId: 'file-123',
        name: 'R',
        roadmapState: { id: 'rm' },
      });
      expect(res.problem).toBe('missing');
    });

    it('lets offline errors propagate so the caller can retry', async () => {
      fetch.mockRejectedValueOnce(new TypeError('offline'));
      await expect(
        saveToGoogleDrive({ fileId: 'file-123', name: 'R', roadmapState: { id: 'rm' } })
      ).rejects.toBeInstanceOf(DriveError);
    });
  });

  describe('reading files', () => {
    it('loads a roadmap from Google Drive', async () => {
      fetch
        .mockResolvedValueOnce(
          ok({ id: 'file-123', name: 'Saved.json', headRevisionId: 'rev-1', trashed: false })
        )
        .mockResolvedValueOnce(ok(validRoadmap('rm-1')));

      const res = await loadFromGoogleDrive('file-123');
      expect(res.fileId).toBe('file-123');
      expect(res.data.id).toBe('rm-1');
    });

    it('refuses to load a trashed file', async () => {
      fetch.mockResolvedValueOnce(ok({ id: 'file-123', name: 'Saved.json', trashed: true }));
      await expect(loadFromGoogleDrive('file-123')).rejects.toMatchObject({ code: 'trashed' });
    });

    it('lists only roadmaps created by this app, newest first, with a page token', async () => {
      fetch.mockResolvedValueOnce(
        ok({
          files: [{ id: 'a', name: 'A.json', modifiedTime: '2026-11-08T12:00:00Z' }],
          nextPageToken: 'page-2',
        })
      );
      const { files, nextPageToken } = await listAppRoadmaps();
      expect(files).toHaveLength(1);
      expect(nextPageToken).toBe('page-2');
      const url = decodeURIComponent(fetch.mock.calls[0][0].replaceAll('+', ' '));
      expect(url).toContain("appProperties has { key='app' and value='roadmap-builder' }");
      expect(url).toContain('orderBy=modifiedTime desc');
    });

    it('searches by name (escaping quotes), sorts by name and pages', async () => {
      fetch.mockResolvedValueOnce(ok({ files: [] }));
      const result = await listAppRoadmaps({ query: "Q3 plan's", sort: 'name', pageToken: 'p2' });
      expect(result.nextPageToken).toBeNull();
      const url = decodeURIComponent(fetch.mock.calls[0][0].replaceAll('+', ' '));
      expect(url).toContain("name contains 'Q3 plan\\'s'");
      expect(url).toContain('orderBy=name');
      expect(url).toContain('pageToken=p2');
    });
  });

  describe('revisions', () => {
    it('lists revisions for a given fileId', async () => {
      fetch.mockResolvedValueOnce(
        ok({
          revisions: [
            { id: '1', modifiedTime: '2026-11-08T11:00:00Z' },
            { id: '2', modifiedTime: '2026-11-08T12:00:00Z' },
          ],
        })
      );
      const revs = await listRevisions('file-123');
      expect(revs).toHaveLength(2);
      expect(revs[0].id).toBe('1');
    });

    it('pins a revision with keepForever', async () => {
      fetch.mockResolvedValueOnce(ok({ id: '2', keepForever: true }));
      await setRevisionPinned('file-123', '2', true);
      const [url, init] = fetch.mock.calls[0];
      expect(url).toContain('/files/file-123/revisions/2');
      expect(init.method).toBe('PATCH');
      expect(init.body).toBe(JSON.stringify({ keepForever: true }));
    });

    it('restores previous revision', async () => {
      fetch.mockResolvedValueOnce(ok(validRoadmap('rm-old')));
      const res = await restoreDriveRevision('file-123', 'rev-old');
      expect(res.id).toBe('rm-old');
    });

    it('restores a file from the Trash', async () => {
      fetch.mockResolvedValueOnce(ok({ id: 'file-123', headRevisionId: 'rev-9' }));
      await restoreFromTrash('file-123');
      expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ trashed: false }));
    });
  });
});
