'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { scramble } from '@/lib/scramble'
import { site } from '@/config/site'

const Scene = dynamic(
  () => import('@/components/canvas/Scene').then((m) => m.Scene),
  { ssr: false, loading: () => null },
)

export function Hero() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const cancel = scramble(el, site.name, 1200)
    return cancel
  }, [])

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* 3D canvas fills the section */}
      <div className="absolute inset-0 scanlines" style={{ height: '100%' }}>
        <Scene />
      </div>

      {/* Radial gradient to punch through the canvas at center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_30%,#050508_100%)] pointer-events-none" />

      {/* System HUD ticker */}
      <div className="absolute top-[4.5rem] left-0 right-0 z-20 overflow-hidden border-y border-blue/10 bg-surface/30 backdrop-blur-sm">
        <div className="hud-ticker flex gap-12 py-1.5 whitespace-nowrap font-mono text-[9px] text-muted tracking-[0.3em]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="shrink-0">
              SYS:ONLINE&nbsp;&nbsp;//&nbsp;&nbsp;LATENCY:2ms&nbsp;&nbsp;//&nbsp;&nbsp;SIGNAL:ACTIVE&nbsp;&nbsp;//&nbsp;&nbsp;OUTPUT:18HRSHIFT&nbsp;&nbsp;//&nbsp;&nbsp;UPTIME:∞&nbsp;&nbsp;//&nbsp;&nbsp;RENDER:REALTIME&nbsp;&nbsp;//&nbsp;&nbsp;FRAME:DELIBERATE&nbsp;&nbsp;//&nbsp;&nbsp;STATUS:██████&nbsp;&nbsp;//&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
        <h1
          ref={headingRef}
          className="font-display font-black text-[clamp(3.5rem,13vw,13rem)] leading-none tracking-tighter text-ink uppercase text-glow-blue select-none"
        >
          {site.name}
        </h1>
        <p className="font-mono text-[10px] text-muted tracking-[0.5em] mt-6 uppercase">
          {site.tagline}
        </p>
      </div>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg to-transparent pointer-events-none z-10" />

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-gradient-to-b from-blue/60 to-transparent animate-pulse" />
        <span className="font-mono text-[9px] text-muted tracking-[0.4em]">SCROLL</span>
      </div>
    </section>
  )
}
