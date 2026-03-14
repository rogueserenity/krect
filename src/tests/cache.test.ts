import { describe, it, expect, beforeEach } from 'vitest';
import { buildCache, getSnapGeometry } from '../core/cache.js';
import type { Screen } from '../adapter.js';

const screen0: Screen = { index: 0, workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
const screen1: Screen = { index: 1, workArea: { x: 1920, y: 0, width: 2560, height: 1440 } };

beforeEach(() => {
  buildCache([screen0, screen1]);
});

describe('getSnapGeometry', () => {
  it('returns correct geometry for a known position and cycle index', () => {
    expect(getSnapGeometry(0, 'left', 0)).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
    expect(getSnapGeometry(0, 'left', 1)).toEqual({ x: 0, y: 0, width: 1280, height: 1080 });
    expect(getSnapGeometry(0, 'left', 2)).toEqual({ x: 0, y: 0, width: 640, height: 1080 });
  });

  it('returns correct geometry for a second monitor', () => {
    expect(getSnapGeometry(1, 'left', 0)).toEqual({ x: 1920, y: 0, width: 1280, height: 1440 });
  });

  it('returns null for unknown screen', () => {
    expect(getSnapGeometry(99, 'left', 0)).toBeNull();
  });

  it('returns null for out-of-range cycle index', () => {
    expect(getSnapGeometry(0, 'left', 3)).toBeNull();
  });

  it('returns all 6 cycle variants for sixth positions', () => {
    for (let i = 0; i < 6; i++) {
      expect(getSnapGeometry(0, 'sixth-1', i)).not.toBeNull();
    }
    expect(getSnapGeometry(0, 'sixth-1', 6)).toBeNull();
  });
});

describe('buildCache', () => {
  it('rebuilds cache when called again with new screens', () => {
    const newScreen: Screen = { index: 0, workArea: { x: 0, y: 0, width: 800, height: 600 } };
    buildCache([newScreen]);
    expect(getSnapGeometry(0, 'left', 0)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
  });

  it('removes screens that are no longer present', () => {
    buildCache([screen0]);
    expect(getSnapGeometry(1, 'left', 0)).toBeNull();
  });

  it('clears the cache when called with an empty screens array', () => {
    buildCache([]);
    expect(getSnapGeometry(0, 'left', 0)).toBeNull();
    expect(getSnapGeometry(1, 'left', 0)).toBeNull();
  });
});
