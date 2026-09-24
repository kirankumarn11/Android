/**
 * PWA Widget Service:
 * Handles PWA Home Screen glanceable progress, OS App Badging,
 * Document Picture-in-Picture floating widgets, and cross-window sync.
 */

export interface WidgetData {
  todayTotalMl: number;
  dailyGoal: number;
  percentage: number;
  remainingMl: number;
  streak: number;
  unit: 'ml' | 'oz';
  lastLogTime?: number;
  nextReminderCountdown?: string;
  themeAccent?: string;
}

const WIDGET_STORAGE_KEY = 'hydroflow_widget_cache_v1';
const SYNC_CHANNEL_NAME = 'hydroflow-widget-sync';

class WidgetService {
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      } catch {
        this.broadcastChannel = null;
      }
    }
  }

  /**
   * Update the OS Home Screen / Taskbar App Badge
   * Displays the remaining glasses to drink today directly on the app icon badge!
   */
  public updateAppBadge(todayTotalMl: number, dailyGoal: number, cupVolume = 250) {
    if (typeof navigator === 'undefined') return;

    try {
      const remainingMl = Math.max(0, dailyGoal - todayTotalMl);
      const remainingGlasses = Math.ceil(remainingMl / cupVolume);

      if ('setAppBadge' in navigator) {
        if (remainingGlasses > 0) {
          (navigator as unknown as { setAppBadge: (count: number) => Promise<void> })
            .setAppBadge(remainingGlasses)
            .catch(() => {});
        } else {
          (navigator as unknown as { clearAppBadge: () => Promise<void> })
            .clearAppBadge()
            .catch(() => {});
        }
      }
    } catch {
      // Ignore unsupported browser failures silently
    }
  }

  /**
   * Clear the OS App Badge
   */
  public clearAppBadge() {
    if (typeof navigator === 'undefined') return;
    try {
      if ('clearAppBadge' in navigator) {
        (navigator as unknown as { clearAppBadge: () => Promise<void> })
          .clearAppBadge()
          .catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Save and broadcast latest widget data so any floating or external widget is live-synced
   */
  public syncWidgetData(data: WidgetData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
      this.broadcastChannel?.postMessage({ type: 'WIDGET_UPDATE', data });
    } catch (e) {
      console.warn('Failed to sync widget data', e);
    }
  }

  /**
   * Get cached widget data for fast immediate rendering in widget mode
   */
  public getCachedWidgetData(): WidgetData | null {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(WIDGET_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * Subscribe to widget updates from other tabs / full application
   */
  public onWidgetUpdate(callback: (data: WidgetData) => void): () => void {
    if (!this.broadcastChannel) {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === WIDGET_STORAGE_KEY && e.newValue) {
          try {
            callback(JSON.parse(e.newValue));
          } catch {
            // ignore
          }
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }

    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'WIDGET_UPDATE' && event.data.data) {
        callback(event.data.data);
      }
    };

    this.broadcastChannel.addEventListener('message', handler);
    return () => this.broadcastChannel?.removeEventListener('message', handler);
  }

  /**
   * Check if Document Picture-in-Picture (floating widget) is supported
   */
  public isDocumentPiPSupported(): boolean {
    return typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  }

  /**
   * Check if App Badging API is supported
   */
  public isAppBadgingSupported(): boolean {
    return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
  }

  /**
   * Launch a persistent Floating Desktop Widget window
   */
  public async launchFloatingWidget(onWindowOpen?: (pipWin: Window) => void): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check modern Chromium Document Picture-in-Picture API
    if (this.isDocumentPiPSupported()) {
      try {
        const dpip = (window as unknown as {
          documentPictureInPicture: {
            requestWindow: (options: { width: number; height: number }) => Promise<Window>;
          };
        }).documentPictureInPicture;

        const pipWindow = await dpip.requestWindow({
          width: 340,
          height: 420,
        });

        // Copy styles to the PiP window so Tailwind & fonts work identically
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch {
            const link = document.createElement('link');
            if (styleSheet.href) {
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media.toString();
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        // Set attributes
        pipWindow.document.documentElement.className = document.documentElement.className;
        pipWindow.document.documentElement.setAttribute(
          'data-accent',
          document.documentElement.getAttribute('data-accent') || 'water'
        );
        pipWindow.document.title = '💧 HydroFlow Widget';

        onWindowOpen?.(pipWindow);
        return true;
      } catch (err) {
        console.warn('Document Picture-in-Picture failed, falling back to popup window', err);
      }
    }

    // Fallback: Standalone popup window
    const popup = window.open(
      '/?mode=widget',
      'HydroFlowWidget',
      'width=340,height=440,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
    if (popup) {
      popup.focus();
      return true;
    }
    return false;
  }
}

export const widgetService = new WidgetService();
