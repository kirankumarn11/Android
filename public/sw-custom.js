// HydroFlow Custom Service Worker Extension
// Handles native notification interactions, background actions, and deep-linking

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  let targetUrl = '/';

  if (action === 'log_cup') {
    targetUrl = '/?action=log_cup';
  } else if (action === 'log_bottle') {
    targetUrl = '/?action=log_bottle';
  } else if (action === 'snooze_15') {
    targetUrl = '/?action=snooze_15';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a HydroFlow tab is already open, focus it and broadcast the action
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (action) {
            client.postMessage({ type: 'NOTIFICATION_ACTION', action });
          }
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window is currently open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (_event) => {
  // Notification dismissed by user
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});
