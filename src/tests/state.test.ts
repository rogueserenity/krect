import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWindowState,
  setWindowState,
  clearWindowState,
  computeNextCycleIndex,
} from '../core/state.js';

beforeEach(() => {
  // Clean up any state between tests
  clearWindowState('win-1');
  clearWindowState('win-2');
});

describe('getWindowState', () => {
  it('returns undefined for unknown window', () => {
    expect(getWindowState('win-1')).toBeUndefined();
  });

  it('returns state after it is set', () => {
    const state = { position: 'left' as const, cycleIndex: 1, screen: 0 };
    setWindowState('win-1', state);
    expect(getWindowState('win-1')).toEqual(state);
  });
});

describe('clearWindowState', () => {
  it('removes state for the window', () => {
    setWindowState('win-1', { position: 'left', cycleIndex: 0, screen: 0 });
    clearWindowState('win-1');
    expect(getWindowState('win-1')).toBeUndefined();
  });

  it('does not affect other windows', () => {
    setWindowState('win-1', { position: 'left', cycleIndex: 0, screen: 0 });
    setWindowState('win-2', { position: 'right', cycleIndex: 1, screen: 0 });
    clearWindowState('win-1');
    expect(getWindowState('win-2')).toEqual({ position: 'right', cycleIndex: 1, screen: 0 });
  });
});

describe('computeNextCycleIndex', () => {
  it('returns 0 for a new window with no state', () => {
    expect(computeNextCycleIndex(undefined, 'left', 3)).toBe(0);
  });

  it('returns 0 when position changes', () => {
    const state = { position: 'left' as const, cycleIndex: 2, screen: 0 };
    expect(computeNextCycleIndex(state, 'right', 3)).toBe(0);
  });

  it('increments cycle index for same position', () => {
    const state = { position: 'left' as const, cycleIndex: 0, screen: 0 };
    expect(computeNextCycleIndex(state, 'left', 3)).toBe(1);
  });

  it('wraps cycle index back to 0', () => {
    const state = { position: 'left' as const, cycleIndex: 2, screen: 0 };
    expect(computeNextCycleIndex(state, 'left', 3)).toBe(0);
  });

  it('wraps correctly for sixth cycle count of 6', () => {
    const state = { position: 'sixth-1' as const, cycleIndex: 5, screen: 0 };
    expect(computeNextCycleIndex(state, 'sixth-1', 6)).toBe(0);
  });
});
