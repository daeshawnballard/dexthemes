const PRECACHE = "dexthemes-precache-bfb83034ea";
const RUNTIME = "dexthemes-runtime-bfb83034ea";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-TVNQYFB7.js",
  "/dist/assets/boot-347dd90021.js",
  "/dist/assets/styles-481ba57e54.css",
  "/dist/assets/dexthemes-bundle-658c212a53.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-JAQMWLWB.js",
  "/dist/assets/chunk-GBRRICY5.js",
  "/dist/assets/chunk-44SA4D7G.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-NQATM7JJ.js",
  "/dist/assets/chunk-RZL5FBII.js",
  "/dist/assets/chunk-OYDNBRAK.js",
  "/dist/assets/chunk-TZET2QWK.js",
  "/dist/assets/chunk-OCGB6SBB.js",
  "/dist/assets/chunk-JGSHHFUV.js",
  "/dist/assets/chunk-LID6DDAI.js",
  "/dist/assets/chunk-F542U5HA.js",
  "/dist/assets/chunk-GZS36DQ3.js",
  "/dist/assets/chunk-D6L4RYLX.js",
  "/dist/assets/chunk-GRNAVTG2.js",
  "/dist/assets/chunk-Z2UGBB42.js",
  "/dist/assets/chunk-CO5XZWVY.js",
  "/dist/assets/chunk-VRYYHLGC.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-J326VLIE.js",
  "/dist/assets/chunk-X4X7SGOC.js",
  "/dist/assets/chunk-6MUSXD7U.js",
  "/dist/assets/chunk-GUJZOQDV.js",
  "/dist/assets/chunk-TA3P6H63.js",
  "/dist/assets/chunk-PEOPRTSY.js",
  "/dist/assets/chunk-23B752LU.js",
  "/dist/assets/chunk-WTHHT6UA.js",
  "/dist/assets/chunk-DD3GW26B.js",
  "/dist/assets/chunk-6TQJNGXV.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-ARAV4RP7.js",
  "/dist/assets/chunk-LSBYGSDG.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-6LEBZDHZ.js",
  "/dist/assets/chunk-SURQICXM.js",
  "/dist/assets/chunk-S3GIXPHT.js",
  "/dist/assets/chunk-GXJ5HZSD.js",
  "/dist/assets/chunk-P7RNWLP7.js",
  "/dist/assets/chunk-TXBE2HBW.js",
  "/dist/assets/chunk-VOVL5QEL.js",
  "/dist/assets/chunk-KRVV2XDC.js",
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
