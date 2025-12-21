/* Service Worker de Supervivencia - WADI OS */
const CACHE_NAME = "wadi-os-core-v1";
const ASSETS = ["/", "/index.html"];

// Instalar y Pre-cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Intentamos cachear lo básico. En desarrollo Vite sirve archivos al vuelo,
      // así que esto es más simbólico para la estructura PWA en dev.
      // En producción, aquí irían los assets compilados.
      return cache.addAll(ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache warning (expected in dev):", err);
      });
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones
self.addEventListener("fetch", (event) => {
  // Estrategia: Network First, falling back to Cache (para frescura en chat)
  // Excepto para assets estáticos que podrían ser Cache First.
  // Para simplificar y asegurar funcionamiento online (WADI necesita API):

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // Si falla todo, mensaje diegético en consola (no podemos inyectar HTML fácilmente aquí sin un offline.html)
          console.error(
            "[PWA_ERROR]: El Auditor no puede operar en el vacío. Sin conexión al Núcleo."
          );
          // Podríamos retornar una respuesta de error customizada
          return new Response(
            "<h1>[ERROR CRÍTICO]</h1><p>Conexión con el Núcleo perdida. El Auditor no puede operar en el vacío.</p>",
            {
              headers: { "Content-Type": "text/html" },
            }
          );
        });
      })
    );
    return;
  }

  // Para otros recursos (CSS, JS, Imágenes)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch((err) => {
          // Fallo silencioso para assets no críticos
          // Log técnico solicitado
          console.log(`[PWA_ASSET_FAIL]: ${event.request.url}`);
          throw err;
        })
      );
    })
  );
});
