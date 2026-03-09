/* eslint-disable @typescript-eslint/no-explicit-any */

// KWin global types (not importable — provided by the KWin JS runtime)
declare const workspace: any;
declare function registerShortcut(name: string, desc: string, key: string, cb: () => void): void;

// ClientAreaOption enum — accessed as properties on the workspace object via Q_ENUM
// workspace.MaximizeArea = 2 (excludes panels)

import type { KWinAdapter, Rect, Screen } from './adapter.js';

function toRect(r: any): Rect {
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
}

export function createKWinAdapter(): KWinAdapter {
  return {
    getActiveWindowId(): string | null {
      const win = workspace.activeWindow;
      return win ? win.internalId.toString() : null;
    },

    getWindowGeometry(windowId: string): Rect | null {
      const win = findWindow(windowId);
      return win ? toRect(win.frameGeometry) : null;
    },

    setWindowGeometry(windowId: string, geometry: Rect): void {
      const win = findWindow(windowId);
      if (win) {
        win.frameGeometry = { x: geometry.x, y: geometry.y, width: geometry.width, height: geometry.height };
      }
    },

    isWindowMaximized(windowId: string): boolean {
      const win = findWindow(windowId);
      if (!win) return false;
      const area = workspace.clientArea(workspace.MaximizeArea, win.output, workspace.currentDesktop);
      const g = win.frameGeometry;
      return Math.round(g.x) === Math.round(area.x) &&
             Math.round(g.y) === Math.round(area.y) &&
             Math.round(g.width) === Math.round(area.width) &&
             Math.round(g.height) === Math.round(area.height);
    },

    unmaximizeWindow(windowId: string): void {
      const win = findWindow(windowId);
      if (win) win.setMaximize(false, false);
    },

    maximizeWindow(windowId: string): void {
      const win = findWindow(windowId);
      if (win) win.setMaximize(true, true);
    },

    getScreens(): Screen[] {
      const screens: Screen[] = [];
      const outputs = workspace.screens;
      const count: number = outputs.length;
      for (let i = 0; i < count; i++) {
        screens.push({
          index: i,
          workArea: toRect(workspace.clientArea(workspace.MaximizeArea, outputs[i], workspace.currentDesktop)),
        });
      }
      return screens;
    },

    getWindowScreen(windowId: string): number | null {
      const win = findWindow(windowId);
      if (!win) return null;
      const outputs = workspace.screens;
      for (let i = 0; i < outputs.length; i++) {
        if (outputs[i] === win.output) return i;
      }
      return null;
    },

    registerShortcut(id: string, description: string, defaultKey: string, callback: () => void): void {
      registerShortcut(id, description, defaultKey, callback);
    },

    onWindowClosed(callback: (windowId: string) => void): void {
      workspace.windowRemoved.connect((win: any) => {
        callback(win.internalId.toString());
      });
    },

    onScreenChanged(callback: () => void): void {
      workspace.screensChanged.connect(callback);
      workspace.virtualScreenGeometryChanged.connect(callback);
    },
  };
}

function findWindow(windowId: string): any | null {
  const wins: any[] = workspace.windowList();
  return wins.find((w: any) => w.internalId.toString() === windowId) ?? null;
}
