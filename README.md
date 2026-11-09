# Roadmap Builder

A browser-based roadmap designer. Build multi-track timelines (sections, sub-sections, tasks, bars and
milestones), restyle them with themes and effects, and export to JSON, PNG, PDF or XLSX. Everything runs
client-side; data is kept in `localStorage`.

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

## Deployment

Pushes to `main` run lint, tests and build, then publish `dist/` to GitHub Pages
(`.github/workflows/deploy.yml`). Pull requests run the same checks (`ci.yml`).

## Architecture

See [AGENTS.md](./AGENTS.md) for the file map and conventions, and
[`src/types/roadmap.d.ts`](./src/types/roadmap.d.ts) for the data model.
