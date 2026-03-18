const CACHE_NAME = "keystone-v4";
const DATA_CACHE = "keystone-data-v2";
const OFFLINE_QUEUE = "keystone-offline-queue";
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== DATA_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Background sync: retry queued offline writes when connectivity returns
self.addEventListener("sync", (event) => {
  if (event.tag === "keystone-offline-sync") {
    event.waitUntil(
      caches.open(OFFLINE_QUEUE).then(async (cache) => {
        const keys = await cache.keys();
        for (const request of keys) {
          try {
            const response = await cache.match(request);
            if (response) {
              const body = await response.text();
              await fetch(request.url, {
                method: request.method || "PATCH",
                headers: { "Content-Type": "application/json" },
                body,
              });
              await cache.delete(request);
            }
          } catch {
            // Will retry on next sync
          }
        }
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  // Queue Firebase writes when offline (PATCH/PUT/POST to firebaseio.com)
  if (
    event.request.method !== "GET" &&
    event.request.url.includes("firebaseio.com")
  ) {
    event.respondWith(
      fetch(event.request.clone()).catch(async () => {
        // Offline — queue the write for later sync
        const cache = await caches.open(OFFLINE_QUEUE);
        const body = await event.request.text();
        await cache.put(
          event.request,
          new Response(body, { headers: { "Content-Type": "application/json" } })
        );
        // Register for background sync
        if (self.registration.sync) {
          await self.registration.sync.register("keystone-offline-sync");
        }
        return new Response(JSON.stringify({ queued: true }), {
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return;
  }

  // Only handle GET requests for caching
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // Firebase Realtime Database — stale-while-revalidate for offline access
  if (url.includes("firebaseio.com") && url.includes(".json")) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
        fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request).then((cached) =>
            cached || new Response("{}", { headers: { "Content-Type": "application/json" } })
          ))
      )
    );
    return;
  }

  // Skip other external APIs
  if (!url.startsWith(self.location.origin)) return;

  // Same-origin: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("", { status: 408, statusText: "Offline" });
        })
      )
  );
});
