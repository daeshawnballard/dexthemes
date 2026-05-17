const PRECACHE = "dexthemes-precache-b54ad26e83";
const RUNTIME = "dexthemes-runtime-b54ad26e83";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-OJJB2KE7.js",
  "/dist/assets/boot-8a0ab436b2.js",
  "/dist/assets/styles-8221977bd4.css",
  "/dist/assets/dexthemes-bundle-90cc295778.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-LV7AEAH5.js",
  "/dist/assets/chunk-5VMSRBW5.js",
  "/dist/assets/chunk-RVOCH3RS.js",
  "/dist/assets/chunk-2R6A5675.js",
  "/dist/assets/chunk-5VWODJVD.js",
  "/dist/assets/chunk-BQC5EJED.js",
  "/dist/assets/chunk-3CEKBOQY.js",
  "/dist/assets/chunk-PQUNJMFM.js",
  "/dist/assets/chunk-RTODOXYL.js",
  "/dist/assets/chunk-BCL2JTAX.js",
  "/dist/assets/chunk-MC5V3VIW.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-7E5W7YEH.js",
  "/dist/assets/chunk-5GTAHG3G.js",
  "/dist/assets/chunk-KGLKM7GB.js",
  "/dist/assets/chunk-7TYTUNJY.js",
  "/dist/assets/chunk-ZZ53QOBT.js",
  "/dist/assets/chunk-7ES2AOXY.js",
  "/dist/assets/chunk-DGKFCPP4.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-X6ZBSQNF.js",
  "/dist/assets/chunk-WV53ZX2C.js",
  "/dist/assets/chunk-7IGYXFZM.js",
  "/dist/assets/chunk-Q6EFJDHM.js",
  "/dist/assets/chunk-DGZ6DAKG.js",
  "/dist/assets/chunk-LVAO2G4G.js",
  "/dist/assets/chunk-B76LVDHI.js",
  "/dist/assets/chunk-ADTDBMWL.js",
  "/dist/assets/chunk-JASUXFAB.js",
  "/dist/assets/chunk-TJCG7O4I.js",
  "/dist/assets/chunk-AOBV4U4T.js",
  "/dist/assets/chunk-YXKJLXTY.js"
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
