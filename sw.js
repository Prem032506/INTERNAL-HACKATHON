/**
 * Global-Setu Service Worker
 * Enables 100% Offline-First operation in remote cellular shadow zones
 */

const CACHE_NAME = 'global-setu-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './presentation.html',
  './architecture.html',
  './document.html',
  './manifest.json',
  './css/main.css',
  './css/map.css',
  './css/components.css',
  './css/presentation.css',
  './js/app.js',
  './js/map-engine.js',
  './js/fleet-telemetry.js',
  './js/ai-prediction.js',
  './js/field-report.js',
  './js/i18n.js',
  './js/diagrams.js',
  './js/presentation.js',
  './assets/data/global-regions.json',
  './assets/data/mock-telemetry.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Global-Setu core offline app shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through backend API calls directly
  if (event.request.url.includes(':5000')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, and revalidate in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Try network, fallback to cache if available
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for document navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
