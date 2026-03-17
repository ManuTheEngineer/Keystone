const CACHE_NAME = "keystone-v3";
const DATA_CACHE = "keystone-data-v1";
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

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
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
