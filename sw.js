const PRECACHE = "dexthemes-precache-a5b26553ea";
const RUNTIME = "dexthemes-runtime-a5b26553ea";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-PNPX2C2W.js",
  "/dist/assets/boot-c8c3c5b37d.js",
  "/dist/assets/styles-8221977bd4.css",
  "/dist/assets/dexthemes-bundle-90cc295778.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-K5HWLPBB.js",
  "/dist/assets/chunk-XDE7AIT4.js",
  "/dist/assets/chunk-BTHRWGOF.js",
  "/dist/assets/chunk-LBKQMHJH.js",
  "/dist/assets/chunk-HFZSBTUM.js",
  "/dist/assets/chunk-YCAL4OPT.js",
  "/dist/assets/chunk-6GTZEZFD.js",
  "/dist/assets/chunk-T7W7LZVP.js",
  "/dist/assets/chunk-73JTDHLM.js",
  "/dist/assets/chunk-APZJ44OP.js",
  "/dist/assets/chunk-UJGAJYZN.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-EWUESAX4.js",
  "/dist/assets/chunk-CQ4V5VYE.js",
  "/dist/assets/chunk-2Y2KAAYI.js",
  "/dist/assets/chunk-NWBM563C.js",
  "/dist/assets/chunk-AWLSLXGE.js",
  "/dist/assets/chunk-6JHY5BSE.js",
  "/dist/assets/chunk-2HSXZWCW.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-JVZIFVAZ.js",
  "/dist/assets/chunk-KAVRCF75.js",
  "/dist/assets/chunk-WECBCKTE.js",
  "/dist/assets/chunk-XD7DXSEB.js",
  "/dist/assets/chunk-USUVRG6K.js",
  "/dist/assets/chunk-TS637KRY.js",
  "/dist/assets/chunk-7ECDJUNX.js",
  "/dist/assets/chunk-P3NCWXW3.js",
  "/dist/assets/chunk-F66MZIH4.js",
  "/dist/assets/chunk-KXDUXA6J.js",
  "/dist/assets/chunk-AOBV4U4T.js",
  "/dist/assets/chunk-66J5EZUS.js"
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
