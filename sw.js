const CACHE = "mdq-sur-v2";
const FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/banner1.jpg",
  "/banner2.jpg",
  "/faro-nuevo.jpg",
  "/ritmos-faro.jpg",
  "/actividades.json",
  "/quiniela.json",
  "/cortes-edea.json"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k!== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if(e.request.url.includes('dolarapi') || e.request.url.includes('open-meteo') || e.request.url.includes('marine-api')) return res;
      return caches.open(CACHE).then(c => { c.put(e.request, res.clone()); return res; });
    }))
  );
});
