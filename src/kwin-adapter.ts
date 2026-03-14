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
      try {
        const area = workspace.clientArea(workspace.MaximizeArea, win.output, workspace.currentDesktop);
        const g = win.frameGeometry;
        return Math.round(g.x) === Math.round(area.x) &&
               Math.round(g.y) === Math.round(area.y) &&
               Math.round(g.width) === Math.round(area.width) &&
               Math.round(g.height) === Math.round(area.height);
      } catch (e) {
        console.error('krect: isWindowMaximized failed', e);
        return false;
      }
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
      try {
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
      } catch (e) {
        console.error('krect: getScreens failed', e);
        return [];
      }
    },

    getWindowScreen(windowId: string): number | null {
      const win = findWindow(windowId);
      if (!win) return null;
      try {
        const outputs = workspace.screens;
        for (let i = 0; i < outputs.length; i++) {
          if (outputs[i] === win.output) return i;
        }
        return null;
      } catch (e) {
        console.error('krect: getWindowScreen failed', e);
        return null;
      }
    },

    registerShortcut(id: string, description: string, defaultKey: string, callback: () => void): void {
      registerShortcut(id, description, defaultKey, callback);
    },

    onWindowClosed(callback: (windowId: string) => void): void {
      try {
        workspace.windowRemoved.connect((win: any) => {
          callback(win.internalId.toString());
        });
      } catch (e) {
        console.error('krect: onWindowClosed connect failed', e);
      }
    },

    onScreenChanged(callback: () => void): void {
      try {
        workspace.screensChanged.connect(callback);
      } catch (e) {
        console.error('krect: screensChanged connect failed', e);
      }
      try {
        workspace.virtualScreenGeometryChanged.connect(callback);
      } catch (e) {
        console.error('krect: virtualScreenGeometryChanged connect failed', e);
      }
    },
  };
}

function findWindow(windowId: string): any | null {
  const wins: any[] | null = workspace.windowList();
  if (!wins) return null;
  return wins.find((w: any) => w.internalId.toString() === windowId) ?? null;
}
