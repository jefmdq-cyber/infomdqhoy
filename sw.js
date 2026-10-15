// KILL SWITCH TEMPORAL - borra todo y se desinstala
const CACHE = "mdq-sur-v5-kill";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll({type: "window"});
    }).then(clients => {
      clients.forEach(client => {
        client.navigate(client.url);
      });
    })
  );
});

self.addEventListener("fetch", e => {
  // No cachea nada, pasa todo directo a la red
  e.respondWith(fetch(e.request));
});
