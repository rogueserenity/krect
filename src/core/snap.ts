import type { Rect } from '../adapter.js';
import { getCycleCount, rectsEqual, type SnapPosition } from './geometry.js';
import { getSnapGeometry } from './cache.js';
import { computeNextCycleIndex, type WindowState } from './state.js';

export interface SnapResult {
  geometry: Rect;
  newState: WindowState;
}

function isStateStale(currentState: WindowState, currentGeometry: Rect, screenIndex: number): boolean {
  const cached = getSnapGeometry(screenIndex, currentState.position, currentState.cycleIndex);
  return cached === null || !rectsEqual(currentGeometry, cached);
}

function resolveEffectiveState(
  currentState: WindowState | undefined,
  currentGeometry: Rect | undefined,
  screenIndex: number
): WindowState | undefined {
  if (currentState !== undefined && currentGeometry !== undefined && isStateStale(currentState, currentGeometry, screenIndex)) {
    return undefined;
  }
  return currentState;
}

// resolveSnapFrom is used by shortcuts that are entry points into a cycle at a
// specific index (e.g. "Left Two Thirds" starts at cycleIndex=1). If the window
// is already snapped to the same position, the cycle continues normally from
// its current index. Otherwise it jumps to startIndex.
export function resolveSnapFrom(
  position: SnapPosition,
  startIndex: number,
  currentState: WindowState | undefined,
  screenIndex: number,
  currentGeometry?: Rect
): SnapResult | null {
  const effectiveState = resolveEffectiveState(currentState, currentGeometry, screenIndex);

  const cycleCount = getCycleCount(position);

  let cycleIndex: number;
  if (effectiveState !== undefined && effectiveState.position === position) {
    cycleIndex = (effectiveState.cycleIndex + 1) % cycleCount;
  } else {
    cycleIndex = startIndex % cycleCount;
  }

  const geometry = getSnapGeometry(screenIndex, position, cycleIndex);
  if (geometry === null) return null;

  return {
    geometry,
    newState: { position, cycleIndex, screen: screenIndex },
  };
}

export function resolveSnap(
  position: SnapPosition,
  currentState: WindowState | undefined,
  screenIndex: number,
  currentGeometry?: Rect
): SnapResult | null {
  // If the window was manually moved since last snap, treat as fresh
  const effectiveState = resolveEffectiveState(currentState, currentGeometry, screenIndex);

  const cycleCount = getCycleCount(position);
  const cycleIndex = computeNextCycleIndex(effectiveState, position, cycleCount);
  const geometry = getSnapGeometry(screenIndex, position, cycleIndex);

  if (geometry === null) return null;

  return {
    geometry,
    newState: { position, cycleIndex, screen: screenIndex },
  };
}
