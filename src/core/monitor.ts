import type { Rect } from '../adapter.js';
import { rectsEqual } from './geometry.js';
import { getSnapGeometry, getWorkArea } from './cache.js';
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
  state: WindowState | undefined
): boolean {
  if (state === undefined) return false;
  const cached = getSnapGeometry(screenIndex, state.position, state.cycleIndex);
  return cached !== null && rectsEqual(windowGeometry, cached);
}

export interface MonitorMoveResult {
  geometry: Rect;
  newState: WindowState | undefined;
}

export function resolveMonitorMove(
  windowGeometry: Rect,
  currentScreenIndex: number,
  targetScreenIndex: number,
  state: WindowState | undefined
): MonitorMoveResult | null {
  const targetWorkArea = getWorkArea(targetScreenIndex);
  if (targetWorkArea === null) return null;

  if (isSnapped(windowGeometry, currentScreenIndex, state) && state !== undefined) {
    const geometry = getSnapGeometry(targetScreenIndex, state.position, state.cycleIndex);
    if (geometry === null) return null;
    return { geometry, newState: { ...state, screen: targetScreenIndex } };
  }

  const currentWorkArea = getWorkArea(currentScreenIndex);
  if (currentWorkArea === null) return null;

  const offsetX = windowGeometry.x + (targetWorkArea.x - currentWorkArea.x);
  const offsetY = windowGeometry.y + (targetWorkArea.y - currentWorkArea.y);

  const clampedX = Math.max(
    targetWorkArea.x - windowGeometry.width + 1,
    Math.min(targetWorkArea.x + targetWorkArea.width - 1, offsetX)
  );
  const clampedY = Math.max(
    targetWorkArea.y - windowGeometry.height + 1,
    Math.min(targetWorkArea.y + targetWorkArea.height - 1, offsetY)
  );

  return {
    geometry: { x: clampedX, y: clampedY, width: windowGeometry.width, height: windowGeometry.height },
    newState: undefined,
  };
}
