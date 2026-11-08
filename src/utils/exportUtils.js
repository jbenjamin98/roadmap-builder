import { domToBlob } from 'modern-screenshot';

/** Resolves after the browser has painted twice (lets React commit mode changes). */
export const nextPaint = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

// Browsers cap canvas size (about 16k px per side and ~270M px total); stay well inside it.
const MAX_SIDE = 16000;
const MAX_AREA = 120e6;

const safeScale = (w, h, wanted) => {
  const bySide = MAX_SIDE / Math.max(w, h);
  const byArea = Math.sqrt(MAX_AREA / (w * h));
  return Math.max(0.25, Math.min(wanted, bySide, byArea));
};

const boxSize = (node) => {
  const r = node.getBoundingClientRect();
  return { width: Math.ceil(r.width), height: Math.ceil(r.height) };
};

/**
 * Renders the roadmap canvas to a PNG Blob using the browser's own renderer.
 * While exporting, sticky positioning and editor-only controls are neutralised via CSS
 * (see the [data-exporting] rules in index.css) so the FULL roadmap is captured.
 *
 * It tries progressively simpler settings so one failing feature (web-font embedding,
 * very large output) cannot stop the export, and throws the last real error if all fail.
 */
export async function renderRoadmapPng(node, { backgroundColor, scale = 2 } = {}) {
  node.setAttribute('data-exporting', 'true');
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await nextPaint();
    const { width, height } = boxSize(node);

    const attempts = [
      { label: 'full quality', scale, font: true },
      { label: 'without web-font embedding', scale, font: false },
      { label: 'standard resolution', scale: 1, font: false },
    ];

    let lastError = new Error('Unknown export error');
    for (const attempt of attempts) {
      try {
        const blob = await domToBlob(node, {
          type: 'image/png',
          scale: safeScale(width, height, attempt.scale),
          backgroundColor,
          width,
          height,
          ...(attempt.font ? {} : { font: false }),
        });
        if (blob && blob.size > 0) return blob;
        lastError = new Error('The browser produced an empty image');
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`PNG export attempt failed (${attempt.label}):`, err);
      }
    }
    throw lastError;
  } finally {
    node.removeAttribute('data-exporting');
  }
}

/**
 * Opens the browser print dialog for the roadmap as ONE page.
 *
 * The roadmap is wrapped in an SVG (viewBox = its real size) so it scales to fit whatever paper
 * the browser uses, instead of overflowing to the right when the paper is narrower than the
 * roadmap. The page size is also set to match, which browsers that honour it use exactly.
 * Choose "Save as PDF" as the destination.
 */
export function printRoadmapPdf(node, title = 'roadmap') {
  // Use the real border-box size (scrollHeight ignores the canvas border).
  const { width, height } = boxSize(node);
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XHTML_NS = 'http://www.w3.org/1999/xhtml';

  const host = document.createElement('div');
  host.id = 'roadmap-print-root';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', '100%');
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = 'auto';

  const fo = document.createElementNS(SVG_NS, 'foreignObject');
  fo.setAttribute('x', '0');
  fo.setAttribute('y', '0');
  fo.setAttribute('width', String(width));
  fo.setAttribute('height', String(height));

  const wrapper = document.createElementNS(XHTML_NS, 'div');
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  const clone = node.cloneNode(true);
  clone.setAttribute('data-exporting', 'true');
  clone.style.width = `${width}px`;
  clone.style.margin = '0';
  wrapper.appendChild(clone);
  fo.appendChild(wrapper);
  svg.appendChild(fo);
  host.appendChild(svg);
  document.body.appendChild(host);

  const pageStyle = document.createElement('style');
  pageStyle.textContent = `@page { size: ${width}px ${height + 2}px; margin: 0; }`;
  document.head.appendChild(pageStyle);

  const previousTitle = document.title;
  document.title = title;

  const cleanup = () => {
    host.remove();
    pageStyle.remove();
    document.title = previousTitle;
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
}
