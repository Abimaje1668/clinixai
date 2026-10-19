// ======================================
// CLINIXAI VERSION 3.0
// SERVICE WORKER
// ======================================

const CACHE_NAME = "clinixai-v3-cache-1";

const FILES_TO_CACHE = [
  "./login.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names
          .filter(name =>
            name.startsWith("clinixai-") &&
            name !== CACHE_NAME
          )
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Do not intercept external services.
  if (url.origin !== self.location.origin) return;

  // Always fetch HTML pages from the network.
  if (event.request.mode === "navigate") {

    event.respondWith(
      fetch(event.request).catch(async () => {

        // Offline fallback: login interface only.
        const cached =
          await caches.match("./login.html");

        return cached || Response.error();

      })
    );

    return;
  }

  // Cache-first for other local assets.
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );

});
