import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * iOS home-screen icon. iOS applies its own rounded mask, so we fill
 * edge-to-edge with the brand color and keep the glyph in the safe zone.
 */
export default function AppleIcon() {
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
        }}
      >
        <svg
          width="110"
          height="110"
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
