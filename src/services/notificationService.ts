export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface HydrationNotificationOptions {
  title: string;
  body: string;
  tag?: string;
  url?: string;
  vibrate?: number[];
  actions?: Array<{ action: string; title: string; icon?: string }>;
  onNotificationClick?: () => void;
}

class NotificationService {
  /**
   * Check current browser notification permission status
   */
  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  /**
   * Request notification permission from the user.
   * Handles modern Promise API and legacy callback API across all browsers.
   */
  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      // Modern Promise-based requestPermission
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionStatus;
    } catch (err) {
      // Fallback for older browsers using callback syntax
      return new Promise<NotificationPermissionStatus>((resolve) => {
        try {
          Notification.requestPermission((status) => {
            resolve(status as NotificationPermissionStatus);
          });
        } catch {
          resolve('denied');
        }
      });
    }
  }

  /**
   * Dispatches a system/OS notification.
   * Prioritizes ServiceWorkerRegistration.showNotification() which is REQUIRED
   * on Android Chrome, iOS PWA standalone mode, and modern mobile browsers.
   */
  public async showHydrationNotification(options: HydrationNotificationOptions): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      return false;
    }

    const tag = options.tag || 'hydroflow-water-reminder';
    const vibratePattern = options.vibrate || [250, 100, 250, 100, 250];

    const notifOptions: NotificationOptions & {
      renotify?: boolean;
      vibrate?: number[];
      actions?: Array<{ action: string; title: string }>;
      data?: { url?: string; timestamp?: number };
    } = {
      body: options.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag,
      renotify: true,
      vibrate: vibratePattern,
      data: {
        url: options.url || '/',
        timestamp: Date.now(),
      },
      actions: options.actions || [
        { action: 'log_cup', title: '💧 Drink Cup (+250ml)' },
        { action: 'snooze_15', title: '⏰ Snooze 15m' },
      ],
    };

    // Primary: Service Worker showNotification (crucial for Android and background triggers)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(options.title, notifOptions as NotificationOptions);
          return true;
        }
      } catch (swError) {
        console.warn('[NotificationService] ServiceWorker showNotification failed, trying fallback:', swError);
      }
    }

    // Secondary fallback: Desktop Window Notification constructor
    try {
      const notif = new Notification(options.title, {
        body: options.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag,
      });

      notif.onclick = () => {
        window.focus();
        options.onNotificationClick?.();
        notif.close();
      };

      return true;
    } catch (desktopError) {
      console.warn('[NotificationService] Desktop Notification constructor failed:', desktopError);
    }

    return false;
  }

  public showNotification(options: HydrationNotificationOptions) {
    return this.showHydrationNotification(options);
  }
}

export const notificationService = new NotificationService();
