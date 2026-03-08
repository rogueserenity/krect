import { describe, it, expect, beforeEach } from 'vitest';
import { resolveSnap } from '../core/snap.js';
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
