import { findWorkArea, type Rect, type Screen } from '../adapter.js';
import { computeSnapGeometry, getCycleCount, rectsEqual, type SnapPosition } from './geometry.js';
import { computeNextCycleIndex, type WindowState } from './state.js';

export interface SnapResult {
  geometry: Rect;
  newState: WindowState;
}

function isStateStale(currentState: WindowState, currentGeometry: Rect, workArea: Rect): boolean {
  const cached = computeSnapGeometry(workArea, currentState.position, currentState.cycleIndex);
  return !rectsEqual(currentGeometry, cached);
}

function resolveEffectiveState(
  currentState: WindowState | undefined,
  currentGeometry: Rect | undefined,
  workArea: Rect
): WindowState | undefined {
  if (currentState !== undefined && currentGeometry !== undefined && isStateStale(currentState, currentGeometry, workArea)) {
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
  screens: Screen[],
  currentGeometry?: Rect
): SnapResult | null {
  const workArea = findWorkArea(screens, screenIndex);
  if (workArea === null) return null;

  const effectiveState = resolveEffectiveState(currentState, currentGeometry, workArea);

  const cycleCount = getCycleCount(position);

  let cycleIndex: number;
  if (effectiveState !== undefined && effectiveState.position === position) {
    cycleIndex = (effectiveState.cycleIndex + 1) % cycleCount;
  } else {
    cycleIndex = startIndex % cycleCount;
  }

  return {
    geometry: computeSnapGeometry(workArea, position, cycleIndex),
    newState: { position, cycleIndex, screen: screenIndex },
  };
}

export function resolveSnap(
  position: SnapPosition,
  currentState: WindowState | undefined,
  screenIndex: number,
  screens: Screen[],
  currentGeometry?: Rect
): SnapResult | null {
  const workArea = findWorkArea(screens, screenIndex);
  if (workArea === null) return null;

  // If the window was manually moved since last snap, treat as fresh
  const effectiveState = resolveEffectiveState(currentState, currentGeometry, workArea);

  const cycleCount = getCycleCount(position);
  const cycleIndex = computeNextCycleIndex(effectiveState, position, cycleCount);

  return {
    geometry: computeSnapGeometry(workArea, position, cycleIndex),
    newState: { position, cycleIndex, screen: screenIndex },
  };
}
