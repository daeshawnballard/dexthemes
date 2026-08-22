const PRECACHE = "dexthemes-precache-77130ccad8";
const RUNTIME = "dexthemes-runtime-77130ccad8";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-6EN6DWJN.js",
  "/dist/assets/boot-2653d2a3ca.js",
  "/dist/assets/styles-481ba57e54.css",
  "/dist/assets/dexthemes-bundle-658c212a53.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-WCSEUHN3.js",
  "/dist/assets/chunk-MAIO65Y4.js",
  "/dist/assets/chunk-NJRWAG4Y.js",
  "/dist/assets/chunk-5Z3CG6LO.js",
  "/dist/assets/chunk-OIVLKFBB.js",
  "/dist/assets/chunk-R2R2ORC3.js",
  "/dist/assets/chunk-AEFYRXUF.js",
  "/dist/assets/chunk-KFQZ5JB5.js",
  "/dist/assets/chunk-T7MOS2YX.js",
  "/dist/assets/chunk-LBZ7IX4I.js",
  "/dist/assets/chunk-SCISPIH4.js",
  "/dist/assets/chunk-H327LBUQ.js",
  "/dist/assets/chunk-YYBE6ZX5.js",
  "/dist/assets/chunk-QGHNLAUN.js",
  "/dist/assets/chunk-AO5ULPLC.js",
  "/dist/assets/chunk-7IAYGSCQ.js",
  "/dist/assets/chunk-WTJVQB5X.js",
  "/dist/assets/chunk-6QOLFY74.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-A5FQZXCL.js",
  "/dist/assets/chunk-IGFI7YFL.js",
  "/dist/assets/chunk-RCPCIRID.js",
  "/dist/assets/chunk-KZU7NGOI.js",
  "/dist/assets/chunk-COD36BDC.js",
  "/dist/assets/chunk-3CURKPI3.js",
  "/dist/assets/chunk-MZOGK6FW.js",
  "/dist/assets/chunk-G6GA423Z.js",
  "/dist/assets/chunk-234HJON3.js",
  "/dist/assets/chunk-F7ILI3IY.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-64OYK7RI.js",
  "/dist/assets/chunk-BKEJTJ4C.js",
  "/dist/assets/chunk-7VQOZ5TE.js",
  "/dist/assets/chunk-MS67ZUIF.js",
  "/dist/assets/chunk-BFZUAAHU.js",
  "/dist/assets/chunk-K4BFECLO.js",
  "/dist/assets/chunk-BCRJ5SIW.js",
  "/dist/assets/chunk-36PR5UIP.js",
  "/dist/assets/chunk-VHE5HGH2.js",
  "/dist/assets/chunk-N22YZ36P.js",
  "/dist/assets/chunk-B3ELF44M.js",
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
