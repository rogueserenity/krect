import { describe, it, expect, beforeEach } from 'vitest';
import { getNextScreenIndex, getPrevScreenIndex, isSnapped, resolveMonitorMove } from '../core/monitor.js';
import { buildCache } from '../core/cache.js';
import type { Rect, Screen } from '../adapter.js';
import type { WindowState } from '../core/state.js';

const screen0: Screen = { index: 0, workArea: { x: 0,    y: 0, width: 1920, height: 1080 } };
const screen1: Screen = { index: 1, workArea: { x: 1920, y: 0, width: 2560, height: 1440 } };

beforeEach(() => {
  buildCache([screen0, screen1]);
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

  it('clamps unsnapped window so it remains visible on target monitor', () => {
    // Window at far right of screen0, would go off right edge of screen1
    const geometry: Rect = { x: 1800, y: 0, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 0, 1, undefined);
    expect(result).not.toBeNull();
    // offsetX = 1800 + 1920 = 3720, but screen1 ends at 1920+2560=4480, so 4480-1 = 4479 max
    // 3720 < 4479 so no right-side clamping needed
    expect(result!.geometry.x).toBe(3720);
  });

  it('clamps window that would go completely off right edge', () => {
    const geometry: Rect = { x: 1900, y: 0, width: 800, height: 600 };
    const result = resolveMonitorMove(geometry, 0, 1, undefined);
    expect(result).not.toBeNull();
    // offsetX = 1900 + 1920 = 3820
    // max x = screen1.x + screen1.width - 1 = 1920 + 2560 - 1 = 4479
    // 3820 < 4479, no clamping
    expect(result!.geometry.x).toBe(3820);
  });
});
