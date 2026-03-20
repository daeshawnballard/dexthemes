const PRECACHE = "dexthemes-precache-de20dd96fe";
const RUNTIME = "dexthemes-runtime-de20dd96fe";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-ZANCJHWE.js",
  "/dist/assets/boot-ab1e255923.js",
  "/dist/assets/styles-8221977bd4.css",
  "/dist/assets/dexthemes-bundle-d35397d275.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-QQYGB4VG.js",
  "/dist/assets/chunk-XYQDTIDV.js",
  "/dist/assets/chunk-7XC5SHTW.js",
  "/dist/assets/chunk-RMVNZGNX.js",
  "/dist/assets/chunk-4RQAT4UY.js",
  "/dist/assets/chunk-UJ6RJ54R.js",
  "/dist/assets/chunk-DR73PL6H.js",
  "/dist/assets/chunk-RS3VIF4N.js",
  "/dist/assets/chunk-I4X7JIDE.js",
  "/dist/assets/chunk-R4462PMU.js",
  "/dist/assets/chunk-IKSDIBGO.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-6B6UELWF.js",
  "/dist/assets/chunk-V5VZIOL7.js",
  "/dist/assets/chunk-2RJM2X23.js",
  "/dist/assets/chunk-D6MNWVYN.js",
  "/dist/assets/chunk-CBP7E4DJ.js",
  "/dist/assets/chunk-HRWCWK2T.js",
  "/dist/assets/chunk-FFSO5GVQ.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-6V77VRP3.js",
  "/dist/assets/chunk-EJZCGLPZ.js",
  "/dist/assets/chunk-LFZHCGRS.js",
  "/dist/assets/chunk-DVWNZU3E.js",
  "/dist/assets/chunk-HTVQMZ37.js",
  "/dist/assets/chunk-ITEHFHDV.js",
  "/dist/assets/chunk-OS2463OS.js",
  "/dist/assets/chunk-CBTOG5S5.js",
  "/dist/assets/chunk-4XRQUBUE.js",
  "/dist/assets/chunk-RLG4TIWG.js",
  "/dist/assets/chunk-AOBV4U4T.js",
  "/dist/assets/chunk-HEY2YPIO.js"
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
