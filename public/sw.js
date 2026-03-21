// RYVYNN Service Worker — Push Notifications + Offline Shell
const CACHE = 'ryvynn-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/', '/guardian', '/wall', '/journal', '/assets/dual-flame-logo.png'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('push', (e) => {
  const data = e.data?.json() || {};
  const title = data.title || '🔥 RYVYNN';
  const body = data.body || 'Something real just happened on the Wall.';
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/assets/dual-flame-logo.png',
      badge: '/assets/dual-flame-logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/wall' },
      actions: [
        { action: 'open', title: 'See the Wall' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/wall';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
