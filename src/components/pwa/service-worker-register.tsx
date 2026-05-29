'use client'

import { useEffect } from 'react'

/**
 * Registers /sw.js on first paint. Idempotent — the browser dedupes
 * subsequent register() calls for the same scope.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Avoid registering on localhost during a Vercel preview where it would
    // interfere with HMR; harmless on prod.
    if (process.env.NODE_ENV !== 'production') return

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          /* ignore — non-fatal */
        })
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })

    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
