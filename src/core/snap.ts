import type { Rect } from '../adapter.js';
import { getCycleCount, type SnapPosition } from './geometry.js';
import { getSnapGeometry } from './cache.js';
import { computeNextCycleIndex, type WindowState } from './state.js';

export interface SnapResult {
  geometry: Rect;
  newState: WindowState;
}

function rectsEqual(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function isStateStale(currentState: WindowState, currentGeometry: Rect, screenIndex: number): boolean {
  const cached = getSnapGeometry(screenIndex, currentState.position, currentState.cycleIndex);
  return cached === null || !rectsEqual(currentGeometry, cached);
}

export function resolveSnap(
  position: SnapPosition,
  currentState: WindowState | undefined,
  screenIndex: number,
  currentGeometry?: Rect
): SnapResult | null {
  // If the window was manually moved since last snap, treat as fresh
  const effectiveState =
    currentState !== undefined && currentGeometry !== undefined && isStateStale(currentState, currentGeometry, screenIndex)
      ? undefined
      : currentState;

  const cycleCount = getCycleCount(position);
  const cycleIndex = computeNextCycleIndex(effectiveState, position, cycleCount);
  const geometry = getSnapGeometry(screenIndex, position, cycleIndex);

  if (geometry === null) return null;

  return {
    geometry,
    newState: { position, cycleIndex, screen: screenIndex },
  };
}
