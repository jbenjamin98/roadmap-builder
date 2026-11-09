// Headless check of the Appian brand themes: card placement, lock matrix, header, layout options,
// exit behaviour and exports. Run `npm run build` first. Screenshots land in ./e2e-output.
// Set PW_CHANNEL=msedge (or chrome) to use an installed browser instead of Playwright's bundled one.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4174, strictPort: true, host: '127.0.0.1' } });
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
const count = (id) => tid(id).count();
const PREVIEW_CLIP = { x: 948, y: 150, width: 914, height: 740 };

const openConfig = async () => {
  await tid('open-config-btn').click();
  await page.waitForSelector('[data-testid="config-modal"]');
  await tid('config-tab-themes').click();
};
const saveConfig = async () => {
  await tid('save-config-btn').click();
  await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
  await page.waitForTimeout(400);
};

await page.goto('http://127.0.0.1:4174/');
await page.waitForSelector('[data-testid="create-roadmap-btn"]', { timeout: 15000 });
await tid('create-roadmap-btn').click({ force: true });
await page.waitForSelector('[data-testid="config-modal"]');
await page.fill('[data-testid="config-roadmap-name"]', 'Appian Roadmap');

// 1. Placement: Custom Palette, then Appian, then Ultimate Duck Mode
await tid('config-tab-themes').click();
await page.waitForSelector('[data-testid="appian-themes-section"]');
const y = async (id) => (await tid(id).boundingBox()).y;
const [yCustom, yAppian, yDuck] = [
  await y('theme-custom-btn'),
  await y('appian-themes-section'),
  await y('ultimate-duck-mode-card'),
];
check(
  'Appian cards sit below Custom Palette and above Ultimate Duck Mode',
  yCustom < yAppian && yAppian < yDuck
);
check(
  'three Appian cards (Light, Dark, Slate), not in the preset galleries',
  (await page.locator('[data-testid^="appian-theme-"]').count()) === 3
);
check(
  'layout options hidden until a brand theme is active',
  (await count('appian-layout-options')) === 0
);

// 2. Enable Appian Dark and check the lock matrix
await tid('appian-theme-dark-btn').click();
await page.waitForSelector('[data-testid="appian-mode-banner"]');
for (const t of [
  'fonts',
  'effects',
  'header',
  'period',
  'section',
  'subsection',
  'task',
  'bars',
  'milestones',
]) {
  check(`locked: ${t}`, (await count(`config-tab-lock-${t}`)) === 1);
}
for (const t of ['timeline', 'banner', 'themes', 'legend', 'condensed', 'grid', 'numbering']) {
  check(`editable: ${t}`, (await count(`config-tab-lock-${t}`)) === 0);
}
check('layout options appear in a brand theme', (await count('appian-layout-options')) === 1);
check(
  '3 section + 5 period layout options',
  (await page.locator('[data-testid^="appian-section-style-"]').count()) === 3 &&
    (await page.locator('[data-testid^="appian-period-style-"]').count()) === 5
);
await page.screenshot({ path: `${OUT}/appian-02-dark-selected.png` });

// 3. Logo and owner are locked, other header details are not
await tid('config-tab-banner').click();
check(
  'logo uploader replaced by the brand note',
  (await count('banner-logo-brand-note')) === 1 && (await count('banner-logo-file-input')) === 0
);
check('Owner / Team is disabled in brand themes', await tid('banner-owner-input').isDisabled());
await page.fill('[aria-label="Subtitle / strategic goal"]', 'Serious AI. Built on Process.');

// 4. Corner style pinned, numbering toggles still work
await tid('config-tab-grid').click();
check(
  'corner picker disabled',
  (await tid('config-corner-style').getAttribute('aria-disabled')) === 'true'
);
await tid('config-tab-numbering').click();
await page.check('[data-testid="config-number-sections"]');

// 5. Save and verify the canvas (dark)
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
await page.keyboard.press('Escape');
check('header rendered', (await count('appian-header')) === 1);
check('node tag rendered', (await count('appian-node-tag')) === 1);
const tag = await tid('appian-node-tag').boundingBox();
const canvas = await tid('roadmap-export-canvas').boundingBox();
const gap = tag.x - canvas.x;
check(`node tag inset from the left edge (${Math.round(gap)}px)`, gap >= 12 && gap <= 28);
check('node tag hangs from the top edge', tag.y - canvas.y < 4);
check('dark theme uses the white logo', /white/.test(await tid('appian-logo').getAttribute('src')));
const font = await tid('roadmap-export-canvas').evaluate((el) => getComputedStyle(el).fontFamily);
check('Funnel Sans applied', /Funnel Sans/.test(font));
check(
  'default period layout is Index (no node glyph)',
  (await tid('period-header-1').locator('svg').count()) === 0
);

const c2 = await page.locator('[data-testid="cell-task-1-2"]').boundingBox();
const c4 = await page.locator('[data-testid="cell-task-1-4"]').boundingBox();
await page.mouse.move(c2.x + c2.width / 2, c2.y + c2.height / 2);
await page.mouse.down();
await page.mouse.move(c4.x + c4.width / 2, c4.y + c4.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
// Drawing a bar opens its popover: add an end milestone so the flag is on screen.
const endMs = page.locator('[data-testid="timeline-item-popover"] input[type="checkbox"]').first();
if (await endMs.count()) await endMs.check();
await page.mouse.click(1100, 1000);
await page.waitForTimeout(300);
check(
  'end milestone uses the brand flag',
  (await page.locator('[data-milestone-shape="appian-flag"]').count()) > 0
);
await page.screenshot({ path: `${OUT}/appian-04-dark-canvas.png` });

// 5b. PNG export keeps the logo and brand font (the logo is an image asset)
const pngDownloads = [];
page.on('download', async (d) => {
  const name = d.suggestedFilename();
  if (name.endsWith('.png')) {
    await d.saveAs(`${OUT}/appian-export.png`);
    pngDownloads.push(name);
  }
});
await tid('export-btn').click();
await page.waitForSelector('[data-testid="export-modal"]');
await tid('export-run-btn').click();
await page.waitForSelector('[data-testid="export-modal"]', { state: 'detached', timeout: 60000 });
await page.waitForTimeout(1500);
check('PNG export downloaded', pngDownloads.length === 1);

// 6. Light
await openConfig();
await tid('appian-theme-light-btn').click();
await saveConfig();
check('light theme uses the blue logo', /blue/.test(await tid('appian-logo').getAttribute('src')));
await page.screenshot({ path: `${OUT}/appian-05-light-canvas.png` });

// 7. Slate, plus a gallery of every section and period layout option
await openConfig();
await tid('appian-theme-slate-btn').click();
await page.waitForTimeout(300);
for (const id of ['appian-rail', 'appian-underline', 'appian-solid']) {
  await tid(`appian-section-style-${id}`).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/variant-section-${id}.png`, clip: PREVIEW_CLIP });
}
await tid('appian-section-style-appian-rail').click();
for (const id of ['appian-index', 'appian-tab', 'appian-span', 'appian-chip', 'appian-eyebrow']) {
  await tid(`appian-period-style-${id}`).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/variant-period-${id}.png`, clip: PREVIEW_CLIP });
}
await tid('appian-period-style-appian-index').click();
await saveConfig();
check(
  'slate theme uses the white logo',
  /white/.test(await tid('appian-logo').getAttribute('src'))
);
const slateBg = await tid('roadmap-export-canvas').evaluate(
  (el) => getComputedStyle(el).backgroundColor
);
check(`slate canvas is Standard Slate (${slateBg})`, slateBg === 'rgb(47, 58, 82)');
await page.screenshot({ path: `${OUT}/appian-07-slate-canvas.png` });

// 8. A chosen layout sticks across theme switches and the canvas follows it
await openConfig();
await tid('appian-section-style-appian-solid').click();
await tid('appian-period-style-appian-chip').click();
await tid('appian-theme-dark-btn').click();
check(
  'chosen layouts survive a theme switch',
  (await tid('appian-section-style-appian-solid').getAttribute('class')).includes('indigo-500') &&
    (await tid('appian-period-style-appian-chip').getAttribute('class')).includes('indigo-500')
);
await saveConfig();
await page.screenshot({ path: `${OUT}/appian-08-dark-solid-chip.png` });

// 9. Picking another theme exits the Appian theme
await openConfig();
await tid('theme-custom-btn').click();
check('banner removed after choosing another theme', (await count('appian-mode-banner')) === 0);
check('tabs unlocked again', (await count('config-tab-lock-fonts')) === 0);
check('layout options removed', (await count('appian-layout-options')) === 0);
await saveConfig();
check('Appian header gone from the canvas', (await count('appian-header')) === 0);
await page.screenshot({ path: `${OUT}/appian-06-exited.png` });

console.log('errors:', errors.slice(0, 8));
if (errors.length) failed++;
await browser.close();
server.httpServer.close();
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
