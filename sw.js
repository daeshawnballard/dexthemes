const PRECACHE = "dexthemes-precache-d84ff0158c";
const RUNTIME = "dexthemes-runtime-d84ff0158c";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-UHH54UWA.js",
  "/dist/assets/boot-dc96ca9fcf.js",
  "/dist/assets/styles-5a67b5efd5.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-T6KN5GSI.js",
  "/dist/assets/chunk-RC5YMV2X.js",
  "/dist/assets/chunk-FYKBYVUZ.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-ADWL3A3F.js",
  "/dist/assets/chunk-LFPT226I.js",
  "/dist/assets/chunk-N3OANJ3S.js",
  "/dist/assets/chunk-INVBP25V.js",
  "/dist/assets/chunk-6WZMWULG.js",
  "/dist/assets/chunk-CIM22562.js",
  "/dist/assets/chunk-DQJFTR5M.js",
  "/dist/assets/chunk-NXDTLYE5.js",
  "/dist/assets/chunk-4YI766JY.js",
  "/dist/assets/chunk-I6GTBYPB.js",
  "/dist/assets/chunk-FDRFBEJ6.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-I7FGNG4W.js",
  "/dist/assets/chunk-42MIDS7H.js",
  "/dist/assets/chunk-7VRJHWPT.js",
  "/dist/assets/chunk-OYVGPP3W.js",
  "/dist/assets/chunk-4BLP7WR2.js",
  "/dist/assets/chunk-F2SLO2SS.js",
  "/dist/assets/chunk-XJB77OA3.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-45INFOF6.js",
  "/dist/assets/chunk-BTVDHAEG.js",
  "/dist/assets/chunk-6QISP4C4.js",
  "/dist/assets/chunk-PDJMTS74.js",
  "/dist/assets/chunk-TEVIX4LJ.js",
  "/dist/assets/chunk-V2LJLTBY.js",
  "/dist/assets/chunk-52MJYJ7U.js",
  "/dist/assets/chunk-HIU7NBAW.js",
  "/dist/assets/chunk-MWFATR4C.js",
  "/dist/assets/chunk-U4OLQFTQ.js",
  "/dist/assets/chunk-A6L2ST76.js",
  "/dist/assets/chunk-OMFZW5KD.js",
  "/dist/assets/chunk-ST3CNGJL.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-EHDRVHNH.js",
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
