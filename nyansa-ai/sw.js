// Nyansa AI — Service Worker v2
// Caches the entire app shell for offline use

const CACHE = 'nyansa-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install — cache all core assets
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).catch(function(err) {
      console.warn('[SW] Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;

  // AI proxy calls — always network, never cache
  if (event.request.url.includes('.netlify/functions/')) {
    return; // let it fall through to network
  }

  // Google Fonts — network first, cache fallback
  if (event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com') ||
      event.request.url.includes('fonts.cdnfonts.com')) {
    event.respondWith(
      caches.open(CACHE).then(function(cache) {
        return fetch(event.request).then(function(response) {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(function() {
          return caches.match(event.request);
        });
      })
    );
    return;
  }

  // App shell — cache first, update in background
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var networkFetch = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          caches.open(CACHE).then(function(cache) {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(function() { return cached; });

      return cached || networkFetch;
    }).catch(function() {
      // Fallback to index.html for navigation requests
      if (event.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
