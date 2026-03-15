const CACHE_NAME = "keystone-v2";
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
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip Firebase and API calls
  if (event.request.url.includes("firebaseio.com")) return;
  if (event.request.url.includes("googleapis.com")) return;
  if (event.request.url.includes("firebasestorage.app")) return;

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
          // Return a basic offline fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("", { status: 408, statusText: "Offline" });
        })
      )
  );
});
