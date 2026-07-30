const PRECACHE = "dexthemes-precache-8ea60a5c93";
const RUNTIME = "dexthemes-runtime-8ea60a5c93";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-G6JKCV4E.js",
  "/dist/assets/boot-364c02506f.js",
  "/dist/assets/styles-4189b4df95.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-V5223WKP.js",
  "/dist/assets/chunk-7VCUQ4XD.js",
  "/dist/assets/chunk-UVHI4NUQ.js",
  "/dist/assets/chunk-DWNCY6CI.js",
  "/dist/assets/chunk-PTNFBKFH.js",
  "/dist/assets/chunk-QU5YKMAT.js",
  "/dist/assets/chunk-GEC2O3EN.js",
  "/dist/assets/chunk-VPIZTV5K.js",
  "/dist/assets/chunk-XSE3NZGK.js",
  "/dist/assets/chunk-BWUG6WTF.js",
  "/dist/assets/chunk-AQMPDTYK.js",
  "/dist/assets/chunk-KCTTV2M3.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-TA5LM2SG.js",
  "/dist/assets/chunk-G2G6IE75.js",
  "/dist/assets/chunk-2YVX7MBL.js",
  "/dist/assets/chunk-JZPB5IIF.js",
  "/dist/assets/chunk-ZXBKI7CP.js",
  "/dist/assets/chunk-7J5SGFRY.js",
  "/dist/assets/chunk-ZKFJADA5.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-KJPFLDAD.js",
  "/dist/assets/chunk-M4RX7C6O.js",
  "/dist/assets/chunk-HHHNC7FL.js",
  "/dist/assets/chunk-H4D327EZ.js",
  "/dist/assets/chunk-WRN55PN4.js",
  "/dist/assets/chunk-EIUA2L75.js",
  "/dist/assets/chunk-BUFMGI3J.js",
  "/dist/assets/chunk-PT5NFLTC.js",
  "/dist/assets/chunk-QXGRO26I.js",
  "/dist/assets/chunk-LWF4J6BW.js",
  "/dist/assets/chunk-644UX3MV.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-BLWNGZIB.js"
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
