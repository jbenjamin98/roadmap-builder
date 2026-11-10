// Headless checks for two editing fixes:
//  1. Clicking out of a timeline item's popover must not create a new bar.
//  2. Legend styles offer the same choices (preset styles, swatches, custom) when creating and editing.
// Run `npm run build` first. PW_CHANNEL=msedge|chrome uses an installed browser.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4175, strictPort: true, host: '127.0.0.1' } });
const OUT = './e2e-output';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(
  process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}
);
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

let failed = 0;
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
};
const tid = (id) => page.locator(`[data-testid="${id}"]`);
const itemCount = () =>
  page
    .locator('[data-testid^="timeline-item-"]:not([data-testid="timeline-item-popover"])')
    .count();
const cellCenter = async (id) => {
  const b = await tid(id).boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
const click = async (pt) => {
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(350);
};

await page.goto('http://127.0.0.1:4175/');
await page.waitForSelector('[data-testid="create-roadmap-btn"]', { timeout: 15000 });
await tid('create-roadmap-btn').click({ force: true });
await page.waitForSelector('[data-testid="config-modal"]');
await page.fill('[data-testid="config-roadmap-name"]', 'Editing Checks');
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
await page.keyboard.press('Escape'); // first-run draft notice

// ---- 1. Click-out of the popover ------------------------------------------------------
const c2 = await cellCenter('cell-task-1-2');
const c3 = await cellCenter('cell-task-1-3');
await page.mouse.move(c2.x, c2.y);
await page.mouse.down();
await page.mouse.move(c3.x, c3.y, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(350);
check('drawing a bar opens its popover', (await tid('timeline-item-popover').count()) === 1);
check('one bar exists', (await itemCount()) === 1);

await click(await cellCenter('cell-task-1-6')); // click elsewhere on the canvas
check('popover closed by the outside click', (await tid('timeline-item-popover').count()) === 0);
check('outside click did NOT create a new bar', (await itemCount()) === 1);

// Opening and closing again, this time through an empty cell in the same row as the bar
await page.locator('[data-testid^="timeline-item-"]').first().click();
await page.waitForTimeout(300);
check('clicking the bar re-opens the popover', (await tid('timeline-item-popover').count()) === 1);
await click(await cellCenter('cell-task-1-7'));
check(
  'second outside click closes it without creating a bar',
  (await tid('timeline-item-popover').count()) === 0 && (await itemCount()) === 1
);

// Regression: with no popover open, clicking an empty cell still draws a bar
await click(await cellCenter('cell-task-1-5'));
check('with no popover open, a click still creates a bar', (await itemCount()) === 2);
await page.keyboard.press('Escape');
await page.mouse.click(1100, 1000);
await page.waitForTimeout(300);

// ---- 2. Legend styles: same choices when creating and editing -------------------------
const createForm = page.locator('form:has([data-testid="new-legend-input"])');
const presetBtns = (scope) =>
  scope.locator('button[title="Primary"], button[title^="Accent"], button[title="Blend"]');
const swatchBtns = (scope) => scope.locator('button[title^="Use theme color"]');

check('create form offers 6 preset styles', (await presetBtns(createForm).count()) === 6);
check('create form offers theme swatches', (await swatchBtns(createForm).count()) === 5);

const previewBg = () =>
  tid('new-legend-preview').evaluate((el) => getComputedStyle(el).backgroundImage);
const before = await previewBg();
await presetBtns(createForm).nth(2).click();
const afterPreset = await previewBg();
const presetBg = await presetBtns(createForm)
  .nth(2)
  .evaluate((el) => getComputedStyle(el).backgroundImage);
check(
  'picking a preset style in the create form updates the preview',
  afterPreset !== before && afterPreset === presetBg
);
await swatchBtns(createForm).nth(3).click();
check(
  'picking a swatch in the create form updates the preview',
  (await previewBg()) !== afterPreset
);

await tid('new-legend-input').fill('Preset created');
await presetBtns(createForm).nth(1).click();
await tid('add-legend-btn').click();
await page.waitForTimeout(300);
const editBtns = page.locator('[data-testid^="edit-legend-style-"]');
check('new category was added', (await editBtns.count()) === 2);

// Edit the new category: it must offer presets AND swatches, and both must work
await editBtns.nth(1).click();
const editor = page
  .locator('[data-testid^="legend-striped-"]')
  .last()
  .locator('xpath=ancestor::div[contains(@class,"space-y-2.5")][1]');
check('editor offers 6 preset styles', (await presetBtns(editor).count()) === 6);
check('editor offers theme swatches', (await swatchBtns(editor).count()) === 5);
check(
  'the preset chosen at creation is highlighted in the editor',
  (await presetBtns(editor).nth(1).getAttribute('class')).includes('ring-indigo-400')
);
await swatchBtns(editor).nth(2).click();
check(
  'a swatch can be chosen while editing (highlighted, preset no longer selected)',
  (await swatchBtns(editor).nth(2).getAttribute('class')).includes('ring-indigo-400') &&
    !(await presetBtns(editor).nth(1).getAttribute('class')).includes('ring-indigo-400')
);
await presetBtns(editor).nth(4).click();
check(
  'a preset style can be chosen while editing',
  (await presetBtns(editor).nth(4).getAttribute('class')).includes('ring-indigo-400')
);
await page.screenshot({
  path: `${OUT}/editing-legend.png`,
  clip: { x: 0, y: 160, width: 384, height: 700 },
});

console.log('errors:', errors.slice(0, 8));
if (errors.length) failed++;
await browser.close();
server.httpServer.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
