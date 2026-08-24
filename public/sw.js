const CACHE = "atlas-cloud-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];
const PRECACHE = self.__ATLAS_PRECACHE__ || [];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...APP_SHELL, ...PRECACHE])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  const cacheKey = new URL(event.request.url).pathname;
  event.respondWith(caches.match(cacheKey).then(async (cached) => {
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    } catch {
      if (event.request.mode === "navigate") return caches.match("/");
      return Response.error();
    }
  }));
});
