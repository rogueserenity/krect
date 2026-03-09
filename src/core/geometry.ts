import type { Rect } from '../adapter.js';

export type SnapPosition =
  | 'left' | 'right' | 'top' | 'bottom'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'center'
  | 'sixth-1' | 'sixth-2' | 'sixth-3' | 'sixth-4' | 'sixth-5' | 'sixth-6';

export const EDGE_CYCLE_COUNT = 3;
export const SIXTH_CYCLE_COUNT = 6;

export const ALL_SNAP_POSITIONS: SnapPosition[] = [
  'left', 'right', 'top', 'bottom',
  'top-left', 'top-right', 'bottom-left', 'bottom-right',
  'center',
  'sixth-1', 'sixth-2', 'sixth-3', 'sixth-4', 'sixth-5', 'sixth-6',
];

export function rectsEqual(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

export function getCycleCount(position: SnapPosition): number {
  return position.startsWith('sixth-') ? SIXTH_CYCLE_COUNT : EDGE_CYCLE_COUNT;
}

// cycleIndex 0 = 1/2, 1 = 2/3, 2 = 1/3
const CYCLE_FRACTIONS = [1 / 2, 2 / 3, 1 / 3] as const;

function cycleWidth(workArea: Rect, cycleIndex: number): number {
  return Math.round(workArea.width * (CYCLE_FRACTIONS[cycleIndex % EDGE_CYCLE_COUNT] ?? 1 / 2));
}

function sixthCell(workArea: Rect, startCell: number, cycleIndex: number): Rect {
  const cell = (startCell + cycleIndex) % SIXTH_CYCLE_COUNT;
  const isWide = workArea.width >= workArea.height;
  const cols = isWide ? 3 : 2;
  const rows = isWide ? 2 : 3;
  const cellWidth = Math.round(workArea.width / cols);
  const cellHeight = Math.round(workArea.height / rows);
  const col = cell % cols;
  const row = Math.floor(cell / cols);
  return {
    x: workArea.x + col * cellWidth,
    y: workArea.y + row * cellHeight,
    width: cellWidth,
    height: cellHeight,
  };
}

export function computeSnapGeometry(
  workArea: Rect,
  position: SnapPosition,
  cycleIndex: number
): Rect {
  const w = cycleWidth(workArea, cycleIndex);

  switch (position) {
    case 'left':
      return { x: workArea.x, y: workArea.y, width: w, height: workArea.height };

    case 'right':
      return { x: workArea.x + workArea.width - w, y: workArea.y, width: w, height: workArea.height };

    case 'top':
      return {
        x: workArea.x,
        y: workArea.y,
        width: workArea.width,
        height: Math.round(workArea.height * (CYCLE_FRACTIONS[cycleIndex % EDGE_CYCLE_COUNT] ?? 1 / 2)),
      };

    case 'bottom': {
      const h = Math.round(workArea.height * (CYCLE_FRACTIONS[cycleIndex % EDGE_CYCLE_COUNT] ?? 1 / 2));
      return { x: workArea.x, y: workArea.y + workArea.height - h, width: workArea.width, height: h };
    }

    case 'top-left':
      return { x: workArea.x, y: workArea.y, width: w, height: Math.round(workArea.height / 2) };

    case 'top-right':
      return { x: workArea.x + workArea.width - w, y: workArea.y, width: w, height: Math.round(workArea.height / 2) };

    case 'bottom-left':
      return { x: workArea.x, y: workArea.y + Math.round(workArea.height / 2), width: w, height: Math.round(workArea.height / 2) };

    case 'bottom-right':
      return {
        x: workArea.x + workArea.width - w,
        y: workArea.y + Math.round(workArea.height / 2),
        width: w,
        height: Math.round(workArea.height / 2),
      };

    case 'center':
      return { x: workArea.x + Math.round((workArea.width - w) / 2), y: workArea.y, width: w, height: workArea.height };

    case 'sixth-1': return sixthCell(workArea, 0, cycleIndex);
    case 'sixth-2': return sixthCell(workArea, 1, cycleIndex);
    case 'sixth-3': return sixthCell(workArea, 2, cycleIndex);
    case 'sixth-4': return sixthCell(workArea, 3, cycleIndex);
    case 'sixth-5': return sixthCell(workArea, 4, cycleIndex);
    case 'sixth-6': return sixthCell(workArea, 5, cycleIndex);
  }
}
