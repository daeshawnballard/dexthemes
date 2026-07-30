const PRECACHE = "dexthemes-precache-347ef048d7";
const RUNTIME = "dexthemes-runtime-347ef048d7";
const PRECACHE_URLS = [
  "/",
  "/dist/assets/app-K6SJCHDH.js",
  "/dist/assets/boot-5887e6868e.js",
  "/dist/assets/styles-0d23fe0574.css",
  "/dist/assets/dexthemes-bundle-921a073d5d.js",
  "/manifest.json",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/dist/assets/chunk-THZH3IVF.js",
  "/dist/assets/chunk-JIR3BYQV.js",
  "/dist/assets/chunk-LJHJU7QN.js",
  "/dist/assets/chunk-UQVO7PFA.js",
  "/dist/assets/chunk-CEYSGGDX.js",
  "/dist/assets/chunk-M3VURQTD.js",
  "/dist/assets/chunk-CEEPBCRN.js",
  "/dist/assets/chunk-ARSSWDP3.js",
  "/dist/assets/chunk-NO5ZFXX3.js",
  "/dist/assets/chunk-66WA4BFZ.js",
  "/dist/assets/chunk-ODAHDPWJ.js",
  "/dist/assets/chunk-E7P52WR6.js",
  "/dist/assets/chunk-HGFREFNP.js",
  "/dist/assets/chunk-QZ2IXU5Z.js",
  "/dist/assets/chunk-GKSJZPCI.js",
  "/dist/assets/chunk-BLN4U6IW.js",
  "/dist/assets/chunk-6PS3SMTN.js",
  "/dist/assets/chunk-LZJ4JOUV.js",
  "/dist/assets/chunk-ITQVAP6E.js",
  "/dist/assets/chunk-7G6IZZN4.js",
  "/dist/assets/chunk-4Y5H5FGI.js",
  "/dist/assets/chunk-2KLNOKEB.js",
  "/dist/assets/chunk-WERYX2YA.js",
  "/dist/assets/chunk-FZGVRN7U.js",
  "/dist/assets/chunk-5T3AFA5R.js",
  "/dist/assets/chunk-E3WOS4LO.js",
  "/dist/assets/chunk-46DCJ3XK.js",
  "/dist/assets/chunk-3AKIXHL2.js",
  "/dist/assets/chunk-56E3SYTA.js",
  "/dist/assets/chunk-MR7ZQXOO.js",
  "/dist/assets/chunk-3RPER4KV.js",
  "/dist/assets/chunk-4ZZPETD6.js"
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
