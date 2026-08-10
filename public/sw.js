const VERSION = '17.0.0';
const CACHE_NAME = `unicode-picker-${VERSION}-v1`;
// Relative URLs resolve against the service worker's own script URL, which lives
// at the deployment base (e.g. /unicode-symbol-picker/sw.js). This keeps the
// shell cache correct under any base path, including GitHub Pages subpaths.
const SHELL = ['./', './manifest.webmanifest', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('unicode-picker-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Match versioned data shards anywhere under the base path (e.g.
  // /unicode-symbol-picker/data/17.0.0/...), not only at the origin root.
  const isVersionedData = url.pathname.includes(`/data/${VERSION}/`);
  if (isVersionedData) {
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(self.registration.scope)));
  }
});
