import { ImageResponse } from 'next/og'
import { site } from '@/config/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '18HRSHIFT. Ideas don’t clock out. Products, games, systems, and experiments.'

// ImageResponse renders independently of the page and cannot resolve its CSS variables.
const palette = { background: '#0b0d0c', ink: '#f1f2e9', accent: '#d7ff3f', muted: '#939b90' }

export default function OgImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: palette.background, color: palette.ink, padding: '60px 70px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 700 }}><span>{site.name}</span><span style={{ color: palette.muted, fontSize: 17 }}>INDEPENDENT CREATIVE STUDIO</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 72, fontSize: 104, lineHeight: 1, fontWeight: 900, letterSpacing: '-6px' }}><span>IDEAS DON’T</span><span style={{ color: palette.accent }}>CLOCK OUT.</span></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 19, color: palette.muted }}><span>PRODUCTS / GAMES / SYSTEMS / EXPERIMENTS</span><span>18hrshift.com ↗</span></div>
    </div>,
    size,
  )
}
