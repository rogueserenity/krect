import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSnap, resolveSnapFrom } from '../core/snap.js';
import { buildCache } from '../core/cache.js';
import { clearWindowState } from '../core/state.js';
import type { Screen } from '../adapter.js';
import type { WindowState } from '../core/state.js';

const screen0: Screen = { index: 0, workArea: { x: 0, y: 0, width: 1920, height: 1080 } };

beforeEach(() => {
  buildCache([screen0]);
  clearWindowState('win-1');
});

describe('resolveSnap', () => {
  it('returns correct geometry for a new window (cycle index 0)', () => {
    const result = resolveSnap('left', undefined, 0);
    expect(result).not.toBeNull();
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
    expect(result!.newState).toEqual({ position: 'left', cycleIndex: 0, screen: 0 });
  });

  it('cycles to next index on repeated same position', () => {
    const state: WindowState = { position: 'left', cycleIndex: 0, screen: 0 };
    const result = resolveSnap('left', state, 0);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 1280, height: 1080 });
    expect(result!.newState.cycleIndex).toBe(1);
  });

  it('wraps cycle index back to 0', () => {
    const state: WindowState = { position: 'left', cycleIndex: 2, screen: 0 };
    const result = resolveSnap('left', state, 0);
    expect(result!.newState.cycleIndex).toBe(0);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
  });

  it('resets to cycle 0 when position changes', () => {
    const state: WindowState = { position: 'left', cycleIndex: 2, screen: 0 };
    const result = resolveSnap('right', state, 0);
    expect(result!.newState.cycleIndex).toBe(0);
    expect(result!.newState.position).toBe('right');
  });

  it('returns null for unknown screen', () => {
    expect(resolveSnap('left', undefined, 99)).toBeNull();
  });

  it('resets to cycle 0 when window was manually moved (stale state)', () => {
    const state: WindowState = { position: 'left', cycleIndex: 1, screen: 0 };
    // Window is not at the cached left@1 position — it was manually moved
    const manualGeometry = { x: 100, y: 100, width: 800, height: 600 };
    const result = resolveSnap('left', state, 0, manualGeometry);
    expect(result!.newState.cycleIndex).toBe(0);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
  });

  it('continues cycling when geometry matches cached state (not stale)', () => {
    const state: WindowState = { position: 'left', cycleIndex: 0, screen: 0 };
    // Window is exactly at the cached left@0 position
    const snappedGeometry = { x: 0, y: 0, width: 960, height: 1080 };
    const result = resolveSnap('left', state, 0, snappedGeometry);
    expect(result!.newState.cycleIndex).toBe(1);
  });

  it('cycles through all 6 sixth positions', () => {
    let state: WindowState | undefined = undefined;
    for (let i = 0; i < 6; i++) {
      const result = resolveSnap('sixth-1', state, 0);
      expect(result).not.toBeNull();
      expect(result!.newState.cycleIndex).toBe(i);
      state = result!.newState;
    }
    // wraps back to 0
    const result = resolveSnap('sixth-1', state, 0);
    expect(result!.newState.cycleIndex).toBe(0);
  });
});

describe('resolveSnapFrom', () => {
  it('jumps to startIndex when no prior state', () => {
    // left two-thirds: startIndex=1 → cycleIndex 1 = 2/3 width
    const result = resolveSnapFrom('left', 1, undefined, 0);
    expect(result).not.toBeNull();
    expect(result!.newState.cycleIndex).toBe(1);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 1280, height: 1080 });
  });

  it('jumps to startIndex when prior position is different', () => {
    const state: WindowState = { position: 'right', cycleIndex: 0, screen: 0 };
    const result = resolveSnapFrom('left', 2, state, 0);
    expect(result!.newState.cycleIndex).toBe(2);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 640, height: 1080 });
  });

  it('continues cycling when already at same position', () => {
    const state: WindowState = { position: 'left', cycleIndex: 1, screen: 0 };
    const snappedGeometry = { x: 0, y: 0, width: 1280, height: 1080 };
    const result = resolveSnapFrom('left', 1, state, 0, snappedGeometry);
    expect(result!.newState.cycleIndex).toBe(2);
  });

  it('wraps cycle when continuing from last index', () => {
    const state: WindowState = { position: 'left', cycleIndex: 2, screen: 0 };
    const snappedGeometry = { x: 0, y: 0, width: 640, height: 1080 };
    const result = resolveSnapFrom('left', 1, state, 0, snappedGeometry);
    expect(result!.newState.cycleIndex).toBe(0);
  });

  it('jumps to startIndex when state is stale (manual move)', () => {
    const state: WindowState = { position: 'left', cycleIndex: 1, screen: 0 };
    const manualGeometry = { x: 100, y: 100, width: 800, height: 600 };
    const result = resolveSnapFrom('left', 1, state, 0, manualGeometry);
    expect(result!.newState.cycleIndex).toBe(1);
    expect(result!.geometry).toEqual({ x: 0, y: 0, width: 1280, height: 1080 });
  });

  it('startIndex wraps via modulo for out-of-range values', () => {
    const result = resolveSnapFrom('left', 5, undefined, 0);
    // cycleCount=3, 5%3=2
    expect(result!.newState.cycleIndex).toBe(2);
  });

  it('returns null for unknown screen', () => {
    expect(resolveSnapFrom('left', 1, undefined, 99)).toBeNull();
  });

  it('center two-thirds: jumps to cycleIndex 1 (2/3 width, centered)', () => {
    const result = resolveSnapFrom('center', 1, undefined, 0);
    expect(result).not.toBeNull();
    expect(result!.newState.cycleIndex).toBe(1);
    // center@1: width=1280, centered → x = (1920-1280)/2 = 320
    expect(result!.geometry).toEqual({ x: 320, y: 0, width: 1280, height: 1080 });
  });

  it('center third: jumps to cycleIndex 2 (1/3 width, centered)', () => {
    const result = resolveSnapFrom('center', 2, undefined, 0);
    expect(result).not.toBeNull();
    expect(result!.newState.cycleIndex).toBe(2);
    // center@2: width=640, centered → x = (1920-640)/2 = 640
    expect(result!.geometry).toEqual({ x: 640, y: 0, width: 640, height: 1080 });
  });
});
