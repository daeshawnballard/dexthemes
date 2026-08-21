const PRECACHE = "dexthemes-precache-26395d3075";
const RUNTIME = "dexthemes-runtime-26395d3075";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-NDNGMWAJ.js",
  "/dist/assets/boot-ff838a7ab8.js",
  "/dist/assets/styles-7ac2a4ee66.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-KZZR3POY.js",
  "/dist/assets/chunk-POATNCKJ.js",
  "/dist/assets/chunk-PG6JTCIR.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-DAMA4AAS.js",
  "/dist/assets/chunk-RFJ2IMAQ.js",
  "/dist/assets/chunk-2U7ESKOU.js",
  "/dist/assets/chunk-SFSSJBHP.js",
  "/dist/assets/chunk-J5X5HAQW.js",
  "/dist/assets/chunk-HP7OPPCW.js",
  "/dist/assets/chunk-I5YIMB5Z.js",
  "/dist/assets/chunk-TS6D6AFW.js",
  "/dist/assets/chunk-5MMQXOII.js",
  "/dist/assets/chunk-RR55SYVA.js",
  "/dist/assets/chunk-H3MFZIR3.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-URL7AFU3.js",
  "/dist/assets/chunk-RLWAGWUP.js",
  "/dist/assets/chunk-GK2CFEIM.js",
  "/dist/assets/chunk-Z7D746NE.js",
  "/dist/assets/chunk-ZTS2TLFY.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-WEFQ5REV.js",
  "/dist/assets/chunk-NKATMJ37.js",
  "/dist/assets/chunk-T7BJR4JZ.js",
  "/dist/assets/chunk-CEFT4ZRB.js",
  "/dist/assets/chunk-4M2Q76VU.js",
  "/dist/assets/chunk-HAX7JGSA.js",
  "/dist/assets/chunk-ZJGBIERQ.js",
  "/dist/assets/chunk-UZ4TEJTX.js",
  "/dist/assets/chunk-BEVKCVD6.js",
  "/dist/assets/chunk-VI4CGKGN.js",
  "/dist/assets/chunk-OSYQO5GX.js",
  "/dist/assets/chunk-XYY6CNMZ.js",
  "/dist/assets/chunk-NSNSXBUK.js",
  "/dist/assets/chunk-SJPPR6BD.js",
  "/dist/assets/chunk-HMXPXHY5.js",
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
