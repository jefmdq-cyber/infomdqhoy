const CACHE = "mdq-sur-v3";
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // No cacheamos dolarapi ni clima porque tienen que estar siempre frescos
  if (e.request.url.includes('dolarapi.com') || e.request.url.includes('open-meteo.com') || e.request.url.includes('marine-api')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cacheada => {
      return cacheada || fetch(e.request).then(red => {
        return caches.open(CACHE).then(c => {
          c.put(e.request, red.clone());
          return red;
        });
      }).catch(()=> caches.match('/index.html'));
    })
  );
});
