const CACHE = "mdq-sur-v3";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.url.includes('dolarapi') || e.request.url.includes('open-meteo')) return;
  e.respondWith(fetch(e.request).catch(()=> caches.match(e.request).then(r=> r || caches.match('/index.html'))));
});
