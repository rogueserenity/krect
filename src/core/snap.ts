import type { Rect } from '../adapter.js';
import { getCycleCount, type SnapPosition } from './geometry.js';
import { getSnapGeometry } from './cache.js';
import { computeNextCycleIndex, type WindowState } from './state.js';

export interface SnapResult {
  geometry: Rect;
  newState: WindowState;
}

export function resolveSnap(
  position: SnapPosition,
  currentState: WindowState | undefined,
  screenIndex: number
): SnapResult | null {
  const cycleCount = getCycleCount(position);
  const cycleIndex = computeNextCycleIndex(currentState, position, cycleCount);
  const geometry = getSnapGeometry(screenIndex, position, cycleIndex);

  if (geometry === null) return null;

  return {
    geometry,
    newState: { position, cycleIndex, screen: screenIndex },
  };
}
