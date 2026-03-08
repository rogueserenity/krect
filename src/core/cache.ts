import type { Rect, Screen } from '../adapter.js';
import {
  computeSnapGeometry,
  getCycleCount,
  ALL_SNAP_POSITIONS,
  type SnapPosition,
} from './geometry.js';

// screenIndex -> position -> cycleIndex -> Rect
type ScreenCache = Map<SnapPosition, Rect[]>;
const cache = new Map<number, ScreenCache>();

export function buildCache(screens: Screen[]): void {
  cache.clear();
  for (const screen of screens) {
    const screenCache: ScreenCache = new Map();
    for (const position of ALL_SNAP_POSITIONS) {
      const count = getCycleCount(position);
      const geometries: Rect[] = [];
      for (let i = 0; i < count; i++) {
        geometries.push(computeSnapGeometry(screen.workArea, position, i));
      }
      screenCache.set(position, geometries);
    }
    cache.set(screen.index, screenCache);
  }
}

export function getSnapGeometry(
  screenIndex: number,
  position: SnapPosition,
  cycleIndex: number
): Rect | null {
  return cache.get(screenIndex)?.get(position)?.[cycleIndex] ?? null;
}
