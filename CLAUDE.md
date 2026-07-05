# krect - Claude Code Instructions

## Project
KWin script that replicates Rectangle window snapping for KDE Plasma 6. TypeScript source bundled via esbuild into a single `contents/code/main.js`.

## Commands
- `npm run build` — bundle src/main.ts → contents/code/main.js
- `npm test` — run Vitest unit tests
- `npm run typecheck` — TypeScript type check (no emit)
- `npm run lint` — eslint
- `npm run check` — typecheck + lint together

## Key Conventions
- **Conventional commits** enforced via commitlint + husky
- **Never use `npx`** — mise adds `./node_modules/.bin` to PATH, so run local binaries directly (e.g. `vitest`, `esbuild`)
- **No `mise exec`** — shell is configured with mise activated, run tools directly
- All KWin API calls go through `KWinAdapter` — core logic never touches KWin globals
- No persistent work-area cache — `adapter.getScreens()` is called fresh on every shortcut press and threaded into `snap.ts`/`monitor.ts`, which call `geometry.ts` directly. This is deliberate: a cache built once (even lazily) can permanently lock in a stale work area if a panel's strut registers with KWin after the value was captured (see git history on the portrait-panel bug)

## Architecture
- `src/adapter.ts` — KWinAdapter interface + shared types (Rect, Screen) + `findWorkArea` helper
- `src/kwin-adapter.ts` — KWin implementation (not unit tested)
- `src/main.ts` — entry point, shortcut registration
- `src/core/geometry.ts` — pure snap geometry calculations
- `src/core/state.ts` — per-window state (position, cycleIndex, screen)
- `src/core/snap.ts` — core snap logic, uses state + live screen list
- `src/core/monitor.ts` — monitor cycling, geometry reprojection
- `src/tests/` — Vitest unit tests for all core modules

## Snap Behavior
- Edge snaps (left/right): width cycles 1/2→2/3→1/3, full height
- Edge snaps (top/bottom): height cycles 1/2→2/3→1/3, full width
- Corner snaps: width cycles 1/2→2/3→1/3, height always 1/2 screen
- Center snap: width cycles 1/2→2/3→1/3, full height, centered horizontally
- Sixths: 6 cells, wide screen=2×3, tall screen=3×2, cycle left→right→next row
- Cycle resets on position change or implicit on next shortcut after manual move
