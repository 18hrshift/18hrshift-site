'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '@/config/site'

gsap.registerPlugin(ScrollTrigger)

export function Signal() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-line]', sectionRef.current!)

      // Set initial hidden state
      gsap.set(lines, { opacity: 0, yPercent: 55, skewY: 4 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${window.innerHeight * 2.2}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
        },
      })

      lines.forEach((line, i) => {
        tl.to(
          line,
          { opacity: 1, yPercent: 0, skewY: 0, ease: 'power3.out', duration: 0.45 },
          i * 0.42,
        )
      })

      // Subtle scale-out as section unpins
      tl.to(sectionRef.current, { scale: 0.96, opacity: 0.7, ease: 'none', duration: 0.3 }, '>')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="signal"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-20"
    >
      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">
          {site.signal.label}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue/40 to-transparent" />
      </div>

      {/* Manifesto lines — each wraps to clip overflow */}
      <div className="space-y-1 overflow-hidden">
        {site.signal.lines.map((line, i) => (
          <div key={i} className="overflow-hidden py-1">
            <p
              data-line
              className="font-display font-black leading-[1.0] tracking-tight text-ink uppercase"
              style={{ fontSize: 'clamp(2.8rem, 7.5vw, 7.5rem)' }}
            >
              {line}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 h-px w-24 bg-blue/50" />
    </section>
  )
}
