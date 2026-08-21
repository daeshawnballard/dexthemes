const PRECACHE = "dexthemes-precache-1e27cfc394";
const RUNTIME = "dexthemes-runtime-1e27cfc394";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-R2P25YL6.js",
  "/dist/assets/chunk-SQE76S5B.js",
  "/dist/assets/chunk-DQCXNENB.js",
  "/dist/assets/chunk-ML4LBP27.js",
  "/dist/assets/chunk-AI2PMR5M.js",
  "/dist/assets/chunk-ZXFNXDXM.js",
  "/dist/assets/chunk-PPXZD6CC.js",
  "/dist/assets/chunk-STVKRBRR.js",
  "/dist/assets/chunk-QPXTP77A.js",
  "/dist/assets/chunk-RG7D4OHQ.js",
  "/dist/assets/chunk-5XENXAMD.js",
  "/dist/assets/chunk-XKDZLC6T.js",
  "/dist/assets/chunk-QW7K7FD5.js",
  "/dist/assets/chunk-GSSZLVYQ.js",
  "/dist/assets/chunk-A2KQFSJK.js",
  "/dist/assets/chunk-QXUKGEJ3.js",
  "/dist/assets/chunk-YKOHX62J.js",
  "/dist/assets/chunk-FM47TJPQ.js",
  "/dist/assets/chunk-FITSRO75.js",
  "/dist/assets/chunk-6RZOV6Y4.js",
  "/dist/assets/chunk-2F3WND4J.js",
  "/dist/assets/chunk-KT3V5QNY.js",
  "/dist/assets/boot-b2fe4f7104.js",
  "/dist/assets/styles-47e3263a72.css",
  "/dist/assets/dexthemes-bundle-e359bd4954.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name !== PRECACHE && name !== RUNTIME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

function isStaticRequest(request, url) {
  return (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/dist/assets/") ||
      ["/", "/manifest.json", "/favicon.svg", "/apple-touch-icon.png", "/icon-192.png"].includes(url.pathname) ||
      ["style", "script", "image", "font", "manifest"].includes(request.destination))
  );
}

function isCacheableApi(url) {
  return (
    url.origin === "https://acrobatic-corgi-867.convex.site" &&
    ["/themes", "/leaderboard", "/supporters"].includes(url.pathname)
  );
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || networkFetch;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("Network unavailable and no cache entry present");
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(
      networkFirst(event.request, RUNTIME).catch(async () => {
        const cache = await caches.open(PRECACHE);
        return cache.match("/");
      }),
    );
    return;
  }

  if (isStaticRequest(event.request, url) || isCacheableApi(url)) {
    event.respondWith(staleWhileRevalidate(event.request, RUNTIME));
  }
});
