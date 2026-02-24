// ─────────────────────────────────────────────────────────────────────────────
// Memory Board — Service Worker (manual, no build tool dependency)
// Strategy:
//   - Install: pre-cache the app shell (index.html + all versioned assets)
//   - Fetch:   Cache-First for static assets, Network-First for navigation
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_NAME = 'memory-board-v1';

// App shell files that are always available offline.
// Vite hashes JS/CSS filenames, so we use a catch-all fetch handler instead
// of listing them here — they get cached on first visit automatically.
const PRECACHE_URLS = ['/'];

// ── Install: cache the app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Fetch: serve from cache, fall back to network ────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Navigation requests (HTML pages) — Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/'))  // Offline fallback to cached shell
    );
    return;
  }

  // All other requests (JS, CSS, images, fonts, SVG) — Cache First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      // Not in cache yet — fetch, cache, and return
      return fetch(request).then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
