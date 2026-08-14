const PRECACHE = "dexthemes-precache-e75c99f139";
const RUNTIME = "dexthemes-runtime-e75c99f139";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-DZAB3T5C.js",
  "/dist/assets/boot-876da8751a.js",
  "/dist/assets/styles-d4bea83654.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-T26CRS25.js",
  "/dist/assets/chunk-UQJAJNVU.js",
  "/dist/assets/chunk-NEXC3KQA.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-FQ7K27HM.js",
  "/dist/assets/chunk-MX4FCOXT.js",
  "/dist/assets/chunk-R7TTUO5O.js",
  "/dist/assets/chunk-GATSFT2P.js",
  "/dist/assets/chunk-ABUW2RCJ.js",
  "/dist/assets/chunk-RS563T5X.js",
  "/dist/assets/chunk-43ZJEW56.js",
  "/dist/assets/chunk-YTTR6FCT.js",
  "/dist/assets/chunk-KU34A67X.js",
  "/dist/assets/chunk-ZLLNSA2C.js",
  "/dist/assets/chunk-IPTXC54W.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-ZHQXB7MR.js",
  "/dist/assets/chunk-A6APFMHQ.js",
  "/dist/assets/chunk-XWYPD7DA.js",
  "/dist/assets/chunk-DBXQCBYP.js",
  "/dist/assets/chunk-HBXBTIV2.js",
  "/dist/assets/chunk-YULRPHQ7.js",
  "/dist/assets/chunk-MZOOJEZ3.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-H7GXI5U2.js",
  "/dist/assets/chunk-LWKVWL5Y.js",
  "/dist/assets/chunk-FOJCMMNR.js",
  "/dist/assets/chunk-BXTZIYKI.js",
  "/dist/assets/chunk-VF2EHRZN.js",
  "/dist/assets/chunk-6XHIFSOD.js",
  "/dist/assets/chunk-23Q6E3O2.js",
  "/dist/assets/chunk-DRYKVBGY.js",
  "/dist/assets/chunk-ETGZKZMW.js",
  "/dist/assets/chunk-4NT75P7M.js",
  "/dist/assets/chunk-UQDZGTKJ.js",
  "/dist/assets/chunk-UURHN2YI.js",
  "/dist/assets/chunk-34AVRRDX.js",
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
