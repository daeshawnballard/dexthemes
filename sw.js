const PRECACHE = "dexthemes-precache-c708adb131";
const RUNTIME = "dexthemes-runtime-c708adb131";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-LZZZOJZN.js",
  "/dist/assets/boot-90ebee972b.js",
  "/dist/assets/styles-7ac2a4ee66.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-UHBJI3G5.js",
  "/dist/assets/chunk-LAIH5Q4W.js",
  "/dist/assets/chunk-H4PTJD7S.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-377ZDZCR.js",
  "/dist/assets/chunk-67R6QESF.js",
  "/dist/assets/chunk-QM345JVA.js",
  "/dist/assets/chunk-LABREABQ.js",
  "/dist/assets/chunk-PHT3HL75.js",
  "/dist/assets/chunk-UFYX4CEC.js",
  "/dist/assets/chunk-IYJILPM2.js",
  "/dist/assets/chunk-35HKWOSP.js",
  "/dist/assets/chunk-FQZ5JPYS.js",
  "/dist/assets/chunk-P2PPWQSA.js",
  "/dist/assets/chunk-3CG4T3H6.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-URL7AFU3.js",
  "/dist/assets/chunk-TZBZSVH6.js",
  "/dist/assets/chunk-IG4YXWXR.js",
  "/dist/assets/chunk-7LFZBLQ6.js",
  "/dist/assets/chunk-UXLAZ5NL.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-W4ZLC25P.js",
  "/dist/assets/chunk-5Q3F6UVT.js",
  "/dist/assets/chunk-2JOZJNW6.js",
  "/dist/assets/chunk-QG4ZFIOC.js",
  "/dist/assets/chunk-AAU4MZDU.js",
  "/dist/assets/chunk-ZS6XYN22.js",
  "/dist/assets/chunk-ZKCFI6ZK.js",
  "/dist/assets/chunk-SK3RTGBD.js",
  "/dist/assets/chunk-BEVKCVD6.js",
  "/dist/assets/chunk-2HAAOOIZ.js",
  "/dist/assets/chunk-2BPMZFRX.js",
  "/dist/assets/chunk-FQQKONFK.js",
  "/dist/assets/chunk-2U6DAEFZ.js",
  "/dist/assets/chunk-TEWE3VRX.js",
  "/dist/assets/chunk-PIHXNFJ5.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-62VSM3BB.js",
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
