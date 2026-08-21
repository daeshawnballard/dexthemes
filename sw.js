const PRECACHE = "dexthemes-precache-50cdfd85c5";
const RUNTIME = "dexthemes-runtime-50cdfd85c5";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-7I6JKEJK.js",
  "/dist/assets/chunk-SQE76S5B.js",
  "/dist/assets/chunk-5P4PW3KW.js",
  "/dist/assets/chunk-OTI6NZOV.js",
  "/dist/assets/chunk-XWUBJ25R.js",
  "/dist/assets/chunk-U72D3AQK.js",
  "/dist/assets/chunk-574VS3PO.js",
  "/dist/assets/chunk-STVKRBRR.js",
  "/dist/assets/chunk-YVOPHD2L.js",
  "/dist/assets/chunk-RG7D4OHQ.js",
  "/dist/assets/chunk-7A5WM7EC.js",
  "/dist/assets/chunk-VCKB3KWC.js",
  "/dist/assets/chunk-L264JI4S.js",
  "/dist/assets/chunk-2U62AEL5.js",
  "/dist/assets/chunk-A2KQFSJK.js",
  "/dist/assets/chunk-CAXGCPWL.js",
  "/dist/assets/chunk-PCFKW6FN.js",
  "/dist/assets/chunk-A3KABIUX.js",
  "/dist/assets/chunk-FITSRO75.js",
  "/dist/assets/chunk-WGFGUJ3T.js",
  "/dist/assets/chunk-INOO3BEK.js",
  "/dist/assets/chunk-IE2SLDBZ.js",
  "/dist/assets/boot-ffa06f0f0c.js",
  "/dist/assets/styles-fe1f6abcfa.css",
  "/dist/assets/dexthemes-bundle-1dd1196729.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png"
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
