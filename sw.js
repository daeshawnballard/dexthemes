const PRECACHE = "dexthemes-precache-2301a042d0";
const RUNTIME = "dexthemes-runtime-2301a042d0";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-MQAWG6KZ.js",
  "/dist/assets/boot-3d987e85e1.js",
  "/dist/assets/styles-1753010a33.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-ED45VLG6.js",
  "/dist/assets/chunk-DXHHOICJ.js",
  "/dist/assets/chunk-G2LJQVJB.js",
  "/dist/assets/chunk-32LR6KHV.js",
  "/dist/assets/chunk-2FYS7A7C.js",
  "/dist/assets/chunk-VBA7OI2X.js",
  "/dist/assets/chunk-4XXXIPOP.js",
  "/dist/assets/chunk-HO3H7LZU.js",
  "/dist/assets/chunk-BQTHW2E5.js",
  "/dist/assets/chunk-BHIXTYOP.js",
  "/dist/assets/chunk-THGR5SYW.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-KKHIOS2F.js",
  "/dist/assets/chunk-5QZUECL4.js",
  "/dist/assets/chunk-GWUBGMXE.js",
  "/dist/assets/chunk-NCCTQSVN.js",
  "/dist/assets/chunk-KY7VGO54.js",
  "/dist/assets/chunk-PZ3JGY26.js",
  "/dist/assets/chunk-EDVOHXVE.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-RXLAFW3X.js",
  "/dist/assets/chunk-ZY5WIGVO.js",
  "/dist/assets/chunk-HBLADEVG.js",
  "/dist/assets/chunk-Q5USYAEU.js",
  "/dist/assets/chunk-2YT6TWIS.js",
  "/dist/assets/chunk-V2NOXRX3.js",
  "/dist/assets/chunk-M7SOVG7E.js",
  "/dist/assets/chunk-OJ234RR6.js",
  "/dist/assets/chunk-EF2L5HC7.js",
  "/dist/assets/chunk-SMGYACL4.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-NPKAUCET.js"
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
