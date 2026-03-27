const PRECACHE = "dexthemes-precache-b227dd6c96";
const RUNTIME = "dexthemes-runtime-b227dd6c96";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-JBWYVHXM.js",
  "/dist/assets/boot-9a90443b68.js",
  "/dist/assets/styles-8221977bd4.css",
  "/dist/assets/dexthemes-bundle-d35397d275.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-JCSOSY5B.js",
  "/dist/assets/chunk-VVFDUKLT.js",
  "/dist/assets/chunk-DSGXM5O2.js",
  "/dist/assets/chunk-YBMIUNRE.js",
  "/dist/assets/chunk-4O7HWMI2.js",
  "/dist/assets/chunk-VQ4AVKMH.js",
  "/dist/assets/chunk-S6WWTV47.js",
  "/dist/assets/chunk-WXJDU2D5.js",
  "/dist/assets/chunk-RWS6ARNN.js",
  "/dist/assets/chunk-DDSZVB6J.js",
  "/dist/assets/chunk-KFOPYWNM.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-SOA4WDZA.js",
  "/dist/assets/chunk-YWBTM5IQ.js",
  "/dist/assets/chunk-BV4R6ECC.js",
  "/dist/assets/chunk-ICX7AHTB.js",
  "/dist/assets/chunk-JP2OPVRE.js",
  "/dist/assets/chunk-GRFL6DXB.js",
  "/dist/assets/chunk-UQCMWGXA.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-KER2KN3Z.js",
  "/dist/assets/chunk-ZBDK4IFE.js",
  "/dist/assets/chunk-6JRAYNJO.js",
  "/dist/assets/chunk-46S5KOPZ.js",
  "/dist/assets/chunk-DPM4CB4E.js",
  "/dist/assets/chunk-BOO3KVMG.js",
  "/dist/assets/chunk-K6OQVXED.js",
  "/dist/assets/chunk-VBUCI4GY.js",
  "/dist/assets/chunk-77A7JUMJ.js",
  "/dist/assets/chunk-3NNPFA4V.js",
  "/dist/assets/chunk-AOBV4U4T.js",
  "/dist/assets/chunk-NWQZOOK2.js"
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
