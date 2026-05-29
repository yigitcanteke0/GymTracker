// Minimal service worker — enables PWA installability + lightweight offline
// shell for static assets. The app's main offline-resilience strategy lives
// in src/lib/retry.ts and src/lib/active-workout-cache.ts; this SW is just
// the "static fallback" tier.

const CACHE = 'gymtracker-v1'

self.addEventListener('install', (event) => {
  // Activate immediately on first install / SW update
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE))
})

self.addEventListener('activate', (event) => {
  // Wipe old caches, then take control of open tabs
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Don't try to cache Supabase, Vercel internals, third-party fonts, etc.
  if (url.origin !== self.location.origin) return

  // Stale-while-revalidate for Next.js static assets — fast repeat loads
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req)
        const fetchPromise = fetch(req)
          .then((resp) => {
            if (resp && resp.ok) cache.put(req, resp.clone())
            return resp
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  // Cache the generated icons + manifest — needed for splash/install UI
  if (
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/icon' ||
    url.pathname === '/icon1' ||
    url.pathname === '/apple-icon' ||
    url.pathname === '/favicon.ico'
  ) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req)
        const fetchPromise = fetch(req)
          .then((resp) => {
            if (resp && resp.ok) cache.put(req, resp.clone())
            return resp
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }
  // Everything else: network-first, no cache. The app's UI handles offline.
})
