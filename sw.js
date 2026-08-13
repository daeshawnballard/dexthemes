const PRECACHE = "dexthemes-precache-2ddc8e0b45";
const RUNTIME = "dexthemes-runtime-2ddc8e0b45";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-RYVPJJBT.js",
  "/dist/assets/boot-ab49ed3e68.js",
  "/dist/assets/styles-57081005f5.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-EYC35QFU.js",
  "/dist/assets/chunk-WJSUZXKM.js",
  "/dist/assets/chunk-GS34YNVP.js",
  "/dist/assets/chunk-UXWJHGHJ.js",
  "/dist/assets/chunk-Y4LM4APZ.js",
  "/dist/assets/chunk-BDBED5Y3.js",
  "/dist/assets/chunk-MHBQUBZF.js",
  "/dist/assets/chunk-E32GKDV4.js",
  "/dist/assets/chunk-UTSITW5N.js",
  "/dist/assets/chunk-I3A2BM6U.js",
  "/dist/assets/chunk-OBTDNPN3.js",
  "/dist/assets/chunk-T7XS2XHR.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-TA5LM2SG.js",
  "/dist/assets/chunk-G2G6IE75.js",
  "/dist/assets/chunk-LZ5V7WUG.js",
  "/dist/assets/chunk-WIZZNRC6.js",
  "/dist/assets/chunk-KOC6VQC3.js",
  "/dist/assets/chunk-EEZQGIVB.js",
  "/dist/assets/chunk-I6SUPBIA.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-C6GS4AWQ.js",
  "/dist/assets/chunk-45SRREDL.js",
  "/dist/assets/chunk-OLCSGFEQ.js",
  "/dist/assets/chunk-EJPWCN7W.js",
  "/dist/assets/chunk-WRN55PN4.js",
  "/dist/assets/chunk-EIUA2L75.js",
  "/dist/assets/chunk-3PM2BHC6.js",
  "/dist/assets/chunk-4JLNOVYV.js",
  "/dist/assets/chunk-BIMC4MYA.js",
  "/dist/assets/chunk-NXH7E35X.js",
  "/dist/assets/chunk-PR62L66O.js",
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
