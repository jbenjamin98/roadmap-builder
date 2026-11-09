// Strict e2e checks for state safety: undo/redo, delete-undo toast, backup status, draft
// persistence, import confirmation, save-failure banner and corrupt-draft recovery.
// Run `npm run build` first. Exits non-zero if any check fails.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { preview } from 'vite';

const OUT = './e2e-output';
fs.mkdirSync(OUT, { recursive: true });
const server = await preview({ preview: { port: 4174, strictPort: true, host: '127.0.0.1' } });
const BASE = 'http://127.0.0.1:4174/';

let failures = 0;
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};
const sel = (id) => `[data-testid="${id}"]`;
const ITEMS = '[data-testid^="timeline-item-"]:not([data-testid="timeline-item-popover"])';

const browser = await chromium.launch();

async function drawBar(page) {
  const c2 = await page.locator(sel('cell-task-1-2')).boundingBox();
  const c3 = await page.locator(sel('cell-task-1-3')).boundingBox();
  await page.mouse.move(c2.x + c2.width / 2, c2.y + c2.height / 2);
  await page.mouse.down();
  await page.mouse.move(c3.x + c3.width / 2, c3.y + c3.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.mouse.click(1100, 950); // close the popover
  await page.waitForTimeout(200);
}

async function gotoLandingFresh(ctx) {
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForSelector(sel('create-roadmap-btn'), { timeout: 15000 });
  return page;
}

try {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    acceptDownloads: true,
  });
  const page = await gotoLandingFresh(ctx);

  // --- A. Untouched sample is not persisted / no continue pill
  check(
    'no "continue editing" pill on a first visit',
    (await page.locator(sel('continue-editing-btn')).count()) === 0
  );
  check(
    'nothing written to localStorage before the first edit',
    (await page.evaluate(() => localStorage.getItem('roadmap_builder_state_v1'))) === null
  );

  // --- B. Create + first-run draft notice
  await page.locator(sel('create-roadmap-btn')).click({ force: true });
  await page.waitForSelector(sel('config-modal'));
  await page.fill(sel('config-roadmap-name'), 'E2E Roadmap');
  await page.click(sel('save-config-btn'));
  await page.waitForSelector(sel('roadmap-export-canvas'));
  check(
    'draft notice appears on first workspace visit',
    (await page.locator(sel('draft-notice')).count()) === 1
  );
  await page.keyboard.press('Escape');
  check('draft notice closes with Escape', (await page.locator(sel('draft-notice')).count()) === 0);

  // --- C. Backup chip
  check(
    'chip says "Not backed up" for a new roadmap',
    /Not backed up/.test(await page.locator(sel('backup-chip')).innerText())
  );

  // --- D/E. Undo / redo (buttons + keyboard)
  await drawBar(page);
  check('bar drawn', (await page.locator(ITEMS).count()) === 1);
  await page.click(sel('undo-btn'));
  check('undo button removes the bar', (await page.locator(ITEMS).count()) === 0);
  await page.click(sel('redo-btn'));
  check('redo button restores the bar', (await page.locator(ITEMS).count()) === 1);
  await page.mouse.click(1100, 950);
  await page.keyboard.press('Control+z');
  check('Ctrl+Z undoes', (await page.locator(ITEMS).count()) === 0);
  await page.keyboard.press('Control+Shift+z');
  check('Ctrl+Shift+Z redoes', (await page.locator(ITEMS).count()) === 1);

  // --- F. Delete with Undo toast (cascade restored)
  await page.locator('button[title="Delete Task"]').first().click();
  await page.waitForSelector(sel('toast'));
  check(
    'deleting a task removes its row',
    (await page.locator(sel('cell-task-1-1')).count()) === 0
  );
  await page.click(sel('toast-action'));
  await page.waitForTimeout(200);
  check('toast Undo restores the task', (await page.locator(sel('cell-task-1-1')).count()) === 1);
  check("toast Undo restores the task's bar too", (await page.locator(ITEMS).count()) === 1);

  // --- G. Backup via chip
  await page.click(sel('backup-chip'));
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(sel('backup-download-btn')),
  ]);
  check('backup downloads a .json file', download.suggestedFilename().endsWith('.json'));
  await page.waitForTimeout(200);
  check(
    'chip says "Backed up" afterwards',
    /Backed up/.test(await page.locator(sel('backup-chip')).innerText())
  );

  // --- H. Draft persists across reload and is reachable again
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForSelector(sel('continue-editing-btn'), { timeout: 15000 });
  check(
    'continue-editing lily pad is offered after reload',
    (await page.locator(sel('continue-editing-btn')).count()) === 1
  );
  await page.click(sel('continue-editing-btn'), { force: true });
  await page.waitForSelector(sel('roadmap-export-canvas'));
  check('draft restored after reload (bar still there)', (await page.locator(ITEMS).count()) === 1);
  check(
    'still marked backed up after reload',
    /Backed up/.test(await page.locator(sel('backup-chip')).innerText())
  );

  // --- I. Import confirmation when current work is not backed up
  await page.click(sel('add-section-btn'));
  await page.waitForTimeout(200);
  check(
    'chip flips to "Not backed up" after an edit',
    /Not backed up/.test(await page.locator(sel('backup-chip')).innerText())
  );
  fs.writeFileSync(
    `${OUT}/import-test.json`,
    JSON.stringify({ config: { name: 'Imported' }, sections: [], tasks: [], timelineItems: [] })
  );
  await page.click('button[title="Back to Landing Page"]');
  await page.waitForSelector(sel('create-roadmap-btn'));
  await page.setInputFiles(sel('upload-json-input'), `${OUT}/import-test.json`);
  await page.waitForSelector(sel('import-confirm'));
  check('import asks before replacing un-backed-up work', true);
  await page.getByRole('button', { name: 'Cancel' }).click();
  check(
    'Cancel keeps the current roadmap',
    (await page.locator(sel('import-confirm')).count()) === 0
  );
  await page.setInputFiles(sel('upload-json-input'), `${OUT}/import-test.json`);
  await page.waitForSelector(sel('import-confirm'));
  await page.click(sel('import-replace-btn'));
  await page.waitForSelector(sel('roadmap-export-canvas'));
  check(
    'Replace imports the new roadmap',
    /Imported/.test(await page.locator('header h2').first().innerText())
  );
  check(
    'undo cannot jump back to a different roadmap after an import',
    (await page.locator(sel('undo-btn')).isDisabled()) &&
      /Imported/.test(await page.locator('header h2').first().innerText())
  );

  // --- J. Save failure is visible
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
  });
  await page.click(sel('add-section-btn'));
  await page.waitForSelector(sel('backup-banner'), { timeout: 5000 });
  check(
    'failed draft save shows a visible banner',
    /not being saved/i.test(await page.locator(sel('backup-banner')).innerText())
  );
  check(
    'chip reports the failing draft',
    /Draft not saving/.test(await page.locator(sel('backup-chip')).innerText())
  );
  await ctx.close();

  // --- K. Corrupt draft is quarantined, never overwritten
  const ctx2 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx2.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('roadmap_builder_state_v1', '{not valid json');
      sessionStorage.setItem('seeded', '1');
    }
  });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE);
  await page2.waitForSelector(sel('recovery-banner'), { timeout: 15000 });
  check('corrupt draft shows the recovery banner', true);
  check(
    'corrupt draft was NOT overwritten',
    (await page2.evaluate(() => localStorage.getItem('roadmap_builder_state_v1'))) ===
      '{not valid json'
  );
  await ctx2.close();

  // --- L. Screen guard: desktop can dismiss, mobile cannot
  const narrow = await browser.newContext({ viewport: { width: 1100, height: 800 } });
  const narrowPage = await narrow.newPage();
  await narrowPage.goto(BASE);
  await narrowPage.waitForSelector(sel('small-screen-guard'), { timeout: 15000 });
  check('guard shows on a narrow desktop window', true);
  await narrowPage.click(sel('guard-continue-btn'));
  check(
    '"Continue anyway" dismisses the guard',
    (await narrowPage.locator(sel('small-screen-guard')).count()) === 0
  );
  await narrowPage.reload();
  await narrowPage.waitForSelector(sel('small-screen-guard'), { timeout: 15000 });
  check(
    'guard reappears on every reload',
    (await narrowPage.locator(sel('small-screen-guard')).count()) === 1
  );
  await narrow.close();

  const laptop = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const laptopPage = await laptop.newPage();
  await laptopPage.goto(BASE);
  await laptopPage.waitForSelector(sel('create-roadmap-btn'), { timeout: 15000 });
  check(
    'no guard on a 1366px laptop',
    (await laptopPage.locator(sel('small-screen-guard')).count()) === 0
  );
  await laptop.close();

  const phone = await browser.newContext({
    viewport: { width: 390, height: 800 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });
  const phonePage = await phone.newPage();
  await phonePage.goto(BASE);
  await phonePage.waitForSelector(sel('small-screen-guard'), { timeout: 15000 });
  check('mobile is blocked', true);
  check(
    'mobile has no way to dismiss the guard',
    (await phonePage.locator(sel('guard-continue-btn')).count()) === 0
  );
  await phone.close();

  // --- M. Dialogs close with Escape; touch-style pointer drawing works
  const ctx3 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx3.addInitScript(() => localStorage.setItem('roadmap_builder_draft_notice_v1', '1'));
  const page3 = await ctx3.newPage();
  await page3.goto(BASE);
  await page3.waitForSelector(sel('create-roadmap-btn'));
  await page3.locator(sel('create-roadmap-btn')).click({ force: true });
  await page3.waitForSelector(sel('config-modal'));
  check(
    'config modal is a labelled dialog',
    (await page3.locator('[role="dialog"][aria-modal="true"]').count()) === 1
  );
  await page3.keyboard.press('Escape');
  check('Escape closes the config modal', (await page3.locator(sel('config-modal')).count()) === 0);
  await page3.locator(sel('create-roadmap-btn')).click({ force: true });
  await page3.waitForSelector(sel('config-modal'));
  await page3.fill(sel('config-roadmap-name'), 'Dialogs');
  await page3.click(sel('save-config-btn'));
  await page3.waitForSelector(sel('config-modal'), { state: 'detached' });
  await page3.waitForSelector(sel('export-btn'));
  await page3.click(sel('export-btn'));
  await page3.waitForSelector(sel('export-modal'));
  await page3.keyboard.press('Escape');
  check('Escape closes the export modal', (await page3.locator(sel('export-modal')).count()) === 0);

  // synthetic touch pointer: down on period 2, move to period 3, up
  await page3.evaluate(async () => {
    const cell = (i) => document.querySelector(`[data-testid="cell-task-1-${i}"]`);
    const tick = () => new Promise((resolve) => setTimeout(resolve, 80)); // real events arrive in separate frames
    const fire = (target, type, el) => {
      const r = el.getBoundingClientRect();
      target.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId: 7,
          pointerType: 'touch',
          isPrimary: true,
          button: 0,
          buttons: type === 'pointerup' ? 0 : 1,
          clientX: r.x + r.width / 2,
          clientY: r.y + r.height / 2,
        })
      );
    };
    fire(cell(2), 'pointerdown', cell(2));
    await tick();
    fire(window, 'pointermove', cell(3));
    await tick();
    fire(window, 'pointerup', cell(3));
  });
  await page3.waitForTimeout(400);
  check('touch pointer gesture draws a bar', (await page3.locator(ITEMS).count()) === 1);
  const touchBar = await page3.locator(ITEMS).first().boundingBox();
  const c2 = await page3.locator(sel('cell-task-1-2')).boundingBox();
  const c3 = await page3.locator(sel('cell-task-1-3')).boundingBox();
  check('touch-drawn bar spans two periods', touchBar.width > (c3.x - c2.x) * 1.5);
  await ctx3.close();

  // --- K. Privacy & Google Drive UI checks
  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page4 = await gotoLandingFresh(ctx4);
  const privacyBtn = page4.locator(sel('landing-privacy-btn'));
  check('privacy button exists on landing page', (await privacyBtn.count()) === 1);
  await privacyBtn.click();
  await page4.waitForSelector(sel('privacy-modal'));
  check(
    'privacy modal opens from landing page',
    (await page4.locator(sel('privacy-modal')).count()) === 1
  );
  await page4.keyboard.press('Escape');
  await page4.waitForSelector(sel('privacy-modal'), { state: 'detached' });
  check(
    'privacy modal closes on Escape',
    (await page4.locator(sel('privacy-modal')).count()) === 0
  );

  // Enter workspace and check backup chip popover
  await page4.locator(sel('create-roadmap-btn')).click({ force: true });
  await page4.waitForSelector(sel('config-modal'));
  await page4.fill(sel('config-roadmap-name'), 'Drive Test');
  await page4.click(sel('save-config-btn'));
  await page4.waitForSelector(sel('roadmap-export-canvas'));
  await page4.keyboard.press('Escape'); // dismiss first-run draft notice

  await page4.locator(sel('backup-chip')).click();
  await page4.waitForSelector('[role="dialog"][aria-label="Backup status"]');
  check(
    'backup chip popover opens',
    (await page4.locator('[role="dialog"][aria-label="Backup status"]').count()) === 1
  );
  check(
    'backup chip offers Google Drive connect',
    (await page4.locator('text=Connect Google Drive').count()) === 1
  );
  check(
    'backup chip offers download backup',
    (await page4.locator(sel('backup-download-btn')).count()) === 1
  );

  await ctx4.close();

  // --- Responsiveness for desktops that override the size guard
  const ctx5 = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page5 = await ctx5.newPage();
  await page5.goto(BASE);
  await page5.waitForSelector(sel('create-roadmap-btn'), { timeout: 15000 });
  const fitsViewport = async (locator) => {
    const box = await locator.boundingBox();
    const vp = page5.viewportSize();
    return Boolean(
      box &&
      vp &&
      box.x >= 0 &&
      box.y >= 0 &&
      box.x + box.width <= vp.width + 1 &&
      box.y + box.height <= vp.height + 1
    );
  };
  check(
    'landing headline fits on a 1366x768 laptop',
    await fitsViewport(page5.locator(sel('align-ducks-trigger')))
  );
  check(
    'landing create/open buttons fit on a 1366x768 laptop',
    (await fitsViewport(page5.locator(sel('create-roadmap-btn')))) &&
      (await fitsViewport(page5.locator(sel('open-roadmap-btn'))))
  );
  check(
    'no separate Upload or Drive buttons remain (merged into Open Roadmap)',
    (await page5.locator(sel('upload-roadmap-btn')).count()) === 0 &&
      (await page5.locator(sel('drive-open-btn')).count()) === 0
  );
  await page5.locator(sel('open-roadmap-btn')).click({ force: true });
  await page5.waitForSelector(sel('open-roadmap-modal'));
  check(
    'Open Roadmap offers upload and Google Drive',
    (await page5.locator(sel('open-upload-option')).count()) === 1 &&
      (await page5.locator(sel('open-drive-option')).count()) === 1
  );
  await page5.locator(sel('open-drive-option')).click();
  await page5.waitForSelector(sel('drive-open-modal'));
  check(
    'Open from Google Drive step offers sign-in and a way back',
    (await page5.locator(sel('drive-open-connect-btn')).count()) === 1 &&
      (await page5.locator(sel('drive-back-btn')).count()) === 1
  );
  await page5.locator(sel('drive-back-btn')).click();
  await page5.waitForSelector(sel('open-roadmap-modal'));
  await page5.keyboard.press('Escape');
  await page5.waitForSelector(sel('open-roadmap-modal'), { state: 'detached' });
  check(
    'no continue-editing pad when there is no roadmap in progress',
    (await page5.locator(sel('continue-editing-btn')).count()) === 0
  );
  const toggleBottom = await page5.evaluate(
    () =>
      document.querySelector('[data-testid="celestial-theme-toggle"]').getBoundingClientRect()
        .bottom
  );
  check('sun/moon stays inside the sky (above the horizon)', toggleBottom <= 144);
  const islandBottom = async () => {
    const box = await page5.locator(sel('shore-island')).boundingBox();
    return box ? Math.round(box.y + box.height) : -1;
  };
  check('island touches the bottom edge at 1366x768', (await islandBottom()) >= 768 - 2);
  await page5.setViewportSize({ width: 1920, height: 1080 });
  await page5.waitForTimeout(300);
  check('island touches the bottom edge at 1920x1080', (await islandBottom()) >= 1080 - 2);
  await page5.setViewportSize({ width: 1366, height: 768 });
  await page5.waitForTimeout(300);
  const egg = await page5.locator(sel('hatch-egg-btn')).boundingBox();
  check('hatch egg is on screen at 1366x768', Boolean(egg && egg.y < 768 - 40));

  await page5.setViewportSize({ width: 1024, height: 768 });
  check(
    'theme toggle stays available below 1280px',
    await page5.locator(sel('celestial-theme-toggle')).isVisible()
  );
  await page5.setViewportSize({ width: 800, height: 600 });
  await page5.waitForTimeout(300);
  await page5.click(sel('guard-continue-btn')); // the size warning shows below 1280px
  const landingSize = await page5.evaluate(() => {
    const root = document.querySelector('[data-testid="landing-root"]');
    return { w: root.scrollWidth, h: root.scrollHeight };
  });
  check(
    'landing locks at 1280x720 and scrolls in smaller windows',
    landingSize.w >= 1280 && landingSize.h >= 720
  );
  const lockedBox = await page5.locator(sel('open-roadmap-btn')).boundingBox();
  check(
    'landing layout stays intact (not squashed) in a small window',
    Boolean(lockedBox && lockedBox.x + lockedBox.width <= 1280)
  );

  await page5.locator(sel('create-roadmap-btn')).click({ force: true });
  await page5.waitForSelector(sel('config-modal'));
  const configBox = await page5.locator(sel('config-modal')).boundingBox();
  check(
    'config modal fits the 800x600 viewport',
    Boolean(configBox && configBox.y >= 0 && configBox.y + configBox.height <= 601)
  );
  await page5.fill(sel('config-roadmap-name'), 'Responsive Test');
  await page5.click(sel('save-config-btn'));
  await page5.waitForSelector(sel('roadmap-export-canvas'));
  check(
    'first-run notice offers Connect Google Drive',
    (await page5.locator(sel('draft-notice-connect')).count()) === 1
  );
  await page5.keyboard.press('Escape');

  const canvasBox = await page5.locator(sel('roadmap-export-canvas')).boundingBox();
  check(
    'timeline is visible at 800x600 (not pushed below the sidebar)',
    Boolean(canvasBox && canvasBox.x >= 0 && canvasBox.x < 400 && canvasBox.y < 400)
  );
  check(
    'sidebar is a closed drawer at 800px',
    !(await page5.locator('#workspace-sidebar').isVisible())
  );
  await page5.locator(sel('sidebar-toggle-btn')).click();
  check(
    'sidebar drawer opens from the Rows button',
    await page5.locator('#workspace-sidebar').isVisible()
  );
  await page5.keyboard.press('Escape');
  check(
    'Escape closes the sidebar drawer',
    !(await page5.locator('#workspace-sidebar').isVisible())
  );

  await page5.locator(sel('backup-chip')).click();
  const popover = await page5.locator('[role="dialog"][aria-label="Backup status"]').boundingBox();
  check(
    'backup popover stays inside an 800px window',
    Boolean(popover && popover.x >= 0 && popover.x + popover.width <= 801)
  );
  check(
    'drive section shows Connect Google Drive',
    (await page5.locator(sel('drive-connect-btn')).count()) === 1
  );
  await ctx5.close();

  // --- Configuration studio at the smallest supported laptop (1280x720)
  const ctx6 = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page6 = await ctx6.newPage();
  await page6.goto(BASE);
  await page6.waitForSelector(sel('create-roadmap-btn'), { timeout: 15000 });
  await page6.locator(sel('create-roadmap-btn')).click({ force: true });
  await page6.waitForSelector(sel('config-modal'));
  const cfg = await page6.evaluate(() => {
    const modal = document.querySelector('[data-testid="config-modal"]');
    const m = modal.getBoundingClientRect();
    // Anything inside a clipping container (e.g. the cropped live preview) is cropped on purpose.
    const insideClipper = (el) => {
      for (let p = el.parentElement; p && p !== modal; p = p.parentElement) {
        if (getComputedStyle(p).overflowX !== 'visible') return true;
      }
      return false;
    };
    const clipped = [...modal.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > m.right + 1 || r.left < m.left - 1) && !insideClipper(el);
    }).length;
    const name = document
      .querySelector('[data-testid="config-roadmap-name"]')
      .getBoundingClientRect();
    return {
      fits: m.top >= 0 && m.bottom <= innerHeight && m.left >= 0 && m.right <= innerWidth,
      clipped,
      nameWidth: name.width,
    };
  });
  check('config studio fits inside a 1280x720 window', cfg.fits);
  check('config studio has no clipped content at 1280x720', cfg.clipped === 0);
  check('config settings column is wide enough at 1280x720', cfg.nameWidth >= 240);
  await ctx6.close();
} catch (err) {
  failures += 1;
  console.error('FAIL  unexpected error:', err);
} finally {
  await browser.close();
  server.httpServer.close();
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll state e2e checks passed');
