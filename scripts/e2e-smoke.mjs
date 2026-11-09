// Headless smoke test: builds nothing, serves ./dist via vite preview and drives the app with Playwright.
// Run `npm run build` first, then `npm run test:e2e`. Screenshots and downloads land in ./e2e-output.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4173, strictPort: true, host: '127.0.0.1' } });

const OUT = './e2e-output';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  acceptDownloads: true,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

await page.goto('http://127.0.0.1:4173/');
await page.waitForSelector('[data-testid="create-roadmap-btn"]', { timeout: 15000 });
// The button idles with a bobbing animation, so Playwright's "stable" check can flake.
await page.locator('[data-testid="create-roadmap-btn"]').click({ force: true });
await page.waitForSelector('[data-testid="config-modal"]');
await page.fill('[data-testid="config-roadmap-name"]', 'Smoke Test Roadmap');
await page.screenshot({ path: `${OUT}/01-config-modal.png` });

// numbering on + header
await page.click('[data-testid="config-tab-numbering"]');
await page.check('[data-testid="config-number-sections"]');
await page.check('[data-testid="config-number-tasks"]');
await page.click('[data-testid="config-tab-effects"]');
await page.screenshot({ path: `${OUT}/02-config-effects.png` });
await page.click('[data-testid="save-config-btn"]');
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
await page.keyboard.press('Escape'); // first-run "your work is a temporary draft" notice
await page.screenshot({ path: `${OUT}/03-workspace.png` });

// draw a bar over periods 2-3 on task-1
const c2 = await page.locator('[data-testid="cell-task-1-2"]').boundingBox();
const c3 = await page.locator('[data-testid="cell-task-1-3"]').boundingBox();
await page.mouse.move(c2.x + c2.width / 2, c2.y + c2.height / 2);
await page.mouse.down();
await page.mouse.move(c3.x + c3.width / 2, c3.y + c3.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
const popoverOpen = await page.locator('[data-testid="timeline-item-popover"]').count();
console.log('popover after drawing bar:', popoverOpen);
await page.screenshot({ path: `${OUT}/04-bar-popover.png` });

// close popover, click bar again to verify click-to-edit still works
await page.mouse.click(1100, 950);
await page.waitForTimeout(200);
const item = page.locator('[data-testid^="timeline-item-"]').first();
const clickBox = await item.boundingBox();
await page.mouse.click(clickBox.x + clickBox.width / 2, clickBox.y + clickBox.height / 2);
await page.waitForTimeout(300);
console.log(
  'popover after clicking bar:',
  await page.locator('[data-testid="timeline-item-popover"]').count()
);
await page.mouse.click(1100, 950);
await page.waitForTimeout(200);

// resize from the LEFT handle by one period to the left
const before = await item.boundingBox();
await item.hover();
const grip = page.locator('[data-testid^="timeline-item-"] .resize-grip').first();
const g = await grip.boundingBox();
const colW = c3.x - c2.x;
await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
await page.mouse.down();
await page.mouse.move(g.x + g.width / 2 - colW * 0.6, g.y + g.height / 2, { steps: 8 });
await page.mouse.move(g.x + g.width / 2 - colW, g.y + g.height / 2, { steps: 8 });
await page.screenshot({ path: `${OUT}/05-resizing.png` });
await page.mouse.up();
await page.waitForTimeout(300);
const after = await page.locator('[data-testid^="timeline-item-"]').first().boundingBox();
console.log(
  'bar before',
  Math.round(before.x),
  Math.round(before.width),
  'after',
  Math.round(after.x),
  Math.round(after.width),
  'colW',
  Math.round(colW)
);
console.log(
  'left edge moved left:',
  after.x < before.x - colW * 0.8,
  ' right edge fixed:',
  Math.abs(after.x + after.width - (before.x + before.width)) < 3
);
await page.screenshot({ path: `${OUT}/06-after-resize.png` });

// export modal
await page.click('[data-testid="export-btn"]');
await page.waitForSelector('[data-testid="export-modal"]');
await page.screenshot({ path: `${OUT}/07-export-modal.png` });
await page.check('[data-testid="export-option-excel"]');
await page.check('[data-testid="export-option-pdf"]');
const downloads = [];
page.on('download', async (d) => {
  const name = d.suggestedFilename();
  await d.saveAs(`${OUT}/${name}`);
  downloads.push(name);
});
await page.click('[data-testid="export-run-btn"]');
await page.waitForSelector('[data-testid="export-modal"]', { state: 'detached', timeout: 60000 });
await page.waitForTimeout(1500);
console.log('downloads:', downloads);
console.log('errors:', errors.slice(0, 8));
await browser.close();
server.httpServer.close();
