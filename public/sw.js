/* Service worker de Pokédex Wallpaper (JS plano, sin dependencias).
 *
 * Privacidad: NUNCA se cachean páginas HTML, respuestas de API ni datos del
 * usuario. Solo estáticos con hash (/_next/static/), iconos y offline.html.
 */
const VERSION = "v1"
const STATIC_CACHE = `pokedex-static-${VERSION}`
const OFFLINE_CACHE = `pokedex-offline-${VERSION}`
const OFFLINE_URL = "/offline.html"
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"]
const MAX_STATIC_ENTRIES = 150

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" })))
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, OFFLINE_CACHE])
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

function isCacheableStatic(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")
}

async function trimCache(cache) {
  const keys = await cache.keys()
  // keys() devuelve en orden de inserción: se borran las más antiguas.
  for (let i = 0; i < keys.length - MAX_STATIC_ENTRIES; i++) {
    await cache.delete(keys[i])
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone())
    trimCache(cache)
  }
  return response
}

async function networkOnlyNavigation(request) {
  try {
    return await fetch(request)
  } catch {
    const offline = await caches.match(OFFLINE_URL)
    return offline || new Response("Sin conexión", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === "navigate") {
    event.respondWith(networkOnlyNavigation(request))
    return
  }

  if (isCacheableStatic(url)) {
    event.respondWith(cacheFirst(request))
  }
  // Todo lo demás (RSC, manifest, sw.js…) va directo a la red sin tocar caché.
})
