const CACHE_NAME = "keystone-v5";
const DATA_CACHE = "keystone-data-v2";
const OFFLINE_QUEUE = "keystone-offline-queue";
const OFFLINE_PAGE = "/offline/";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  OFFLINE_PAGE,
];

// ── Install: precache critical assets ───────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────────────────

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

// ── Message: handle skip-waiting from update prompt ─────────────────

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Background Sync: retry queued offline writes ────────────────────

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
              const method = response.headers.get("X-Original-Method") || "PATCH";
              await fetch(request.url, {
                method,
                headers: { "Content-Type": "application/json" },
                body,
              });
              await cache.delete(request);
            }
          } catch {
            // Will retry on next sync event
          }
        }
      })
    );
  }
});

// ── Fetch: network-first with offline fallbacks ─────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // ── Queue Firebase writes when offline ────────────────────────────
  if (request.method !== "GET" && request.url.includes("firebaseio.com")) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const cache = await caches.open(OFFLINE_QUEUE);
        const body = await request.text();
        // Store original method in a header so sync can replay correctly
        await cache.put(
          request,
          new Response(body, {
            headers: {
              "Content-Type": "application/json",
              "X-Original-Method": request.method,
            },
          })
        );
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
  if (request.method !== "GET") return;

  const url = request.url;

  // ── Firebase RTDB: stale-while-revalidate ─────────────────────────
  if (url.includes("firebaseio.com") && url.includes(".json")) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
        fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() =>
            cache.match(request).then(
              (cached) =>
                cached ||
                new Response("{}", {
                  headers: { "Content-Type": "application/json" },
                })
            )
          )
      )
    );
    return;
  }

  // Skip other external origins
  if (!url.startsWith(self.location.origin)) return;

  // ── Same-origin: network-first with cache fallback ────────────────
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          // Navigation requests get the offline page
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_PAGE).then(
              (offlinePage) => offlinePage || caches.match("/")
            );
          }
          return new Response("", { status: 408, statusText: "Offline" });
        })
      )
  );
});
