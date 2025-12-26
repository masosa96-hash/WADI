// WADI Service Worker v3.0
// [PROTOCOL: OFFLINE_CAPABLE]

const CACHE_NAME = "wadi-os-v3-cache";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.svg",
];

self.addEventListener("install", (event) => {
  console.log("[WADI_SW]: Installing System Armor...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[WADI_SW]: System Armor Active.");
  // Clean old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[WADI_SW]: Purging old data:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Strategy: Network First, Fallback to Cache (Vital Validation)
  // For API calls, specific strategy might be needed but for now default.
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache if valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache
        console.log("[WADI_SW]: Offline mode engaged.");
        return caches.match(event.request);
      })
  );
});
