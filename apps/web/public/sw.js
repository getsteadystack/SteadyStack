/*
 * SteadyStack service worker — offline fallback for the dashboard.
 *
 * Strategy:
 * - Navigations: network-first with a cached /offline.html fallback, so the
 *   dashboard keeps working with stale markup when the network is gone.
 * - Static assets (/_next/static/**, icons): cache-first; they are
 *   content-hashed by Next.js, so a cached copy is always correct.
 * - Everything else (tRPC/server actions): pass through. If the network fails,
 *   the UI surfaces its own cached data (react-query) or the offline toast.
 */

const VERSION = "v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL, "/favicon.svg", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(`steadystack-precache-${VERSION}`);
      await cache.addAll(PRECACHE_URLS);
      // Take over immediately once installed so the first offline visit after
      // a reload is already covered.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("steadystack-") && !name.endsWith(VERSION))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only GET navigations/static assets; never touch non-GET (mutations) or
  // cross-origin requests (worker WS endpoints, analytics, third parties).
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const url = new URL(request.url);

  // 1. Page navigations → network-first, fall back to offline shell.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Keep the last good copy of each page for navigation fallback.
          const cache = await caches.open(`steadystack-pages-${VERSION}`);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(`steadystack-precache-${VERSION}`);
          // Prefer the last good copy of the exact page; else the offline shell.
          return (
            (await cache.match(request)) ||
            (await caches.match(request)) ||
            (await cache.match(OFFLINE_URL))
          );
        }
      })(),
    );
    return;
  }

  // 2. Content-hashed static assets → cache-first.
  if (url.pathname.startsWith("/_next/static/") || PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(`steadystack-static-${VERSION}`);
          cache.put(request, response.clone());
        }
        return response;
      })(),
    );
  }

  // 3. Everything else (API routes, RSC payloads, tRPC) → network only.
});
