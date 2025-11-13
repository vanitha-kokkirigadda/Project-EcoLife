// EcoLife – Non-PWA Service Worker (safe placeholder)
// Does not cache anything. Prevents 404 errors.

self.addEventListener('install', () => {
  console.log('EcoLife service worker registered (non-PWA mode)');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
