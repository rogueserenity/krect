import { describe, it, expect } from 'vitest';
import { computeSnapGeometry } from '../core/geometry.js';
import type { Rect } from '../adapter.js';

const workArea: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const offsetWorkArea: Rect = { x: 100, y: 50, width: 1920, height: 1080 };

describe('edge snaps', () => {
  it('left: cycles width, full height, pinned to left', () => {
    expect(computeSnapGeometry(workArea, 'left', 0)).toEqual({ x: 0, y: 0, width: 960, height: 1080 });
    expect(computeSnapGeometry(workArea, 'left', 1)).toEqual({ x: 0, y: 0, width: 1280, height: 1080 });
    expect(computeSnapGeometry(workArea, 'left', 2)).toEqual({ x: 0, y: 0, width: 640, height: 1080 });
  });

  it('right: cycles width, full height, pinned to right', () => {
    expect(computeSnapGeometry(workArea, 'right', 0)).toEqual({ x: 960, y: 0, width: 960, height: 1080 });
    expect(computeSnapGeometry(workArea, 'right', 1)).toEqual({ x: 640, y: 0, width: 1280, height: 1080 });
    expect(computeSnapGeometry(workArea, 'right', 2)).toEqual({ x: 1280, y: 0, width: 640, height: 1080 });
  });

  it('top: full width, cycles height, pinned to top', () => {
    expect(computeSnapGeometry(workArea, 'top', 0)).toEqual({ x: 0, y: 0, width: 1920, height: 540 });
    expect(computeSnapGeometry(workArea, 'top', 1)).toEqual({ x: 0, y: 0, width: 1920, height: 720 });
    expect(computeSnapGeometry(workArea, 'top', 2)).toEqual({ x: 0, y: 0, width: 1920, height: 360 });
  });

  it('bottom: full width, cycles height, pinned to bottom', () => {
    expect(computeSnapGeometry(workArea, 'bottom', 0)).toEqual({ x: 0, y: 540, width: 1920, height: 540 });
    expect(computeSnapGeometry(workArea, 'bottom', 1)).toEqual({ x: 0, y: 360, width: 1920, height: 720 });
    expect(computeSnapGeometry(workArea, 'bottom', 2)).toEqual({ x: 0, y: 720, width: 1920, height: 360 });
  });
});

describe('corner snaps', () => {
  it('top-left: cycles width, half height, pinned to top-left', () => {
    expect(computeSnapGeometry(workArea, 'top-left', 0)).toEqual({ x: 0, y: 0, width: 960, height: 540 });
    expect(computeSnapGeometry(workArea, 'top-left', 1)).toEqual({ x: 0, y: 0, width: 1280, height: 540 });
    expect(computeSnapGeometry(workArea, 'top-left', 2)).toEqual({ x: 0, y: 0, width: 640, height: 540 });
  });

  it('top-right: cycles width, half height, pinned to top-right', () => {
    expect(computeSnapGeometry(workArea, 'top-right', 0)).toEqual({ x: 960, y: 0, width: 960, height: 540 });
    expect(computeSnapGeometry(workArea, 'top-right', 1)).toEqual({ x: 640, y: 0, width: 1280, height: 540 });
    expect(computeSnapGeometry(workArea, 'top-right', 2)).toEqual({ x: 1280, y: 0, width: 640, height: 540 });
  });

  it('bottom-left: cycles width, half height, pinned to bottom-left', () => {
    expect(computeSnapGeometry(workArea, 'bottom-left', 0)).toEqual({ x: 0, y: 540, width: 960, height: 540 });
    expect(computeSnapGeometry(workArea, 'bottom-left', 1)).toEqual({ x: 0, y: 540, width: 1280, height: 540 });
    expect(computeSnapGeometry(workArea, 'bottom-left', 2)).toEqual({ x: 0, y: 540, width: 640, height: 540 });
  });

  it('bottom-right: cycles width, half height, pinned to bottom-right', () => {
    expect(computeSnapGeometry(workArea, 'bottom-right', 0)).toEqual({ x: 960, y: 540, width: 960, height: 540 });
    expect(computeSnapGeometry(workArea, 'bottom-right', 1)).toEqual({ x: 640, y: 540, width: 1280, height: 540 });
    expect(computeSnapGeometry(workArea, 'bottom-right', 2)).toEqual({ x: 1280, y: 540, width: 640, height: 540 });
  });
});

describe('center snap', () => {
  it('cycles width, full height, centered horizontally', () => {
    expect(computeSnapGeometry(workArea, 'center', 0)).toEqual({ x: 480, y: 0, width: 960, height: 1080 });
    expect(computeSnapGeometry(workArea, 'center', 1)).toEqual({ x: 320, y: 0, width: 1280, height: 1080 });
    expect(computeSnapGeometry(workArea, 'center', 2)).toEqual({ x: 640, y: 0, width: 640, height: 1080 });
  });
});

describe('sixth snaps - wide screen (2x3)', () => {
  // 1920x1080 is wide: 2 rows x 3 cols, cells are 640x540
  it('sixth-1 starts at cell 0 and cycles through all 6', () => {
    expect(computeSnapGeometry(workArea, 'sixth-1', 0)).toEqual({ x: 0,    y: 0,   width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-1', 1)).toEqual({ x: 640,  y: 0,   width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-1', 2)).toEqual({ x: 1280, y: 0,   width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-1', 3)).toEqual({ x: 0,    y: 540, width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-1', 4)).toEqual({ x: 640,  y: 540, width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-1', 5)).toEqual({ x: 1280, y: 540, width: 640, height: 540 });
  });

  it('sixth-4 starts at cell 3', () => {
    expect(computeSnapGeometry(workArea, 'sixth-4', 0)).toEqual({ x: 0,    y: 540, width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-4', 1)).toEqual({ x: 640,  y: 540, width: 640, height: 540 });
    expect(computeSnapGeometry(workArea, 'sixth-4', 5)).toEqual({ x: 1280, y: 0,   width: 640, height: 540 });
  });
});

describe('sixth snaps - tall screen (3x2)', () => {
  // 1080x1920 is tall: 3 rows x 2 cols, cells are 540x640
  const tallWorkArea: Rect = { x: 0, y: 0, width: 1080, height: 1920 };

  it('sixth-1 starts at cell 0 and cycles through all 6', () => {
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 0)).toEqual({ x: 0,   y: 0,    width: 540, height: 640 });
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 1)).toEqual({ x: 540, y: 0,    width: 540, height: 640 });
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 2)).toEqual({ x: 0,   y: 640,  width: 540, height: 640 });
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 3)).toEqual({ x: 540, y: 640,  width: 540, height: 640 });
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 4)).toEqual({ x: 0,   y: 1280, width: 540, height: 640 });
    expect(computeSnapGeometry(tallWorkArea, 'sixth-1', 5)).toEqual({ x: 540, y: 1280, width: 540, height: 640 });
  });
});

describe('offset work area', () => {
  it('left snap respects work area offset', () => {
    expect(computeSnapGeometry(offsetWorkArea, 'left', 0)).toEqual({ x: 100, y: 50, width: 960, height: 1080 });
  });

  it('bottom-right snap respects work area offset', () => {
    expect(computeSnapGeometry(offsetWorkArea, 'bottom-right', 0)).toEqual({ x: 1060, y: 590, width: 960, height: 540 });
  });
});
