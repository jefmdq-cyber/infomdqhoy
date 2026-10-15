// Versión 2.1 - Forzar actualización post-incidente 15-10-2026
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // No cachea nada, obliga a la aplicación a buscar siempre en internet
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
