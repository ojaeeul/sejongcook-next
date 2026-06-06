self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Claim clients so the service worker takes control immediately
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // A minimal fetch handler is required by Chrome to pass PWA installability criteria
});
