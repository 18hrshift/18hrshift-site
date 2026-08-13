import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size    = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a12',
        position: 'relative',
        borderRadius: '24%',
      }}
    >
      {/* Radial brand glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '24%',
        background: 'radial-gradient(circle at 50% 45%, rgba(0,191,255,0.55), rgba(255,45,120,0.30) 45%, transparent 75%)',
      }} />
      {/* Bold brand monogram — big enough to read at tab size */}
      <div style={{
        position: 'relative',
        fontSize: 300,
        fontWeight: 900,
        fontFamily: 'Arial, sans-serif',
        letterSpacing: -14,
        color: '#FFFFFF',
        display: 'flex',
        textAlign: 'center',
        lineHeight: 1,
      }}>
        18
      </div>
    </div>,
    { ...size },
  )
}