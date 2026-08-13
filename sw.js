const PRECACHE = "dexthemes-precache-ca5fd1da9e";
const RUNTIME = "dexthemes-runtime-ca5fd1da9e";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-H24655AY.js",
  "/dist/assets/boot-da0c550882.js",
  "/dist/assets/styles-b2d281f740.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-B277MN5V.js",
  "/dist/assets/chunk-U7J3TXDH.js",
  "/dist/assets/chunk-XB6FLC2U.js",
  "/dist/assets/chunk-DT2UAIJN.js",
  "/dist/assets/chunk-OJWA3LKB.js",
  "/dist/assets/chunk-P2E2KMK3.js",
  "/dist/assets/chunk-QHMY32IG.js",
  "/dist/assets/chunk-SBE4HX6R.js",
  "/dist/assets/chunk-CWDHC2DU.js",
  "/dist/assets/chunk-2SACZD2R.js",
  "/dist/assets/chunk-REVJAWY6.js",
  "/dist/assets/chunk-LVYBWGEF.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-3WEBGSDT.js",
  "/dist/assets/chunk-OUX5N3VQ.js",
  "/dist/assets/chunk-7GW7OKBW.js",
  "/dist/assets/chunk-N5IB2RZD.js",
  "/dist/assets/chunk-FN5MQNWP.js",
  "/dist/assets/chunk-ROMAK6UH.js",
  "/dist/assets/chunk-CTD6KCMR.js",
  "/dist/assets/chunk-ZHT5ZSWB.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-N7AS5YER.js",
  "/dist/assets/chunk-ESGBTEZ3.js",
  "/dist/assets/chunk-7CLDQ73K.js",
  "/dist/assets/chunk-WW6KNQJE.js",
  "/dist/assets/chunk-GLNS2XCE.js",
  "/dist/assets/chunk-IAJLY2IZ.js",
  "/dist/assets/chunk-PEETTCPN.js",
  "/dist/assets/chunk-MZXHRSKY.js",
  "/dist/assets/chunk-66KZTFF3.js",
  "/dist/assets/chunk-WXYCXF5J.js",
  "/dist/assets/chunk-OKM7NPTT.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-MCDLHE6A.js"
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
