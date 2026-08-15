const PRECACHE = "dexthemes-precache-eeb2c570f4";
const RUNTIME = "dexthemes-runtime-eeb2c570f4";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-IXNJBIHE.js",
  "/dist/assets/boot-8a3cbbd827.js",
  "/dist/assets/styles-7ac2a4ee66.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-7SLUDLVH.js",
  "/dist/assets/chunk-GJ4F7UFG.js",
  "/dist/assets/chunk-LBITFKLO.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-JO22YYZU.js",
  "/dist/assets/chunk-TBRXPLVC.js",
  "/dist/assets/chunk-KYTBA2J7.js",
  "/dist/assets/chunk-IE2LAMPI.js",
  "/dist/assets/chunk-2IPHQ7HI.js",
  "/dist/assets/chunk-MGWDWUNH.js",
  "/dist/assets/chunk-XTY2MS4B.js",
  "/dist/assets/chunk-QGQ2BQTA.js",
  "/dist/assets/chunk-C6CHPUYY.js",
  "/dist/assets/chunk-7ZEEU6N5.js",
  "/dist/assets/chunk-P2LZUFOE.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-5SWSMWTS.js",
  "/dist/assets/chunk-ZCQEIE7T.js",
  "/dist/assets/chunk-B4FS64KR.js",
  "/dist/assets/chunk-D4K26NHS.js",
  "/dist/assets/chunk-GUDD6KGO.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-T7OD3M4Z.js",
  "/dist/assets/chunk-5GZJ6YMC.js",
  "/dist/assets/chunk-2FVZ2PY6.js",
  "/dist/assets/chunk-PFX4Q7HR.js",
  "/dist/assets/chunk-D7TGABXN.js",
  "/dist/assets/chunk-MZEILCS3.js",
  "/dist/assets/chunk-XLA3IHXV.js",
  "/dist/assets/chunk-75NBFQD5.js",
  "/dist/assets/chunk-RA3P4MF2.js",
  "/dist/assets/chunk-LRR67WHO.js",
  "/dist/assets/chunk-5T6ZSARG.js",
  "/dist/assets/chunk-QCLXB5KL.js",
  "/dist/assets/chunk-NEYXVO3Y.js",
  "/dist/assets/chunk-7FCPKGGQ.js",
  "/dist/assets/chunk-HX3YPJP2.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-QCVRHHYQ.js",
  "/dist/assets/chunk-QYA4FBE6.js",
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
