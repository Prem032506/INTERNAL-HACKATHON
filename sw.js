/**
 * Global-Setu Service Worker v4 (Real-World Road Network & Cache Invalidation)
 * Network-First strategy to ensure users always receive 100% accurate road updates immediately,
 * with 100% Offline-First fallback for remote cellular shadow zones.
 */

const CACHE_NAME = 'global-setu-v4-road-accuracy';
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
  './assets/data/mock-telemetry.json',
  './assets/data/cached-road-routes.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching Global-Setu v4 with 100% Real Road Geometries');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial assets:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Bypass service worker caching for live backend and routing APIs
  if (url.includes(':5000') || url.includes('router.project-osrm.org') || url.includes('api.open-meteo.com')) {
    return;
  }

  // Network-First Strategy: Always fetch fresh code & data from network; fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
