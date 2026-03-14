import { describe, it, expect, beforeEach } from 'vitest';
import { getNextScreenIndex, getPrevScreenIndex, isSnapped, resolveMonitorMove } from '../core/monitor.js';
import { buildCache } from '../core/cache.js';
import type { Rect, Screen } from '../adapter.js';
import type { WindowState } from '../core/state.js';

const screen0: Screen = { index: 0, workArea: { x: 0,    y: 0, width: 1920, height: 1080 } };
const screen1: Screen = { index: 1, workArea: { x: 1920, y: 0, width: 2560, height: 1440 } };
const screen2: Screen = { index: 2, workArea: { x: 5000, y: 0, width: 1920, height: 1080 } };

beforeEach(() => {
  buildCache([screen0, screen1, screen2]);
});

describe('getNextScreenIndex', () => {
  it('advances to next screen', () => {
    expect(getNextScreenIndex(0, 2)).toBe(1);
  });

  it('wraps from last to first', () => {
    expect(getNextScreenIndex(1, 2)).toBe(0);
  });
});

describe('getPrevScreenIndex', () => {
  it('goes to previous screen', () => {
    expect(getPrevScreenIndex(1, 2)).toBe(0);
  });

  it('wraps from first to last', () => {
    expect(getPrevScreenIndex(0, 2)).toBe(1);
  });

  it('decrements normally with 3 screens', () => {
    expect(getPrevScreenIndex(2, 3)).toBe(1);
  });
});

describe('isSnapped', () => {
  it('returns false when state is undefined', () => {
    const geometry: Rect = { x: 0, y: 0, width: 960, height: 1080 };
    expect(isSnapped(geometry, 0, undefined)).toBe(false);
  });

  it('returns true when geometry matches cached snap geometry', () => {
    const state: WindowState = { position: 'left', cycleIndex: 0, screen: 0 };
    const geometry: Rect = { x: 0, y: 0, width: 960, height: 1080 };
    expect(isSnapped(geometry, 0, state)).toBe(true);
  });

  it('returns false when geometry does not match', () => {
    const state: WindowState = { position: 'left', cycleIndex: 0, screen: 0 };
    const geometry: Rect = { x: 0, y: 0, width: 800, height: 1080 }; // manually moved
    expect(isSnapped(geometry, 0, state)).toBe(false);
  });
});

describe('resolveMonitorMove', () => {
  it('returns null for unknown target screen', () => {
    const geometry: Rect = { x: 0, y: 0, width: 960, height: 1080 };
    expect(resolveMonitorMove(geometry, 0, 99, undefined)).toBeNull();
  });

  it('re-applies snap on target monitor when window is snapped', () => {
    const state: WindowState = { position: 'left', cycleIndex: 0, screen: 0 };
    const geometry: Rect = { x: 0, y: 0, width: 960, height: 1080 }; // matches left@0 snap

    const result = resolveMonitorMove(geometry, 0, 1, state);
    expect(result).not.toBeNull();
    // left@0 on screen1 (2560x1440): width = 1280, x = 1920
    expect(result!.geometry).toEqual({ x: 1920, y: 0, width: 1280, height: 1440 });
    expect(result!.newState).toEqual({ position: 'left', cycleIndex: 0, screen: 1 });
  });

  it('offsets unsnapped window by monitor delta', () => {
    const geometry: Rect = { x: 100, y: 200, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 0, 1, undefined);
    expect(result).not.toBeNull();
    // screen1 starts at x=1920, so offset dx=1920
    expect(result!.geometry).toEqual({ x: 2020, y: 200, width: 800, height: 600 });
    expect(result!.newState).toBeUndefined();
  });

  it('clamps window off left edge to target monitor left edge', () => {
    // Window is off the left edge of screen0 (x=-1000), moving to screen1 (x=1920)
    // offsetX = -1000 + (1920 - 0) = 920
    // 920 < screen1.x (1920), so clampedX = 1920
    const geometry: Rect = { x: -1000, y: 0, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 0, 1, undefined);
    expect(result).not.toBeNull();
    expect(result!.geometry.x).toBe(1920);
  });

  it('places straddling window at its absolute position clamped to target monitor', () => {
    // Window at x=1700 straddles screen0 (0..1919) and screen1 (1920..4479)
    // KWin reports screen1 (window center is past screen1.x), so currentScreenIndex=1
    // withinX: 1700 >= 1920? NO → use absolute x=1700
    // clampedX = max(0, min(1920-800=1120, 1700)) = 1120
    const geometry: Rect = { x: 1700, y: 0, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 1, 0, undefined);
    expect(result).not.toBeNull();
    expect(result!.geometry.x).toBe(1120);
  });

  it('clamps window straddling right edge of source to its absolute position on target', () => {
    // Window at x=3000 straddles screen0 (0..1919) right edge — 3000+800=3800 > 1920
    // withinX: NO → use absolute x=3000
    // screen1 starts at 1920, max x = 1920+2560-800=3680
    // clampedX = max(1920, min(3680, 3000)) = 3000
    const geometry: Rect = { x: 3000, y: 0, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 0, 1, undefined);
    expect(result).not.toBeNull();
    expect(result!.geometry.x).toBe(3000);
  });
});
