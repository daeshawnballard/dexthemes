const PRECACHE = "dexthemes-precache-2966465a68";
const RUNTIME = "dexthemes-runtime-2966465a68";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-7YFFMOYK.js",
  "/dist/assets/boot-cc66ee7c76.js",
  "/dist/assets/styles-1753010a33.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-PJCRDBAT.js",
  "/dist/assets/chunk-D5EO57MV.js",
  "/dist/assets/chunk-HQMR7JOL.js",
  "/dist/assets/chunk-MLTC5EGQ.js",
  "/dist/assets/chunk-WXLJCGJC.js",
  "/dist/assets/chunk-APL6J3LH.js",
  "/dist/assets/chunk-6UBX7J53.js",
  "/dist/assets/chunk-VSYXTJH2.js",
  "/dist/assets/chunk-MX2O44NE.js",
  "/dist/assets/chunk-YEA4IBEH.js",
  "/dist/assets/chunk-BHTGZZU7.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-ZTBW7RDU.js",
  "/dist/assets/chunk-EOFVBL44.js",
  "/dist/assets/chunk-RF4ZOMTD.js",
  "/dist/assets/chunk-VSN62LZX.js",
  "/dist/assets/chunk-FID6KYAF.js",
  "/dist/assets/chunk-3FIVUZ6U.js",
  "/dist/assets/chunk-A3OWB732.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-YIMJY33S.js",
  "/dist/assets/chunk-DTVHXT3N.js",
  "/dist/assets/chunk-4CZZ45ET.js",
  "/dist/assets/chunk-CHSRPBPN.js",
  "/dist/assets/chunk-ZIW5HBFM.js",
  "/dist/assets/chunk-FXMHIBHF.js",
  "/dist/assets/chunk-LMPBU23A.js",
  "/dist/assets/chunk-ND5YPJ7B.js",
  "/dist/assets/chunk-6YCC726N.js",
  "/dist/assets/chunk-CC5GRIBC.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-RZHQSNXV.js"
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
