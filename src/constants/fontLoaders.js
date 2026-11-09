import { FONT_STYLES } from './fontStyles';

/**
 * Self-hosted web fonts, loaded on demand. Each loader pulls in one family's @font-face CSS as its
 * own chunk (the .woff2 files are same-origin, hashed, and fetched per unicode-range subset only when
 * text actually uses them). Inter and JetBrains Mono (UI chrome) are loaded eagerly in main.jsx.
 */
const LOADERS = {
  sans: () => import('@fontsource-variable/inter/index.css'),
  display: () => import('@fontsource-variable/plus-jakarta-sans/index.css'),
  serif: () => import('@fontsource-variable/playfair-display/index.css'),
  mono: () => import('@fontsource-variable/jetbrains-mono/index.css'),
  dmsans: () => import('@fontsource-variable/dm-sans/index.css'),
  grotesk: () => import('@fontsource-variable/space-grotesk/index.css'),
  merriweather: () => import('@fontsource-variable/merriweather/index.css'),
  outfit: () => import('@fontsource-variable/outfit/index.css'),
  sora: () => import('@fontsource-variable/sora/index.css'),
  manrope: () => import('@fontsource-variable/manrope/index.css'),
  lora: () => import('@fontsource-variable/lora/index.css'),
  fraunces: () => import('@fontsource-variable/fraunces/index.css'),
  ibmplex: () => import('@fontsource-variable/ibm-plex-sans/index.css'),
  firacode: () => import('@fontsource-variable/fira-code/index.css'),
  nunito: () => import('@fontsource-variable/nunito/index.css'),
  montserrat: () => import('@fontsource-variable/montserrat/index.css'),
  raleway: () => import('@fontsource-variable/raleway/index.css'),
  worksans: () => import('@fontsource-variable/work-sans/index.css'),
  rubik: () => import('@fontsource-variable/rubik/index.css'),
  sourcesans: () => import('@fontsource-variable/source-sans-3/index.css'),
  karla: () => import('@fontsource-variable/karla/index.css'),
  baskerville: () => import('@fontsource-variable/libre-baskerville/index.css'),
  crimson: () => import('@fontsource-variable/crimson-pro/index.css'),
  bitter: () => import('@fontsource-variable/bitter/index.css'),
  josefin: () => import('@fontsource-variable/josefin-sans/index.css'),
  funnel: () => import('@fontsource-variable/funnel-sans/index.css'),
  poppins: () =>
    Promise.all([
      import('@fontsource/poppins/400.css'),
      import('@fontsource/poppins/500.css'),
      import('@fontsource/poppins/600.css'),
      import('@fontsource/poppins/700.css'),
    ]),
  spacemono: () =>
    Promise.all([
      import('@fontsource/space-mono/400.css'),
      import('@fontsource/space-mono/700.css'),
    ]),
};

const loaded = new Map();

const primaryFamily = (id) => {
  const font = FONT_STYLES.find((f) => f.id === id);
  return font?.fontFamily.split(',')[0].trim();
};

/**
 * Loads the font for a font-style id and resolves once the browser has the glyph data, so exports
 * never capture a fallback font. Safe to call repeatedly; failures resolve (the fallback stack is used).
 */
export function loadFont(id) {
  if (!LOADERS[id]) return Promise.resolve();
  if (!loaded.has(id)) {
    const family = primaryFamily(id);
    const task = LOADERS[id]()
      .then(() =>
        Promise.all(
          [400, 700].map((w) => document.fonts?.load(`${w} 16px ${family}`).catch(() => []))
        )
      )
      .catch((err) => {
        console.warn(`Could not load font "${id}"`, err);
        loaded.delete(id); // allow a retry later
      });
    loaded.set(id, task);
  }
  return loaded.get(id);
}

/** Loads every family (used by the Typography tab so each option previews in its own font). */
export function loadAllFonts() {
  return Promise.all(Object.keys(LOADERS).map(loadFont));
}
