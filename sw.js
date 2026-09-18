const CACHE="mdq-sur-v4";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=CACHE).map(x=>caches.delete(x)))));
  self.clients.claim()
});
self.addEventListener("fetch",e=>{
  if(e.request.url.includes("dolarapi")||e.request.url.includes("open-meteo")||e.request.url.includes("marine")) return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||caches.match("/index.html"))))
});
