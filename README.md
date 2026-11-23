# Roadmap Builder

A browser-based roadmap designer. Build multi-track timelines (sections, sub-sections, tasks, bars and
milestones), restyle them with themes and effects, and export to JSON, PNG, PDF or XLSX. Everything runs
client-side. The hosted web version keeps data in `localStorage`; the optional desktop app (Windows, macOS,
Linux) saves each roadmap as a file on your computer with automatic version history.

## Getting started

Requires Node 24 (`nvm use` reads `.nvmrc`).

```bash
npm ci
npm run dev
```

| Script                 | Purpose                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Vite dev server                                                                                            |
| `npm run build`        | Production build to `dist/`                                                                                |
| `npm run lint`         | ESLint                                                                                                     |
| `npm run typecheck`    | TypeScript type checking via `tsc`                                                                         |
| `npm run format:check` | Prettier formatting check                                                                                  |
| `npm run format`       | Prettier auto-formatting                                                                                   |
| `npm test`             | Vitest unit tests (date math, state normalization, design options, import validation, reducer, history)    |
| `npm run test:e2e`     | Playwright smoke & state tests against `vite preview` (run `npm run build` first; output in `e2e-output/`) |

## Desktop app (Electron)

Same code as the web app, wrapped in Electron (`electron/`). Roadmaps are plain `<name>.roadmap.json` files in a
library folder (default `Documents/Roadmaps`, changeable under File → Change Library Folder). Edits autosave to
the file. Version history lives in `<library>/.history/`: automatic snapshots (about every 10 minutes while
editing and on close), named versions (File → Save Version), and pinned "master" versions that are never pruned
(newest 50 unpinned versions are kept). The landing page has a **Browse Roadmaps** pad that opens a searchable
grid of everything in the library.

| Script                         | Purpose                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `npm run electron:dev`         | Vite dev server + Electron window with hot reload                    |
| `npm run electron:start`       | Build, then run the desktop app from source                          |
| `npm run dist:win`             | Build installer(s) into `release/` (also `dist:mac`, `dist:linux`)   |
| `node scripts/e2e-desktop.mjs` | Desktop end-to-end test (set `DESKTOP_EXE` to test a packaged build) |

**Releases:** bump `version` in `package.json` and merge it, then open the Actions tab, choose
"Release desktop app" and click **Run workflow**. `.github/workflows/release.yml` builds all three platforms and
publishes the GitHub Release `v<version>` (it stops early if that version was already released). The web app's
"Download the desktop app" link points at the latest release.

**Unsigned builds:** there are no paid code-signing certificates, so first launch shows warnings. Windows
SmartScreen: _More info → Run anyway_. macOS: right-click the app → _Open_ (and, if blocked, allow it in System
Settings → Privacy & Security). Windows and Linux AppImage update themselves; macOS only shows a "new version
available" notice with a download link, because macOS cannot install unsigned updates automatically.

## Editing periods

Click a period header (e.g. _Sprint 5_) to rename it or change its length in weeks; later periods shift to follow
and bars stay on their periods. **Configure → Timeline** lists every period and has bulk tools (set all periods
to N weeks, or make every Nth period X weeks).

## Deployment

Pushes to `main` run lint, tests and build, then publish `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same checks (`ci.yml`).

## Architecture

See [AGENTS.md](./AGENTS.md) for the file map and conventions, and
[`src/types/roadmap.d.ts`](./src/types/roadmap.d.ts) for the data model.
