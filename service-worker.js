const CACHE_NAME = 'idle-village-v18-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const isHTML = req.headers.get('accept')?.includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then((res) => res || fetch(req).then((netRes) => {
        const copy = netRes.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return netRes;
      }))
    );
  }
});
