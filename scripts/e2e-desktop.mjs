// Desktop (Electron) end-to-end test. Run `npm run build` first, then `node scripts/e2e-desktop.mjs`.
// Drives the real app with Playwright. Uses throwaway library/profile folders; native save dialogs
// are replaced with stubs that write into the same temp folder.
import { _electron as electron } from 'playwright';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sel = (id) => `[data-testid="${id}"]`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-e2e-'));
const library = path.join(tmp, 'library');
const userData = path.join(tmp, 'profile');
const exportsDir = path.join(tmp, 'exports');
fs.mkdirSync(exportsDir);

let failures = 0;
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};
const waitFor = async (fn, timeout = 10000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
};

// Some hosts (VS Code terminals) set ELECTRON_RUN_AS_NODE, which makes Electron behave like plain Node.
const cleanEnv = () => {
  const env = { ...process.env, ROADMAP_LIBRARY_DIR: library, ROADMAP_USER_DATA: userData };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
};

// CI containers lack the setuid sandbox helper Electron wants on Linux.
const launch = () =>
  electron.launch({
    // DESKTOP_EXE points the test at a packaged build (release/win-unpacked/...) instead of source.
    ...(process.env.DESKTOP_EXE ? { executablePath: process.env.DESKTOP_EXE } : {}),
    args: [...(process.env.DESKTOP_EXE ? [] : ['.']), ...(process.env.CI ? ['--no-sandbox'] : [])],
    env: cleanEnv(),
  });

let liveApp = null;
async function start() {
  const app = await launch();
  liveApp = app;
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  await page.setViewportSize({ width: 1600, height: 950 });
  await page.waitForSelector(sel('create-roadmap-btn'), { timeout: 20000 });
  return { app, page, errors };
}

const roadmapFiles = () =>
  fs.existsSync(library) ? fs.readdirSync(library).filter((n) => n.endsWith('.roadmap.json')) : [];

try {
  // ---- First run: create, autosave, versions, exports ----
  let { app, page, errors } = await start();
  check(
    'preload exposes window.desktop',
    await page.evaluate(() => Boolean(window.desktop?.isDesktop))
  );
  check('page is served from app://', page.url().startsWith('app://roadmap/'));
  check(
    'desktop app does not show the download link',
    (await page.locator(sel('download-desktop-link')).count()) === 0
  );

  await page.locator(sel('create-roadmap-btn')).click({ force: true });
  await page.waitForSelector(sel('config-modal'));
  await page.fill(sel('config-roadmap-name'), 'Desktop Test');
  await page.click(sel('save-config-btn'));
  await page.waitForSelector(sel('roadmap-export-canvas'));

  check(
    'no "temporary browser draft" notice on desktop',
    (await page.locator(sel('draft-notice')).count()) === 0
  );
  check(
    'autosave writes <name>.roadmap.json into the library',
    await waitFor(() => roadmapFiles().includes('Desktop Test.roadmap.json'))
  );
  const saved = JSON.parse(
    fs.readFileSync(path.join(library, 'Desktop Test.roadmap.json'), 'utf8')
  );
  check('saved file holds the roadmap', saved.config?.name === 'Desktop Test' && Boolean(saved.id));
  check('no backup chip on desktop', (await page.locator(sel('backup-chip')).count()) === 0);

  // Period edits are saved into the roadmap file
  await page.locator(sel('period-header-2')).click();
  await page.waitForSelector(sel('period-edit-popover'));
  await page.locator(sel('period-edit-name')).fill('Hardening Sprint 2');
  await page.locator(sel('period-edit-weeks')).fill('3');
  await page.keyboard.press('Escape');
  check(
    'renamed / re-lengthened period is autosaved to the file',
    await waitFor(() => {
      const cfg = JSON.parse(
        fs.readFileSync(path.join(library, 'Desktop Test.roadmap.json'), 'utf8')
      ).config;
      return (
        cfg.periodOverrides?.['2']?.label === 'Hardening Sprint 2' &&
        cfg.periodOverrides?.['2']?.weeks === 3
      );
    })
  );

  await page.locator(sel('versions-btn')).click();
  await page.waitForSelector(sel('version-history-dialog'));
  check(
    'an automatic first version exists',
    await waitFor(async () => (await page.locator(`${sel('versions-list')} li`).count()) === 1)
  );
  await page.keyboard.press('Escape');

  await page.locator(sel('versions-btn')).click();
  await page.waitForSelector(sel('version-history-dialog'));
  await page.locator(sel('versions-save-btn')).click();
  await page.fill(sel('save-version-label'), 'Q3 master');
  await page.locator(`${sel('save-version-dialog')} input[type="checkbox"]`).check();
  await page.locator(sel('save-version-submit')).click();
  await page.waitForSelector(sel('save-version-dialog'), { state: 'detached' });
  await page.locator(sel('versions-btn')).click();
  await page.waitForSelector(sel('version-history-dialog'));
  check(
    'named master version is listed and pinned',
    (await waitFor(async () => (await page.locator(`${sel('versions-list')} li`).count()) === 2)) &&
      (await page.locator(`${sel('versions-list')} li[data-pinned="true"]`).count()) === 1
  );
  await page.keyboard.press('Escape');

  // Native save dialogs are stubbed to write into exportsDir.
  await app.evaluate(({ dialog }, dir) => {
    dialog.showSaveDialog = async (_win, opts) => ({
      canceled: false,
      filePath: `${dir}/${opts.defaultPath.split(/[\\/]/).pop()}`,
    });
  }, exportsDir);

  await page.locator(sel('export-btn')).click();
  await page.waitForSelector(sel('export-modal'));
  for (const id of ['json', 'pdf', 'excel', 'png']) {
    const box = page.locator(sel(`export-option-${id}`));
    const want = id === 'json' || id === 'pdf';
    if ((await box.isChecked()) !== want) await box.click();
  }
  await page.locator(sel('export-run-btn')).click();
  check(
    'JSON export goes through the native Save dialog',
    await waitFor(() => fs.existsSync(path.join(exportsDir, 'desktop-test.json')), 15000)
  );
  check(
    'PDF export writes a real PDF without a print dialog',
    await waitFor(() => {
      const f = path.join(exportsDir, 'desktop-test.pdf');
      return fs.existsSync(f) && fs.readFileSync(f).subarray(0, 4).toString() === '%PDF';
    }, 20000)
  );
  check('no page errors in session 1', errors.length === 0);
  if (errors.length) console.log(errors);

  const roadmapId = saved.id;
  await app.close();

  // ---- The final snapshot on close, then a second launch ----
  const historyIndex = path.join(library, '.history', roadmapId, 'index.json');
  check('version history is stored beside the library', fs.existsSync(historyIndex));
  const versions = JSON.parse(fs.readFileSync(historyIndex, 'utf8')).versions;
  check(
    'master version survived with its label',
    versions.some((v) => v.pinned && v.label === 'Q3 master')
  );

  const roadmapFile = path.join(library, 'Desktop Test.roadmap.json');
  const mtimeBefore = fs.statSync(roadmapFile).mtimeMs;
  ({ app, page, errors } = await start());
  await page.setViewportSize({ width: 1280, height: 720 });
  const fits = async (id) => {
    const box = await page.locator(sel(id)).boundingBox();
    return Boolean(box && box.x >= 0 && box.x + box.width <= 1280 && box.y + box.height <= 720);
  };
  check(
    'all four landing pads fit at 1280x720',
    (await fits('create-roadmap-btn')) &&
      (await fits('continue-editing-btn')) &&
      (await fits('open-roadmap-btn')) &&
      (await fits('library-open-btn'))
  );
  await page.locator(sel('open-roadmap-btn')).click({ force: true });
  await page.waitForSelector(sel('open-roadmap-modal'));
  check(
    'Open dialog no longer duplicates the library option',
    (await page.locator(sel('open-library-option')).count()) === 0
  );
  await page.keyboard.press('Escape');
  await page.locator(sel('library-open-btn')).click({ force: true });
  await page.waitForSelector(sel('library-modal'));
  check(
    'the Browse pad lists the saved roadmap as a card',
    await waitFor(async () => (await page.locator(sel('library-card')).count()) === 1)
  );
  await page.locator('[aria-label="Duplicate Desktop Test"]').click();
  check(
    'duplicating adds a second card',
    await waitFor(async () => (await page.locator(sel('library-card')).count()) === 2)
  );
  await page.locator(sel('library-search')).fill('copy');
  check('search filters the grid', (await page.locator(sel('library-card')).count()) === 1);
  await page.locator(sel('library-search')).fill('zzz-nothing');
  check('search shows an empty state', (await page.locator(sel('library-no-match')).count()) === 1);
  await page.locator(sel('library-search')).fill('');
  check(
    'clearing search restores the grid',
    (await page.locator(sel('library-card')).count()) === 2
  );
  await page
    .locator(sel('library-card'))
    .filter({ hasNotText: '(copy)' })
    .locator(sel('library-open-item'))
    .click();
  await page.waitForSelector(sel('roadmap-export-canvas'));
  check(
    'the period rename survived being reopened from the library',
    /Hardening Sprint 2/.test(await page.locator(sel('period-header-2')).innerText())
  );
  await new Promise((r) => setTimeout(r, 1500));
  check(
    'merely opening a roadmap does not rewrite its file',
    fs.statSync(roadmapFile).mtimeMs === mtimeBefore
  );
  check('no page errors in session 2', errors.length === 0);
  if (errors.length) console.log(errors);
  await app.close();
} catch (err) {
  console.error(err);
  failures += 1;
} finally {
  await liveApp?.close().catch(() => {});
  try {
    fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* temp folder cleanup is best effort */
  }
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll desktop checks passed');
process.exit(failures ? 1 : 0);
