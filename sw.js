const PRECACHE = "dexthemes-precache-94124697f8";
const RUNTIME = "dexthemes-runtime-94124697f8";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-L6ODXKGJ.js",
  "/dist/assets/boot-c03f368ded.js",
  "/dist/assets/styles-d4bea83654.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-D4NIPAGA.js",
  "/dist/assets/chunk-V3NVBVBS.js",
  "/dist/assets/chunk-TUCPQO4Z.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-RB2CCPZN.js",
  "/dist/assets/chunk-UZXGMUYG.js",
  "/dist/assets/chunk-HAI7OV6E.js",
  "/dist/assets/chunk-W2I4QJXZ.js",
  "/dist/assets/chunk-4E24PHJ6.js",
  "/dist/assets/chunk-R7T7PWUD.js",
  "/dist/assets/chunk-SIV3NFGH.js",
  "/dist/assets/chunk-BGIZ2EFC.js",
  "/dist/assets/chunk-TVVGC4IC.js",
  "/dist/assets/chunk-KLF3H3M5.js",
  "/dist/assets/chunk-5Q7QUHHX.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-ZHQXB7MR.js",
  "/dist/assets/chunk-A6APFMHQ.js",
  "/dist/assets/chunk-SIO3YERE.js",
  "/dist/assets/chunk-2R5XBSMU.js",
  "/dist/assets/chunk-6QBY27TW.js",
  "/dist/assets/chunk-DXF5ZFQI.js",
  "/dist/assets/chunk-TJQ6QNO6.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-K2DJY5KL.js",
  "/dist/assets/chunk-LBD3TVBI.js",
  "/dist/assets/chunk-Y3NCWSIJ.js",
  "/dist/assets/chunk-FE6TR75W.js",
  "/dist/assets/chunk-PJOMH26Q.js",
  "/dist/assets/chunk-2BIUIJTF.js",
  "/dist/assets/chunk-23Q6E3O2.js",
  "/dist/assets/chunk-DRYKVBGY.js",
  "/dist/assets/chunk-UWP64EOI.js",
  "/dist/assets/chunk-IV5ZHINM.js",
  "/dist/assets/chunk-FEG2S6SD.js",
  "/dist/assets/chunk-7TFRTY23.js",
  "/dist/assets/chunk-5GGBQ246.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-CWTV6V4B.js",
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
