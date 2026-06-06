
function getFetchUrl(endpoint, isPost = false) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let url = '';
    if (isLocal) {
        if (endpoint === 'settings') {
            url = 'http://localhost:8000/api/admin/data/settings';
        } else {
            url = `http://localhost:8000/api/${endpoint}`;
        }
        return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    } else {
        const base = `../api.php?board=sejong_${endpoint}`;
        return isPost ? base : base + `&t=${Date.now()}`;
    }
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Minimal fetch handler for PWA installability
});
