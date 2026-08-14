const PRECACHE = "dexthemes-precache-74980a3244";
const RUNTIME = "dexthemes-runtime-74980a3244";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-7IAORHFL.js",
  "/dist/assets/boot-c3a1e2efaa.js",
  "/dist/assets/styles-d1fc0da29b.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-VZU2JE5Q.js",
  "/dist/assets/chunk-OY3QC4UV.js",
  "/dist/assets/chunk-QQWCT27R.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-3HEI74FC.js",
  "/dist/assets/chunk-JL2GPHXY.js",
  "/dist/assets/chunk-7IXUUWGV.js",
  "/dist/assets/chunk-IJDII2QQ.js",
  "/dist/assets/chunk-SYUVMXRC.js",
  "/dist/assets/chunk-R5RL3DX3.js",
  "/dist/assets/chunk-V6UE33P4.js",
  "/dist/assets/chunk-JFIPWGGV.js",
  "/dist/assets/chunk-7HRAWYGK.js",
  "/dist/assets/chunk-53BYYHRL.js",
  "/dist/assets/chunk-Q6XVUZ35.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-5SWSMWTS.js",
  "/dist/assets/chunk-ZCQEIE7T.js",
  "/dist/assets/chunk-I64BV22E.js",
  "/dist/assets/chunk-PVGB6UTP.js",
  "/dist/assets/chunk-72RFTG2O.js",
  "/dist/assets/chunk-KLSMITYU.js",
  "/dist/assets/chunk-RDNBHIIP.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-V2OBZ7ZX.js",
  "/dist/assets/chunk-AD5RQNYC.js",
  "/dist/assets/chunk-JCX5OJWX.js",
  "/dist/assets/chunk-JEPT42R6.js",
  "/dist/assets/chunk-WL2J3B25.js",
  "/dist/assets/chunk-B7LLQH25.js",
  "/dist/assets/chunk-RA3P4MF2.js",
  "/dist/assets/chunk-LRR67WHO.js",
  "/dist/assets/chunk-LCM7NGNF.js",
  "/dist/assets/chunk-XW42K5IR.js",
  "/dist/assets/chunk-QT3LPOWM.js",
  "/dist/assets/chunk-SBFXYTLL.js",
  "/dist/assets/chunk-4ZX45YYR.js",
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
