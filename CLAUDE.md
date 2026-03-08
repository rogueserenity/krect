# krect - Claude Code Instructions

## Project
KWin script that replicates Rectangle window snapping for KDE Plasma 6. TypeScript source bundled via esbuild into a single `contents/code/main.js`.

## Commands
- `npm run build` — bundle src/main.ts → contents/code/main.js
- `npm test` — run Vitest unit tests
- `npm run typecheck` — TypeScript type check (no emit)
- `./node_modules/.bin/eslint src` — lint

## Key Conventions
- **Conventional commits** enforced via commitlint + husky
- **Never use `npx`** — use `./node_modules/.bin/<tool>` for local binaries
- **No `mise exec`** — shell is configured with mise activated, run tools directly
- All KWin API calls go through `KWinAdapter` — core logic never touches KWin globals
- `geometry.ts` is called only by `cache.ts` — all other modules use the cache

## Architecture
- `src/adapter.ts` — KWinAdapter interface + shared types (Rect, Screen)
- `src/kwin-adapter.ts` — KWin implementation (not unit tested)
- `src/main.ts` — entry point, shortcut registration
- `src/core/geometry.ts` — pure snap geometry calculations
- `src/core/state.ts` — per-window state (position, cycleIndex, screen)
- `src/core/cache.ts` — precomputed snap geometries per monitor, invalidates on screen change
- `src/core/snap.ts` — core snap logic, uses state + cache
- `src/core/monitor.ts` — monitor cycling, geometry reprojection
- `src/tests/` — Vitest unit tests for all core modules

## Snap Behavior
- Edge snaps (left/right): width cycles 1/2→2/3→1/3, full height
- Edge snaps (top/bottom): height cycles 1/2→2/3→1/3, full width
- Corner snaps: width cycles 1/2→2/3→1/3, height always 1/2 screen
- Center snap: width cycles 1/2→2/3→1/3, full height, centered horizontally
- Sixths: 6 cells, wide screen=2×3, tall screen=3×2, cycle left→right→next row
- Cycle resets on position change or implicit on next shortcut after manual move
