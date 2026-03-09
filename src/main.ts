import { createKWinAdapter } from './kwin-adapter.js';
import { buildCache } from './core/cache.js';
import { getWindowState, setWindowState, clearWindowState } from './core/state.js';
import { resolveSnap, resolveSnapFrom } from './core/snap.js';
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

function snapFrom(position: SnapPosition, startIndex: number): void {
  const windowId = adapter.getActiveWindowId();
  if (windowId === null) return;

  const screenIndex = adapter.getWindowScreen(windowId);
  if (screenIndex === null) return;

  const currentGeometry = adapter.getWindowGeometry(windowId);
  if (currentGeometry === null) return;

  const result = resolveSnapFrom(position, startIndex, getWindowState(windowId), screenIndex, currentGeometry);
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
adapter.registerShortcut('krect-left',            'krect: Left',            'Meta+Ctrl+Left',       () => snap('left'));
adapter.registerShortcut('krect-right',           'krect: Right',           'Meta+Ctrl+Right',      () => snap('right'));
adapter.registerShortcut('krect-top',             'krect: Top',             'Meta+Ctrl+Up',         () => snap('top'));
adapter.registerShortcut('krect-bottom',          'krect: Bottom',          'Meta+Ctrl+Down',       () => snap('bottom'));

// Edge third/two-thirds entry points (cycleIndex 1 = 2/3, cycleIndex 2 = 1/3)
adapter.registerShortcut('krect-left-two-thirds',   'krect: Left Two Thirds',   'Meta+Ctrl+E',          () => snapFrom('left', 1));
adapter.registerShortcut('krect-right-two-thirds',  'krect: Right Two Thirds',  'Meta+Ctrl+T',          () => snapFrom('right', 1));
adapter.registerShortcut('krect-left-third',        'krect: Left Third',        'Meta+Ctrl+D',          () => snapFrom('left', 2));
adapter.registerShortcut('krect-right-third',       'krect: Right Third',       'Meta+Ctrl+G',          () => snapFrom('right', 2));
adapter.registerShortcut('krect-center-two-thirds', 'krect: Center Two Thirds', 'Meta+Ctrl+R',          () => snapFrom('center', 1));
adapter.registerShortcut('krect-center-third',      'krect: Center Third',      'Meta+Ctrl+F',          () => snapFrom('center', 2));

// Corner snaps
adapter.registerShortcut('krect-top-left',        'krect: Top Left',        'Meta+Ctrl+U',          () => snap('top-left'));
adapter.registerShortcut('krect-top-right',       'krect: Top Right',       'Meta+Ctrl+I',          () => snap('top-right'));
adapter.registerShortcut('krect-bottom-left',     'krect: Bottom Left',     'Meta+Ctrl+J',          () => snap('bottom-left'));
adapter.registerShortcut('krect-bottom-right',    'krect: Bottom Right',    'Meta+Ctrl+K',          () => snap('bottom-right'));

// Center + maximize
adapter.registerShortcut('krect-center',          'krect: Center',          'Meta+Ctrl+C',          () => snap('center'));
adapter.registerShortcut('krect-maximize',        'krect: Maximize',        'Meta+Ctrl+Return',     () => maximize());

// Monitor navigation
adapter.registerShortcut('krect-next-display',    'krect: Next Display',    'Meta+Ctrl+Alt+Right',  () => moveToMonitor('next'));
adapter.registerShortcut('krect-prev-display',    'krect: Prev Display',    'Meta+Ctrl+Alt+Left',   () => moveToMonitor('prev'));

// Sixths
adapter.registerShortcut('krect-sixth-1',         'krect: Sixth 1',         'Meta+Ctrl+1',          () => snap('sixth-1'));
adapter.registerShortcut('krect-sixth-2',         'krect: Sixth 2',         'Meta+Ctrl+2',          () => snap('sixth-2'));
adapter.registerShortcut('krect-sixth-3',         'krect: Sixth 3',         'Meta+Ctrl+3',          () => snap('sixth-3'));
adapter.registerShortcut('krect-sixth-4',         'krect: Sixth 4',         'Meta+Ctrl+4',          () => snap('sixth-4'));
adapter.registerShortcut('krect-sixth-5',         'krect: Sixth 5',         'Meta+Ctrl+5',          () => snap('sixth-5'));
adapter.registerShortcut('krect-sixth-6',         'krect: Sixth 6',         'Meta+Ctrl+6',          () => snap('sixth-6'));
