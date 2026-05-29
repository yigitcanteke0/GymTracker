import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

/**
 * Standard app icon (browser tab, manifest, Android home screen).
 * Dumbbell-on-navy mark — matches the in-app brand tile.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#003876',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 96,
          // Subtle inner highlight to echo the in-app tile shadow
          boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.10)',
        }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 6v12M2 9v6M22 9v6M18 6v12M6 12h12" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
