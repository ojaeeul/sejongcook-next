self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass through all requests to satisfy PWA installability requirement
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
