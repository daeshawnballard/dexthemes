const PRECACHE = "dexthemes-precache-c8e8979bcc";
const RUNTIME = "dexthemes-runtime-c8e8979bcc";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-MVW6GHWV.js",
  "/dist/assets/boot-23d50db22c.js",
  "/dist/assets/styles-be0ed13f52.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-SO6VSMAT.js",
  "/dist/assets/chunk-NODJPCCT.js",
  "/dist/assets/chunk-OHHNYFDP.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-SQEZ3X7M.js",
  "/dist/assets/chunk-HSSUPG7B.js",
  "/dist/assets/chunk-MFJVWW5Q.js",
  "/dist/assets/chunk-NKHGOTPR.js",
  "/dist/assets/chunk-BIMWY2UH.js",
  "/dist/assets/chunk-74D7SO3T.js",
  "/dist/assets/chunk-JSJPDMJP.js",
  "/dist/assets/chunk-NQDETPSP.js",
  "/dist/assets/chunk-LNIFSZIR.js",
  "/dist/assets/chunk-YJCHMBG2.js",
  "/dist/assets/chunk-7LHABXOR.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-FTG7GBDJ.js",
  "/dist/assets/chunk-42MIDS7H.js",
  "/dist/assets/chunk-LSIU6ET5.js",
  "/dist/assets/chunk-WMTHCNRD.js",
  "/dist/assets/chunk-AP2OCMUN.js",
  "/dist/assets/chunk-GR43MD2U.js",
  "/dist/assets/chunk-T663IAL7.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-THBKNI4T.js",
  "/dist/assets/chunk-BWJUX3JL.js",
  "/dist/assets/chunk-BOVIRIWQ.js",
  "/dist/assets/chunk-IWL5NUDS.js",
  "/dist/assets/chunk-5GS4T46Z.js",
  "/dist/assets/chunk-J5Y2SWRT.js",
  "/dist/assets/chunk-Q67LMH4T.js",
  "/dist/assets/chunk-HIU7NBAW.js",
  "/dist/assets/chunk-BCHXE6AY.js",
  "/dist/assets/chunk-VVO4XWYY.js",
  "/dist/assets/chunk-BABPL64I.js",
  "/dist/assets/chunk-3UHUFQLU.js",
  "/dist/assets/chunk-BZEP5SVT.js",
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
