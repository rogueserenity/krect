import { findWorkArea, type Rect, type Screen } from '../adapter.js';
import { computeSnapGeometry, rectsEqual } from './geometry.js';
import type { WindowState } from './state.js';

export function getNextScreenIndex(currentIndex: number, totalScreens: number): number {
  return (currentIndex + 1) % totalScreens;
}

export function getPrevScreenIndex(currentIndex: number, totalScreens: number): number {
  return (currentIndex - 1 + totalScreens) % totalScreens;
}

export function isSnapped(
  windowGeometry: Rect,
  screenIndex: number,
  screens: Screen[],
  state: WindowState | undefined
): boolean {
  if (state === undefined) return false;
  const workArea = findWorkArea(screens, screenIndex);
  if (workArea === null) return false;
  const cached = computeSnapGeometry(workArea, state.position, state.cycleIndex);
  return rectsEqual(windowGeometry, cached);
}

export interface MonitorMoveResult {
  geometry: Rect;
  newState: WindowState | undefined;
}

export function resolveMonitorMove(
  windowGeometry: Rect,
  currentScreenIndex: number,
  targetScreenIndex: number,
  screens: Screen[],
  state: WindowState | undefined
): MonitorMoveResult | null {
  const targetWorkArea = findWorkArea(screens, targetScreenIndex);
  if (targetWorkArea === null) return null;

  if (isSnapped(windowGeometry, currentScreenIndex, screens, state) && state !== undefined) {
    const geometry = computeSnapGeometry(targetWorkArea, state.position, state.cycleIndex);
    return { geometry, newState: { ...state, screen: targetScreenIndex } };
  }

  const currentWorkArea = findWorkArea(screens, currentScreenIndex);
  if (currentWorkArea === null) return null;

  const withinX = windowGeometry.x >= currentWorkArea.x &&
    windowGeometry.x + windowGeometry.width <= currentWorkArea.x + currentWorkArea.width;
  const withinY = windowGeometry.y >= currentWorkArea.y &&
    windowGeometry.y + windowGeometry.height <= currentWorkArea.y + currentWorkArea.height;

  const effectiveX = withinX ? windowGeometry.x + (targetWorkArea.x - currentWorkArea.x) : windowGeometry.x;
  const effectiveY = withinY ? windowGeometry.y + (targetWorkArea.y - currentWorkArea.y) : windowGeometry.y;

  const clampedX = Math.max(
    targetWorkArea.x,
    Math.min(targetWorkArea.x + targetWorkArea.width - windowGeometry.width, effectiveX)
  );
  const clampedY = Math.max(
    targetWorkArea.y,
    Math.min(targetWorkArea.y + targetWorkArea.height - windowGeometry.height, effectiveY)
  );

  return {
    geometry: { x: clampedX, y: clampedY, width: windowGeometry.width, height: windowGeometry.height },
    newState: undefined,
  };
}
