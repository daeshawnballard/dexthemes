const PRECACHE = "dexthemes-precache-7889be0e25";
const RUNTIME = "dexthemes-runtime-7889be0e25";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-ZUFQUNTW.js",
  "/dist/assets/boot-20c3168cac.js",
  "/dist/assets/styles-1753010a33.css",
  "/dist/assets/dexthemes-bundle-80d05f80ef.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-6PQO2XV4.js",
  "/dist/assets/chunk-USRO2VDZ.js",
  "/dist/assets/chunk-QY3SPJC2.js",
  "/dist/assets/chunk-IHJWEU5G.js",
  "/dist/assets/chunk-PFVMLBPH.js",
  "/dist/assets/chunk-WKK7EULQ.js",
  "/dist/assets/chunk-6X4OWTR5.js",
  "/dist/assets/chunk-4HIKDRR4.js",
  "/dist/assets/chunk-AI3ZUXXL.js",
  "/dist/assets/chunk-QHUZX7WU.js",
  "/dist/assets/chunk-MCBM5IRM.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-S3TAW5AY.js",
  "/dist/assets/chunk-XFABGQS6.js",
  "/dist/assets/chunk-IUWANPHF.js",
  "/dist/assets/chunk-3AI37G6A.js",
  "/dist/assets/chunk-LMY5GY4S.js",
  "/dist/assets/chunk-EUHIF5HU.js",
  "/dist/assets/chunk-6E5QUMDC.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-FI7AL7EM.js",
  "/dist/assets/chunk-SJSGI3LE.js",
  "/dist/assets/chunk-T4MV2GPY.js",
  "/dist/assets/chunk-NVROU7QN.js",
  "/dist/assets/chunk-LYDZBACQ.js",
  "/dist/assets/chunk-OEFSBYJ3.js",
  "/dist/assets/chunk-XB2THXGM.js",
  "/dist/assets/chunk-CLAAO3DQ.js",
  "/dist/assets/chunk-KEX7SU2U.js",
  "/dist/assets/chunk-YLTEIQYX.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-7FKJJEPK.js"
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
