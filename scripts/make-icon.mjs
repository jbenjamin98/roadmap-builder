// Renders public/favicon.svg to build/icon.png (1024x1024) for electron-builder, which derives the
// .ico/.icns from it. Re-run only if the favicon changes: `node scripts/make-icon.mjs`.
import { chromium } from 'playwright';
import fs from 'node:fs';

const svg = fs.readFileSync('public/favicon.svg', 'utf8');
const browser = await chromium.launch(
  process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}
);
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.setContent(
  `<body style="margin:0;background:transparent">${svg.replace('<svg ', '<svg width="1024" height="1024" ')}</body>`
);
fs.mkdirSync('build', { recursive: true });
await page.screenshot({ path: 'build/icon.png', omitBackground: true });
await browser.close();
console.log('wrote build/icon.png');
