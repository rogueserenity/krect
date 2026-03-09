import { createKWinAdapter } from './kwin-adapter.js';
import { buildCache } from './core/cache.js';
import { getWindowState, setWindowState, clearWindowState } from './core/state.js';
import { resolveSnap } from './core/snap.js';
import { resolveMonitorMove, getNextScreenIndex, getPrevScreenIndex } from './core/monitor.js';
import type { SnapPosition } from './core/geometry.js';

const adapter = createKWinAdapter();

buildCache(adapter.getScreens());

adapter.onScreenChanged(() => {
  buildCache(adapter.getScreens());
});

adapter.onWindowClosed((windowId) => {
  clearWindowState(windowId);
});

function snap(position: SnapPosition): void {
  const windowId = adapter.getActiveWindowId();
  if (windowId === null) return;

  const screenIndex = adapter.getWindowScreen(windowId);
  if (screenIndex === null) return;

  const currentGeometry = adapter.getWindowGeometry(windowId);
  if (currentGeometry === null) return;

  const result = resolveSnap(position, getWindowState(windowId), screenIndex, currentGeometry);
  if (result === null) return;

  if (adapter.isWindowMaximized(windowId)) {
    adapter.unmaximizeWindow(windowId);
  }

  adapter.setWindowGeometry(windowId, result.geometry);
  setWindowState(windowId, result.newState);
}

function maximize(): void {
  const windowId = adapter.getActiveWindowId();
  if (windowId === null) return;
  adapter.maximizeWindow(windowId);
  clearWindowState(windowId);
}

function moveToMonitor(direction: 'next' | 'prev'): void {
  const windowId = adapter.getActiveWindowId();
  if (windowId === null) return;

  const screens = adapter.getScreens();
  const currentScreenIndex = adapter.getWindowScreen(windowId);
  if (currentScreenIndex === null) return;

  const targetScreenIndex = direction === 'next'
    ? getNextScreenIndex(currentScreenIndex, screens.length)
    : getPrevScreenIndex(currentScreenIndex, screens.length);

  const currentGeometry = adapter.getWindowGeometry(windowId);
  if (currentGeometry === null) return;

  const result = resolveMonitorMove(currentGeometry, currentScreenIndex, targetScreenIndex, getWindowState(windowId));
  if (result === null) return;

  adapter.setWindowGeometry(windowId, result.geometry);

  if (result.newState !== undefined) {
    setWindowState(windowId, result.newState);
  } else {
    clearWindowState(windowId);
  }
}

// Edge snaps
adapter.registerShortcut('krect-left',         'krect: Left',          'Meta+Alt+Left',       () => snap('left'));
adapter.registerShortcut('krect-right',        'krect: Right',         'Meta+Alt+Right',      () => snap('right'));
adapter.registerShortcut('krect-top',          'krect: Top',           'Meta+Alt+Up',         () => snap('top'));
adapter.registerShortcut('krect-bottom',       'krect: Bottom',        'Meta+Alt+Down',       () => snap('bottom'));

// Corner snaps
adapter.registerShortcut('krect-top-left',     'krect: Top Left',      'Meta+Alt+U',          () => snap('top-left'));
adapter.registerShortcut('krect-top-right',    'krect: Top Right',     'Meta+Alt+I',          () => snap('top-right'));
adapter.registerShortcut('krect-bottom-left',  'krect: Bottom Left',   'Meta+Alt+J',          () => snap('bottom-left'));
adapter.registerShortcut('krect-bottom-right', 'krect: Bottom Right',  'Meta+Alt+K',          () => snap('bottom-right'));

// Center + maximize
adapter.registerShortcut('krect-center',       'krect: Center',        'Meta+Alt+C',          () => snap('center'));
adapter.registerShortcut('krect-maximize',     'krect: Maximize',      'Meta+Alt+Return',     () => maximize());

// Monitor navigation
adapter.registerShortcut('krect-next-display', 'krect: Next Display',  'Meta+Alt+Shift+Right', () => moveToMonitor('next'));
adapter.registerShortcut('krect-prev-display', 'krect: Prev Display',  'Meta+Alt+Shift+Left',  () => moveToMonitor('prev'));

// Sixths
adapter.registerShortcut('krect-sixth-1',      'krect: Sixth 1',       'Meta+Alt+1',          () => snap('sixth-1'));
adapter.registerShortcut('krect-sixth-2',      'krect: Sixth 2',       'Meta+Alt+2',          () => snap('sixth-2'));
adapter.registerShortcut('krect-sixth-3',      'krect: Sixth 3',       'Meta+Alt+3',          () => snap('sixth-3'));
adapter.registerShortcut('krect-sixth-4',      'krect: Sixth 4',       'Meta+Alt+4',          () => snap('sixth-4'));
adapter.registerShortcut('krect-sixth-5',      'krect: Sixth 5',       'Meta+Alt+5',          () => snap('sixth-5'));
adapter.registerShortcut('krect-sixth-6',      'krect: Sixth 6',       'Meta+Alt+6',          () => snap('sixth-6'));
