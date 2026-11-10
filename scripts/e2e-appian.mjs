// Headless check of the Appian brand themes: card placement, lock matrix, header, single layouts,
// milestone shapes, sub-section bands, exit behaviour and exports. Run `npm run build` first.
// Screenshots land in ./e2e-output.
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
const bg = (locator) => locator.evaluate((el) => getComputedStyle(el).backgroundColor);

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
  'no section / period layout picker (one approved layout each)',
  (await count('appian-layout-options')) === 0
);

// 2. Enable Appian Dark and check the lock matrix
await tid('appian-theme-dark-btn').click();
await page.waitForSelector('[data-testid="appian-mode-banner"]');
for (const t of ['fonts', 'effects', 'header', 'period', 'section', 'subsection', 'task', 'bars']) {
  check(`locked: ${t}`, (await count(`config-tab-lock-${t}`)) === 1);
}
for (const t of [
  'timeline',
  'banner',
  'themes',
  'legend',
  'condensed',
  'grid',
  'numbering',
  'milestones',
]) {
  check(`editable: ${t}`, (await count(`config-tab-lock-${t}`)) === 0);
}

// 3. Logo locked; owner and the other header details are editable
await tid('config-tab-banner').click();
check(
  'logo uploader replaced by the brand note',
  (await count('banner-logo-brand-note')) === 1 && (await count('banner-logo-file-input')) === 0
);
check('Owner / Team is editable again', await tid('banner-owner-input').isEnabled());
await tid('banner-owner-input').fill('Platform Team');
await page.fill('[aria-label="Subtitle / strategic goal"]', 'Serious AI. Built on Process.');

// 4. Milestones: shapes selectable, colors locked, grouped list of 15
await tid('config-tab-milestones').click();
const shapeIds = await page
  .locator('[data-testid^="milestone-shape-"]')
  .evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-testid').replace('milestone-shape-', ''))
  );
check(
  `15 shapes: flags, then pins, then ducks (${shapeIds.slice(9).join(', ')})`,
  shapeIds.length === 15 &&
    shapeIds.slice(9).join() === 'flag,appian-flag,map-pin,push-pin,duck-egg,yellow-duck'
);
check(
  'milestone colors are locked in Appian modes',
  (await tid('config-milestone-colors').getAttribute('aria-disabled')) === 'true'
);
await tid('milestone-shape-map-pin').click();
await page.waitForTimeout(250);
await page.screenshot({ path: `${OUT}/appian-03-milestones.png` });

// 5. Corner style pinned, numbering toggles still work
await tid('config-tab-grid').click();
check(
  'corner picker disabled',
  (await tid('config-corner-style').getAttribute('aria-disabled')) === 'true'
);
await tid('config-tab-numbering').click();
await page.check('[data-testid="config-number-sections"]');

// 6. Save and verify the canvas (dark)
await tid('save-config-btn').click();
await page.waitForSelector('[data-testid="roadmap-export-canvas"]');
await page.keyboard.press('Escape');
check('header rendered', (await count('appian-header')) === 1);
const tag = await tid('appian-node-tag').boundingBox();
const canvas = await tid('roadmap-export-canvas').boundingBox();
const gap = tag.x - canvas.x;
check(`node tag inset from the left edge (${Math.round(gap)}px)`, gap >= 12 && gap <= 28);
check('node tag hangs from the top edge', tag.y - canvas.y < 4);
check(
  'owner shown in the Appian header',
  (await tid('appian-header').innerText()).includes('Platform Team')
);
check('dark theme uses the white logo', /white/.test(await tid('appian-logo').getAttribute('src')));
const font = await tid('roadmap-export-canvas').evaluate((el) => getComputedStyle(el).fontFamily);
check('Funnel Sans applied', /Funnel Sans/.test(font));

// Period header: the Tab layout, with no line across the top
const ph = tid('period-header-1');
check('period header has no node glyph', (await ph.locator('svg').count()) === 0);
check(
  'period header has no top border',
  (await ph.evaluate((el) => getComputedStyle(el).borderTopWidth)) === '0px'
);
const tab = ph.locator('span').first();
check(
  'period tab is flush with the top-left of the cell',
  (await tab.boundingBox()).y - (await ph.boundingBox()).y < 2
);

// Section spine: a solid band in the theme color
const spine = page
  .locator('[data-testid="roadmap-export-canvas"] span[style*="vertical-rl"]')
  .first();
check('section renders as a vertical spine', (await spine.count()) === 1);
const spineBg = await bg(spine.locator('xpath=ancestor::div[contains(@class,"sticky")][1]'));
check(`spine is the dark-theme band color (${spineBg})`, spineBg === 'rgb(35, 34, 240)');

// Task rows: no marker line
const taskRow = page.locator('[data-testid^="task-row-"]').first();
const markers = await taskRow.locator('span[style*="width: 2px"]').count();
check('task rows have no accent line', markers === 0);

// Sub-section: opaque band, same fill under the label and across the timeline
const subLabel = page.getByText('Workstream 1', { exact: true }).first();
const subRow = subLabel.locator('xpath=ancestor::div[contains(@class,"items-stretch")][1]');
const subRowBg = await bg(subRow);
const subCellBg = await bg(subLabel.locator('xpath=ancestor::div[contains(@class,"sticky")][1]'));
check(`sub-section band is opaque (${subRowBg})`, /^rgb\(/.test(subRowBg));
check('sub-section label cell matches the band', subRowBg === subCellBg);
check(
  'sub-section band has a hairline above it',
  (await subRow.evaluate((el) => getComputedStyle(el).borderTopWidth)) === '1px'
);

const c2 = await page.locator('[data-testid="cell-task-1-2"]').boundingBox();
const c4 = await page.locator('[data-testid="cell-task-1-4"]').boundingBox();
await page.mouse.move(c2.x + c2.width / 2, c2.y + c2.height / 2);
await page.mouse.down();
await page.mouse.move(c4.x + c4.width / 2, c4.y + c4.height / 2, { steps: 6 });
await page.mouse.up();
await page.waitForTimeout(300);
// Drawing a bar opens its popover: add an end milestone so the chosen shape is on screen.
const endMs = page.locator('[data-testid="timeline-item-popover"] input[type="checkbox"]').first();
if (await endMs.count()) await endMs.check();
await page.mouse.click(1100, 1000);
await page.waitForTimeout(300);
check(
  'end milestone uses the picked shape (map pin)',
  (await page.locator('[data-milestone-shape="map-pin"]').count()) > 0
);
await page.screenshot({ path: `${OUT}/appian-04-dark-canvas.png` });

// 6b. PNG export keeps the logo and brand font (the logo is an image asset)
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

// 7. Light: the picked shape and every layout carry over
await openConfig();
await tid('appian-theme-light-btn').click();
await saveConfig();
check('light theme uses the blue logo', /blue/.test(await tid('appian-logo').getAttribute('src')));
check(
  'picked milestone shape survives the theme switch',
  (await page.locator('[data-milestone-shape="map-pin"]').count()) > 0
);
await page.screenshot({ path: `${OUT}/appian-05-light-canvas.png` });

// 8. Slate, with the push pin and brand flag
await openConfig();
await tid('appian-theme-slate-btn').click();
await tid('config-tab-milestones').click();
await tid('milestone-shape-push-pin').click();
await saveConfig();
check(
  'slate theme uses the white logo',
  /white/.test(await tid('appian-logo').getAttribute('src'))
);
const slateBg = await bg(tid('roadmap-export-canvas'));
check(`slate canvas is Standard Slate (${slateBg})`, slateBg === 'rgb(47, 58, 82)');
check(
  'push pin milestone on slate',
  (await page.locator('[data-milestone-shape="push-pin"]').count()) > 0
);
await page.screenshot({ path: `${OUT}/appian-07-slate-canvas.png` });

// 9. Entering Appian from another theme starts with the brand flag; leaving restores defaults
await openConfig();
await tid('theme-custom-btn').click();
check('banner removed after choosing another theme', (await count('appian-mode-banner')) === 0);
check('tabs unlocked again', (await count('config-tab-lock-fonts')) === 0);
await tid('appian-theme-light-btn').click();
await saveConfig();
check(
  're-entering Appian starts with the brand flag',
  (await page.locator('[data-milestone-shape="appian-flag"]').count()) > 0
);
await page.screenshot({ path: `${OUT}/appian-08-light-flag.png` });
await openConfig();
await tid('theme-custom-btn').click();
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
