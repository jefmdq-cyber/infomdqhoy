const CACHE = "mdq-sur-v5";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;

  // 1. Tus 3 APIs importantes - siempre a la red, nunca cache
  if (url.includes("dolarapi") || url.includes("open-meteo") || url.includes("marine")) {
    return;
  }

  // 2. Si es la página principal (navegación), siempre red primero
  // Esto es lo que arregla que no te cargue en celular
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request, {cache: "no-store"})
        .then(r => {
          // Guarda la versión nueva para offline
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match("/index.html")))
    );
    return;
  }

  // 3. Resto (fotos, css, js) - cache primero
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(r => {
        return caches.open(CACHE).then(c => {
          c.put(e.request, r.clone());
          return r;
        });
      });
    })
  );
});
