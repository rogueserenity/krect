import type { SnapPosition } from './geometry.js';

export interface WindowState {
  position: SnapPosition;
  cycleIndex: number;
  screen: number;
}

const windowStates = new Map<string, WindowState>();

export function getWindowState(windowId: string): WindowState | undefined {
  return windowStates.get(windowId);
}

export function setWindowState(windowId: string, state: WindowState): void {
  windowStates.set(windowId, state);
}

export function clearWindowState(windowId: string): void {
  windowStates.delete(windowId);
}

export function computeNextCycleIndex(
  currentState: WindowState | undefined,
  position: SnapPosition,
  maxCycles: number
): number {
  if (currentState === undefined || currentState.position !== position) {
    return 0;
  }
  return (currentState.cycleIndex + 1) % maxCycles;
}
