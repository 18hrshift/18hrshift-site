import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#050508',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      {/* Grid dots */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(0,191,255,0.08) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #050508 100%)',
      }} />

      {/* Main text */}
      <div style={{
        fontSize: 108,
        fontWeight: 900,
        color: '#E2E2EE',
        letterSpacing: '-4px',
        lineHeight: 1,
        textShadow: '0 0 60px rgba(0,191,255,0.4)',
        position: 'relative',
      }}>
        18HRSHIFT
      </div>

      <div style={{
        fontSize: 18,
        color: '#444458',
        letterSpacing: '10px',
        marginTop: 28,
        textTransform: 'uppercase',
        position: 'relative',
      }}>
        OUTPUT IS THE ONLY METRIC.
      </div>

      {/* Bottom accent */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 60,
        fontSize: 12,
        color: '#00BFFF',
        letterSpacing: '5px',
        opacity: 0.7,
      }}>
        18HRSHIFT.VERCEL.APP
      </div>

      {/* Blue corner accent */}
      <div style={{
        position: 'absolute',
        top: 40,
        right: 60,
        fontSize: 11,
        color: '#FF2D78',
        letterSpacing: '4px',
        opacity: 0.6,
      }}>
        DIGITAL NATIVE PRODUCTION
      </div>
    </div>,
    { ...size },
  )
}
