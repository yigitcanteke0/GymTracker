import type { MetadataRoute } from 'next'

/**
 * Web App Manifest. Enables "Add to Home Screen" on iOS + Android, plus
 * Chrome's native install prompt (combined with the registered service worker).
 *
 * Theme color matches accent-600 (#003876). Background matches --color-bg
 * so the standalone splash blends seamlessly with the in-app dark navy.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GymTracker — Yiğitcan Teke',
    short_name: 'GymTracker',
    description: 'Kişisel antrenman takip uygulaması — set, tekrar, RIR, ağırlık.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050810',
    theme_color: '#003876',
    lang: 'tr',
    categories: ['fitness', 'health', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon1',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
