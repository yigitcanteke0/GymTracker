import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

/**
 * Smaller PNG variant for the Web App Manifest (Android requires 192×192).
 */
export default function Icon192() {
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
          borderRadius: 36,
        }}
      >
        <svg
          width="116"
          height="116"
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
