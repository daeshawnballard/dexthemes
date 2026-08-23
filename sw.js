const PRECACHE = "dexthemes-precache-74ed67ffec";
const RUNTIME = "dexthemes-runtime-74ed67ffec";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-2S7BVQXX.js",
  "/dist/assets/boot-ed96fad7fa.js",
  "/dist/assets/styles-481ba57e54.css",
  "/dist/assets/dexthemes-bundle-658c212a53.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-R537MJLA.js",
  "/dist/assets/chunk-JICKEBTG.js",
  "/dist/assets/chunk-4UCKTPUV.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-3ZIAXEC7.js",
  "/dist/assets/chunk-NQ6QQ7X6.js",
  "/dist/assets/chunk-3OJ6YHSK.js",
  "/dist/assets/chunk-LFPZ55DH.js",
  "/dist/assets/chunk-4PBH4OEX.js",
  "/dist/assets/chunk-7CGCHPZT.js",
  "/dist/assets/chunk-IHMFHRLB.js",
  "/dist/assets/chunk-JYRTDFEG.js",
  "/dist/assets/chunk-5CIKOO6A.js",
  "/dist/assets/chunk-PHEERBYT.js",
  "/dist/assets/chunk-T2UJAQQG.js",
  "/dist/assets/chunk-Z54H6SPV.js",
  "/dist/assets/chunk-QKINAFVH.js",
  "/dist/assets/chunk-2VO7UJXO.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-OTJO7OWE.js",
  "/dist/assets/chunk-GHB3XTPD.js",
  "/dist/assets/chunk-HUXBU6HF.js",
  "/dist/assets/chunk-5EKQGNG4.js",
  "/dist/assets/chunk-SISL47T2.js",
  "/dist/assets/chunk-43YQAL6S.js",
  "/dist/assets/chunk-ITHWYSOF.js",
  "/dist/assets/chunk-6DIMAYHY.js",
  "/dist/assets/chunk-YN7YGZDF.js",
  "/dist/assets/chunk-X35CXQP7.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-EU2XPYDF.js",
  "/dist/assets/chunk-YMRSI5K6.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-D7NDCABX.js",
  "/dist/assets/chunk-DDMETPJH.js",
  "/dist/assets/chunk-2XIJJ5CN.js",
  "/dist/assets/chunk-KMV6D6RJ.js",
  "/dist/assets/chunk-HDCIRJAD.js",
  "/dist/assets/chunk-VNMRDL3Z.js",
  "/dist/assets/chunk-TWZ4NT2S.js",
  "/dist/assets/chunk-P2ZS6PKH.js",
  "/dist/assets/chunk-TRTQSARU.js"
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
