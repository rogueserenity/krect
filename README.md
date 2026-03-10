# krect

krect is a KWin script for KDE Plasma 6 that replicates the keyboard-driven window snapping behavior of [Rectangle](https://rectangleapp.com/) for macOS. It registers 24 global shortcuts inspired by Rectangle's `Ctrl+Opt` bindings, adapted to `Meta+Ctrl` on Linux, with cycling through multiple widths on repeated presses.

## Requirements

- KDE Plasma 6
- Node.js 20+ *(build only — not required at runtime)*

## Installation

### From a release

1. Download the latest `krect-x.y.z.kwinscript` from the [Releases](https://github.com/rogueserenity/krect/releases) page.
2. Open **System Settings → Window Management → KWin Scripts**.
3. Click **Import…**, select the downloaded file, and enable the script.

### From source

```bash
npm install
npm run install-kwin
```

This builds the script and installs it via `kpackagetool6`. Enable it in **System Settings → Window Management → KWin Scripts**.

## Shortcuts

| Action | Default Key | Cycles? |
|---|---|---|
| Left | `Meta+Ctrl+Left` | Yes (1/2 → 2/3 → 1/3) |
| Right | `Meta+Ctrl+Right` | Yes (1/2 → 2/3 → 1/3) |
| Top | `Meta+Ctrl+Up` | Yes (1/2 → 2/3 → 1/3) |
| Bottom | `Meta+Ctrl+Down` | Yes (1/2 → 2/3 → 1/3) |
| Left Two Thirds | `Meta+Ctrl+E` | — |
| Right Two Thirds | `Meta+Ctrl+T` | — |
| Left Third | `Meta+Ctrl+D` | — |
| Right Third | `Meta+Ctrl+G` | — |
| Center Two Thirds | `Meta+Ctrl+R` | — |
| Center Third | `Meta+Ctrl+F` | — |
| Top Left | `Meta+Ctrl+U` | Yes (width: 1/2 → 2/3 → 1/3) |
| Top Right | `Meta+Ctrl+I` | Yes (width: 1/2 → 2/3 → 1/3) |
| Bottom Left | `Meta+Ctrl+J` | Yes (width: 1/2 → 2/3 → 1/3) |
| Bottom Right | `Meta+Ctrl+K` | Yes (width: 1/2 → 2/3 → 1/3) |
| Center | `Meta+Ctrl+C` | Yes (1/2 → 2/3 → 1/3) |
| Maximize | `Meta+Ctrl+Return` | — |
| Next Display | `Meta+Ctrl+Alt+Right` | — |
| Prev Display | `Meta+Ctrl+Alt+Left` | — |
| Sixth 1 | `Meta+Ctrl+1` | Yes |
| Sixth 2 | `Meta+Ctrl+2` | Yes |
| Sixth 3 | `Meta+Ctrl+3` | Yes |
| Sixth 4 | `Meta+Ctrl+4` | Yes |
| Sixth 5 | `Meta+Ctrl+5` | Yes |
| Sixth 6 | `Meta+Ctrl+6` | Yes |

## Snap Behavior

- **Edge snaps** (left/right): full height, width cycles 1/2 → 2/3 → 1/3 on repeated presses.
- **Edge snaps** (top/bottom): full width, height cycles 1/2 → 2/3 → 1/3.
- **Corner snaps**: height always 1/2, width cycles 1/2 → 2/3 → 1/3.
- **Center**: full height, centered horizontally, width cycles 1/2 → 2/3 → 1/3.
- **Sixths**: divides the screen into 6 cells; on a wide screen, 2 rows × 3 columns; on a tall screen, 3 rows × 2 columns. Cycling moves left → right → next row.
- **Maximize**: fills the work area (excludes panels).
- **Monitor navigation**: moves the window to the next or previous display, preserving its relative size and position.

Cycling resets whenever the window is moved manually or a different shortcut is used.

## Customizing Shortcuts

Open **System Settings → Shortcuts → Global Shortcuts**, then filter by **krect**. All 24 shortcuts appear there and can be rebound freely.

## Building from Source

```bash
npm run build      # bundle src/main.ts → contents/code/main.js
npm test           # run unit tests (Vitest)
npm run check      # typecheck + lint
```

## License

MIT
