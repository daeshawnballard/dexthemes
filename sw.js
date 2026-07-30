const PRECACHE = "dexthemes-precache-b22a0a20bb";
const RUNTIME = "dexthemes-runtime-b22a0a20bb";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-IVMPD6JB.js",
  "/dist/assets/boot-13f10441df.js",
  "/dist/assets/styles-0030ff1867.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-AFFMSVNO.js",
  "/dist/assets/chunk-NQ76EI3W.js",
  "/dist/assets/chunk-EYI2BDB4.js",
  "/dist/assets/chunk-LZPP6NGS.js",
  "/dist/assets/chunk-QYO7V2UO.js",
  "/dist/assets/chunk-6QX32EWY.js",
  "/dist/assets/chunk-YVQJE54T.js",
  "/dist/assets/chunk-MLQEOGZO.js",
  "/dist/assets/chunk-MH45TIM2.js",
  "/dist/assets/chunk-6F7QABXN.js",
  "/dist/assets/chunk-ZABZ3IEG.js",
  "/dist/assets/chunk-5NGOXT2W.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-TA5LM2SG.js",
  "/dist/assets/chunk-G2G6IE75.js",
  "/dist/assets/chunk-KJ46AY5U.js",
  "/dist/assets/chunk-LRCKAHOI.js",
  "/dist/assets/chunk-MMMPRKGL.js",
  "/dist/assets/chunk-DZYFNJNF.js",
  "/dist/assets/chunk-QNKLQPDU.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-COIQDN73.js",
  "/dist/assets/chunk-SBUBSPZY.js",
  "/dist/assets/chunk-T37K2IZZ.js",
  "/dist/assets/chunk-M7JYU5ZY.js",
  "/dist/assets/chunk-WRN55PN4.js",
  "/dist/assets/chunk-EIUA2L75.js",
  "/dist/assets/chunk-KBWN53US.js",
  "/dist/assets/chunk-WMW3FURK.js",
  "/dist/assets/chunk-3IV2RHBK.js",
  "/dist/assets/chunk-JMPOLSJ7.js",
  "/dist/assets/chunk-VBFMXBSF.js",
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
