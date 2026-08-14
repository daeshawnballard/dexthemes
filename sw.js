const PRECACHE = "dexthemes-precache-42acd71840";
const RUNTIME = "dexthemes-runtime-42acd71840";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-ZLH7EBHA.js",
  "/dist/assets/boot-23e8e6350a.js",
  "/dist/assets/styles-9ab4fd0080.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-MVUT4S4B.js",
  "/dist/assets/chunk-WUDNXV3G.js",
  "/dist/assets/chunk-7KN4NENA.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-YYN7SWVQ.js",
  "/dist/assets/chunk-QWVVOV4A.js",
  "/dist/assets/chunk-SOA64WUT.js",
  "/dist/assets/chunk-FP3XVESI.js",
  "/dist/assets/chunk-MT3UIMGK.js",
  "/dist/assets/chunk-GF5ZYH33.js",
  "/dist/assets/chunk-JQ5SDPPN.js",
  "/dist/assets/chunk-VNXF2E3Q.js",
  "/dist/assets/chunk-Q4LILQ4Y.js",
  "/dist/assets/chunk-SBWP5FDE.js",
  "/dist/assets/chunk-7HKNEUL5.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-5SWSMWTS.js",
  "/dist/assets/chunk-PCZ7R6N6.js",
  "/dist/assets/chunk-SY3R4KIM.js",
  "/dist/assets/chunk-3TPY7ZFI.js",
  "/dist/assets/chunk-2POSTBBA.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-HW3O2LKX.js",
  "/dist/assets/chunk-MX5VLRFH.js",
  "/dist/assets/chunk-VASXMKMN.js",
  "/dist/assets/chunk-AOT3AWTN.js",
  "/dist/assets/chunk-ARQP2P33.js",
  "/dist/assets/chunk-AOCFWGWR.js",
  "/dist/assets/chunk-V6VFW2IL.js",
  "/dist/assets/chunk-MDBM3YXQ.js",
  "/dist/assets/chunk-RA3P4MF2.js",
  "/dist/assets/chunk-ZLMRZLXT.js",
  "/dist/assets/chunk-EFWZDWMD.js",
  "/dist/assets/chunk-GLUCJN3M.js",
  "/dist/assets/chunk-BBLP2M6U.js",
  "/dist/assets/chunk-MVBI7HRP.js",
  "/dist/assets/chunk-PM4GANHA.js",
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
