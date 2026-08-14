/* Howitlooks — service worker.
   Caches the app shell (this single HTML file + icons) so the app can
   install as a PWA and re-open instantly / work offline for already-visited
   screens. Bump CACHE_NAME whenever you ship a new version of index.html so
   returning users get the update instead of a stale cached copy. */
const CACHE_NAME = 'howitlooks-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations (so you always get the latest deployed
// index.html when online), falling back to the cached shell when offline.
// Cache-first for everything else (icons, manifest).
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
