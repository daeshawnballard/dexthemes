const PRECACHE = "dexthemes-precache-49d529919c";
const RUNTIME = "dexthemes-runtime-49d529919c";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-56ZDBUDF.js",
  "/dist/assets/boot-72db0d35da.js",
  "/dist/assets/styles-7ac2a4ee66.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-W27L35I7.js",
  "/dist/assets/chunk-VYDTHPRF.js",
  "/dist/assets/chunk-VMPIKQYG.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-N6PPXGPC.js",
  "/dist/assets/chunk-LWPKY5NK.js",
  "/dist/assets/chunk-FYKFNIZX.js",
  "/dist/assets/chunk-GMWSP377.js",
  "/dist/assets/chunk-GKDTFUVE.js",
  "/dist/assets/chunk-AR3HLRR7.js",
  "/dist/assets/chunk-DN6VKJFE.js",
  "/dist/assets/chunk-VPVIJMGW.js",
  "/dist/assets/chunk-3XTMWNJF.js",
  "/dist/assets/chunk-GYF6EBLH.js",
  "/dist/assets/chunk-VOZMV5J5.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-7EWZB6U2.js",
  "/dist/assets/chunk-PCWIVYIK.js",
  "/dist/assets/chunk-J3N5OZQP.js",
  "/dist/assets/chunk-ON2M4XGN.js",
  "/dist/assets/chunk-C44PMKP6.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-PQ2KPCRH.js",
  "/dist/assets/chunk-BAKQRZGS.js",
  "/dist/assets/chunk-FKLDSQ5E.js",
  "/dist/assets/chunk-DO36YTBU.js",
  "/dist/assets/chunk-CROVJQYL.js",
  "/dist/assets/chunk-3VRUBRWJ.js",
  "/dist/assets/chunk-3JQIBCLP.js",
  "/dist/assets/chunk-AZ5HU2OU.js",
  "/dist/assets/chunk-QHPUILMI.js",
  "/dist/assets/chunk-O54F6GRW.js",
  "/dist/assets/chunk-L7N6YYKW.js",
  "/dist/assets/chunk-SKUMUCMB.js",
  "/dist/assets/chunk-UAUGMTSB.js",
  "/dist/assets/chunk-XISILCEO.js",
  "/dist/assets/chunk-7P4QKR35.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-WWUPIA2V.js",
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
