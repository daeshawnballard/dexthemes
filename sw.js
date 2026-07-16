const PRECACHE = "dexthemes-precache-0c8b2ec583";
const RUNTIME = "dexthemes-runtime-0c8b2ec583";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-UAY7JN4T.js",
  "/dist/assets/boot-b69bc07c8a.js",
  "/dist/assets/styles-8221977bd4.css",
  "/dist/assets/dexthemes-bundle-90cc295778.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-VG4ZD674.js",
  "/dist/assets/chunk-SPG6LXVR.js",
  "/dist/assets/chunk-S5BZE6HT.js",
  "/dist/assets/chunk-FNDHVBFW.js",
  "/dist/assets/chunk-6KFV6HD6.js",
  "/dist/assets/chunk-3ZZW7TCO.js",
  "/dist/assets/chunk-4O3VFB62.js",
  "/dist/assets/chunk-PVMUXEDV.js",
  "/dist/assets/chunk-MEQTL55V.js",
  "/dist/assets/chunk-6ZJJCUK3.js",
  "/dist/assets/chunk-DMRVCF6I.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-26RYUZGI.js",
  "/dist/assets/chunk-UBLTJ5WP.js",
  "/dist/assets/chunk-BVMZ34EY.js",
  "/dist/assets/chunk-NRJROQ5R.js",
  "/dist/assets/chunk-4WAEMRNU.js",
  "/dist/assets/chunk-DRSA2IUV.js",
  "/dist/assets/chunk-ALTCEW2S.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-DLBZ3EIE.js",
  "/dist/assets/chunk-TBSRLBLQ.js",
  "/dist/assets/chunk-O3TSAXSQ.js",
  "/dist/assets/chunk-ELNXF37P.js",
  "/dist/assets/chunk-PCXSCMSQ.js",
  "/dist/assets/chunk-YFLTBVCJ.js",
  "/dist/assets/chunk-H6DDRUKA.js",
  "/dist/assets/chunk-NXPI7NWV.js",
  "/dist/assets/chunk-HVGIR5EN.js",
  "/dist/assets/chunk-LCRVDX23.js",
  "/dist/assets/chunk-AOBV4U4T.js",
  "/dist/assets/chunk-JG2H7AMB.js"
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
