# Roadmap Builder – agent guide

Client-only React 19 + Vite 8 + Tailwind 3 app that builds visual roadmaps. No backend; state lives in
`localStorage` and can be imported/exported as JSON, PNG, PDF or XLSX. Deployed to GitHub Pages.
Requires Node 24 (see `.nvmrc`).

## Commands

| Task                            | Command                             |
| ------------------------------- | ----------------------------------- |
| Dev server                      | `npm run dev`                       |
| Format check                    | `npm run format:check`              |
| Format auto-fix                 | `npm run format`                    |
| Lint                            | `npm run lint`                      |
| Type check                      | `npm run typecheck`                 |
| Unit tests (Vitest, pure logic) | `npm test`                          |
| Build                           | `npm run build`                     |
| E2E smoke & state               | `npm run build && npm run test:e2e` |

Run format:check + lint + typecheck + test + build before finishing a change. CI (`.github/workflows`) runs the same.

## Data model

Read `src/types/roadmap.d.ts` first. It describes `RoadmapState` (config, legend, sections > subSections,
tasks, timelineItems), `Design`, `ConfigModalContext`, and `RoadmapActions`. Never read big UI files just to learn a shape.

## Where things live

```
src/App.jsx                    view switching (landing | workspace) + modal wiring & shortcuts
src/state/                     pure reducer (roadmapReducer.js), undo/redo history (history.js),
                               backup indicators (backupState.js), context (roadmapContext.js)
src/hooks/useRoadmapState.js   state hook connecting reducer, history, and persistence
src/data/persistence.js       draft storage, corrupt state quarantine, last-good snapshots
src/data/defaultState.js       blank/sample state, normalizeRoadmapState, theme storage
src/data/migrations.js         schema version migrations (v1 -> v...)
src/data/roadmapSchema.js      zod check for uploaded JSON (validateRoadmapImport, 50MB limit)
src/constants/
  designOptions.js             option catalogs + getDefaultDesign/normalizeDesign/getDensity
  effectOptions.js             effect toggles/categories/rules (static data)
  fontLoaders.js               dynamic on-demand font loaders (@fontsource)
  themes.js                    PERIOD_TYPES, legend presets, re-exports fonts + presets
  themePresets.js / fontStyles.js   large static data, rarely needs editing
src/utils/                     dateUtils (periods), exportUtils (png/pdf), exportExcel (xlsx),
                               toast.js (notifications), ids.js (UUIDv4)
src/components/
  LandingPage.jsx + landing/   landing view, split into CelestialThemeToggle, DuckPond, HorizonScene
  RoadmapWorkspace.jsx         editor/preview shell, export actions
  Sidebar.jsx + sidebar/       left tree editor (sections > sub-sections > tasks, drag and drop)
  TimelineGrid.jsx + timeline/ canvas grid, TimelineHeader, TimelineStickyHeader, TimelineSection
  TaskRow.jsx + taskrow/       TaskRowTimelineItem, useBarInteraction, TimelineItemPopover
  StyleParts.jsx -> parts/     shared visuals: NumBadge, LevelLabel, PeriodHeaderCell, SectionSpine,
                               BarVisual, CanvasOverlays (used by canvas, live preview AND swatches)
  ConfigModal.jsx + config/    settings modal shell; one <XxxTab> per tab, shared `ctx` object,
                               swatches.jsx builds preview swatches from real renderers
  backup/                      BackupChip, BackupNagBanner, RecoveryBanner, DraftNoticeDialog
  ui/                          Modal (accessible dialog), ConfirmDialog
  canvasStyles.js, styleHelpers.js   theme tokens and style resolution
  art/                         decorative SVG (ducks, meadow). Never needs reading for logic changes.
```

## Conventions and gotchas

- Add a new settings tab: create `config/<Name>Tab.jsx` (receives `{ ctx }`), add it to `NAV_GROUPS` in
  `config/navConfig.js` and render it in `ConfigModal.jsx`.
- Add a new design option: catalog in `designOptions.js`, default in `getDefaultDesign`, normalization in
  `normalizeDesign`, type in `types/roadmap.d.ts`, and render it in `components/parts/*`.
- Always load external JSON via `normalizeRoadmapState` (fills defaults, clamps periods).
- Periods are 1-based; `calculatePeriods` clamps to 52, the UI limits to 36.
- Swatches and the canvas must share renderers in `parts/`; do not fork visuals.
- `data-testid` attributes are used by `scripts/e2e-smoke.mjs`; keep them stable.
- `dist/`, `e2e-output/` and `node_modules/` are generated; never read or edit them.
- Keep files under ~400 lines. Split by component rather than adding to a large file.
