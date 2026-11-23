// Headless checks for editable periods: rename a period, change its length, bulk tools, undo, and
// persistence. Run `npm run build` first. PW_CHANNEL=msedge|chrome uses an installed browser.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4176, strictPort: true, host: '127.0.0.1' } });
const OUT = './e2e-output';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(
  process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}
);
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()));

let failed = 0;
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
};
const tid = (id) => page.locator(`[data-testid="${id}"]`);
const header = (n) => tid(`period-header-${n}`);
const headerText = async (n) => (await header(n).innerText()).replace(/\s+/g, ' ');

await page.goto('http://127.0.0.1:4176/');
await page.waitForSelector('[data-testid="create-roadmap-btn"]', { timeout: 15000 });
await tid('create-roadmap-btn').click({ force: true });
await page.waitForSelector('[data-testid="config-modal"]');
await page.fill('[data-testid="config-roadmap-name"]', 'Period Checks');
await page.fill('[data-testid="config-start-date"]', '2026-01-05');
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');

// A bar on period 5, so we can prove it stays attached to its period
const c5 = await tid('cell-task-1-5').boundingBox();
await page.mouse.move(c5.x + c5.width / 2, c5.y + c5.height / 2);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(350);
await page.keyboard.press('Escape');
const ITEMS = '[data-testid^="timeline-item-"]:not([data-testid="timeline-item-popover"])';
const barOnPeriod5 = async () => {
  const bar = await page.locator(ITEMS).first().boundingBox();
  const col = await header(5).boundingBox();
  return Boolean(bar && col && bar.x >= col.x - 2 && bar.x + bar.width <= col.x + col.width + 2);
};
check(
  'a bar was drawn on period 5',
  (await page.locator(ITEMS).count()) === 1 && (await barOnPeriod5())
);

// 1. Click a header to rename it
await header(5).click();
await page.waitForSelector('[data-testid="period-edit-popover"]');
await tid('period-edit-name').fill('Hardening Sprint 5');
check('renaming updates the header', /Hardening Sprint 5/.test(await headerText(5)));
check('other headers keep their generated names', /Sprint 6/.test(await headerText(6)));

// 2. Give it a different length: later periods shift, bar stays on its period
const before6 = await headerText(6);
await tid('period-edit-weeks').fill('1');
await page.waitForTimeout(150);
check('a custom length shows a badge', (await tid('period-weeks-badge-5').count()) === 1);
const after6 = await headerText(6);
check('later periods shift to follow', before6 !== after6);
check(
  'period 6 starts the day after the 1-week period 5 (03/09/2026)',
  /03\/09\/2026|Mar 9/.test(after6)
);
check('the bar stays attached to its period', await barOnPeriod5());

// 3. Escape closes; undo steps back (length, then name)
await page.keyboard.press('Escape');
check('Escape closes the editor', (await tid('period-edit-popover').count()) === 0);
await tid('undo-btn').click();
check('undo removes the custom length', (await tid('period-weeks-badge-5').count()) === 0);
await tid('undo-btn').click();
check(
  'undo restores the generated name',
  /Sprint 5/.test(await headerText(5)) && !/Hardening/.test(await headerText(5))
);
await tid('redo-btn').click();
await tid('redo-btn').click();
check('redo brings both edits back', /Hardening Sprint 5/.test(await headerText(5)));

// 4. Bulk: every 3rd period is 1 week long
await tid('open-config-btn').click();
await page.waitForSelector('[data-testid="periods-editor"]');
await tid('periods-every-n').fill('3');
await tid('periods-every-offset').fill('3');
await tid('periods-every-weeks').fill('1');
await tid('periods-every-apply').click();
check(
  'bulk "every 3rd" lengths show in the editor list',
  (await tid('period-weeks-3').inputValue()) === '1' &&
    (await tid('period-weeks-6').inputValue()) === '1' &&
    (await tid('period-weeks-4').inputValue()) === '2'
);
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
check(
  'every 3rd period is badged 1w on the roadmap',
  (await tid('period-weeks-badge-3').count()) === 1 &&
    (await tid('period-weeks-badge-6').count()) === 1
);
check('the rename from step 1 survived', /Hardening Sprint 5/.test(await headerText(5)));
await page.screenshot({ path: `${OUT}/periods-bulk.png` });

// 5. Custom periods persist across a reload
await page.waitForTimeout(800);
await page.reload();
await page.waitForSelector('[data-testid="continue-editing-btn"]', { timeout: 15000 });
await tid('continue-editing-btn').click({ force: true });
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
check(
  'names and lengths survive a reload',
  /Hardening Sprint 5/.test(await headerText(5)) &&
    (await tid('period-weeks-badge-3').count()) === 1
);

// 6. Bulk: switch every period to 3 weeks (keeps names, clears length overrides)
await tid('open-config-btn').click();
await page.waitForSelector('[data-testid="periods-editor"]');
await tid('periods-all-weeks').fill('3');
await tid('periods-all-apply').click();
check(
  '"set all" changes the default weeks field',
  (await tid('config-weeks-per-period').inputValue()) === '3'
);
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
check(
  'all periods are 3 weeks: no length badges, name kept',
  (await page.locator('[data-testid^="period-weeks-badge-"]').count()) === 0 &&
    /Hardening Sprint 5/.test(await headerText(5))
);

// 7. Preview mode is read-only
await page
  .getByRole('button', { name: /preview/i })
  .first()
  .click();
await header(2).click({ force: true });
check('headers are not editable in preview', (await tid('period-edit-popover').count()) === 0);

console.log('errors:', errors.slice(0, 8));
if (errors.length) failed++;
await browser.close();
server.httpServer.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log('All period checks passed');
