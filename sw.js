const PRECACHE = "dexthemes-precache-7ee1b96af9";
const RUNTIME = "dexthemes-runtime-7ee1b96af9";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-MQRAUQGN.js",
  "/dist/assets/boot-2c14729d9a.js",
  "/dist/assets/styles-2d4875b6a3.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-C4TWONGR.js",
  "/dist/assets/chunk-LLR6NLFD.js",
  "/dist/assets/chunk-QU4WR6DY.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-X2E6GDZM.js",
  "/dist/assets/chunk-FQSNO3BT.js",
  "/dist/assets/chunk-YAXUC73P.js",
  "/dist/assets/chunk-E2DK7RJ3.js",
  "/dist/assets/chunk-BE7MXWWR.js",
  "/dist/assets/chunk-KYT6HPZK.js",
  "/dist/assets/chunk-MWNCGXF3.js",
  "/dist/assets/chunk-MPH6WNK7.js",
  "/dist/assets/chunk-J6IGMWIS.js",
  "/dist/assets/chunk-NOV6GVQZ.js",
  "/dist/assets/chunk-KAH42J3L.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-FTG7GBDJ.js",
  "/dist/assets/chunk-42MIDS7H.js",
  "/dist/assets/chunk-LHPEX5R6.js",
  "/dist/assets/chunk-K3MGR4CB.js",
  "/dist/assets/chunk-IHJUS65H.js",
  "/dist/assets/chunk-77RLEOYC.js",
  "/dist/assets/chunk-DYAPYB4V.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-FX2M25FA.js",
  "/dist/assets/chunk-MAZCCAU5.js",
  "/dist/assets/chunk-I4ZJN32D.js",
  "/dist/assets/chunk-F5GDBZS4.js",
  "/dist/assets/chunk-JDAAPAHN.js",
  "/dist/assets/chunk-BSESN6DM.js",
  "/dist/assets/chunk-Q67LMH4T.js",
  "/dist/assets/chunk-HIU7NBAW.js",
  "/dist/assets/chunk-VP3MIZ2K.js",
  "/dist/assets/chunk-XXG6MS7T.js",
  "/dist/assets/chunk-K3OQLNAQ.js",
  "/dist/assets/chunk-ZN7C3PY6.js",
  "/dist/assets/chunk-CNOXAI5C.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-EHDRVHNH.js",
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
