export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Screen {
  index: number;
  workArea: Rect;
}

export interface KWinAdapter {
  getActiveWindowId(): string | null;
  getWindowGeometry(windowId: string): Rect | null;
  setWindowGeometry(windowId: string, geometry: Rect): void;
  isWindowMaximized(windowId: string): boolean;
  unmaximizeWindow(windowId: string): void;
  getScreens(): Screen[];
  getWindowScreen(windowId: string): number | null;
  registerShortcut(id: string, description: string, defaultKey: string, callback: () => void): void;
  onWindowClosed(callback: (windowId: string) => void): void;
  onScreenChanged(callback: () => void): void;
}
