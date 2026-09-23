export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

class NotificationService {
  public getPermissionStatus(): NotificationPermissionStatus {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission as NotificationPermissionStatus;
  }

  public async requestPermission(): Promise<NotificationPermissionStatus> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionStatus;
    } catch {
      return 'denied';
    }
  }

  public showHydrationNotification(options: {
    title: string;
    body: string;
    tag?: string;
    onNotificationClick?: () => void;
  }) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return null;
    }

    if (Notification.permission === 'granted') {
      try {
        const notifOptions: NotificationOptions & { renotify?: boolean } = {
          body: options.body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: options.tag || 'water-reminder',
          renotify: true,
        };
        const notif = new Notification(options.title, notifOptions as NotificationOptions);

        notif.onclick = () => {
          window.focus();
          options.onNotificationClick?.();
          notif.close();
        };

        return notif;
      } catch (e) {
        console.warn('System notification failed, relying on in-app prompt', e);
      }
    }
    return null;
  }
}

export const notificationService = new NotificationService();
