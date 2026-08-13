const PRECACHE = "dexthemes-precache-3dd29b14b7";
const RUNTIME = "dexthemes-runtime-3dd29b14b7";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-UWD2RRMG.js",
  "/dist/assets/boot-95aaddae25.js",
  "/dist/assets/styles-d4bea83654.css",
  "/dist/assets/dexthemes-bundle-4df8d99528.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-BZYWSXFT.js",
  "/dist/assets/chunk-O52XD6V6.js",
  "/dist/assets/chunk-ISNROOVS.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-JHAIDIA7.js",
  "/dist/assets/chunk-2GJCVPGW.js",
  "/dist/assets/chunk-YVOOVCU4.js",
  "/dist/assets/chunk-UKHSLUMH.js",
  "/dist/assets/chunk-QQTWP5ZM.js",
  "/dist/assets/chunk-LLXN4JYN.js",
  "/dist/assets/chunk-LL5WSWKB.js",
  "/dist/assets/chunk-HEHOGRNP.js",
  "/dist/assets/chunk-OTYOL4F3.js",
  "/dist/assets/chunk-L74GM5PK.js",
  "/dist/assets/chunk-7RGJ4FJX.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-2KWA5MKO.js",
  "/dist/assets/chunk-A6APFMHQ.js",
  "/dist/assets/chunk-S4FFOL2B.js",
  "/dist/assets/chunk-MZR4RYTC.js",
  "/dist/assets/chunk-UJTQYA7I.js",
  "/dist/assets/chunk-PXQP3JXV.js",
  "/dist/assets/chunk-XPUO6G25.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-N22JG4I7.js",
  "/dist/assets/chunk-4NTXMWR3.js",
  "/dist/assets/chunk-LOO4ZJUN.js",
  "/dist/assets/chunk-HF6ELGDM.js",
  "/dist/assets/chunk-RWCDOZ4E.js",
  "/dist/assets/chunk-ICLXR7N2.js",
  "/dist/assets/chunk-VAHNGAQA.js",
  "/dist/assets/chunk-DRYKVBGY.js",
  "/dist/assets/chunk-UBGP43ZH.js",
  "/dist/assets/chunk-FLGCTXBO.js",
  "/dist/assets/chunk-FGUIG2CI.js",
  "/dist/assets/chunk-HAFNOVHA.js",
  "/dist/assets/chunk-7ERSFDTO.js",
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
