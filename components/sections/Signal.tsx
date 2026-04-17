'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '@/config/site'

gsap.registerPlugin(ScrollTrigger)

// Highlight specific power words with color spans
function renderLine(line: string) {
  const highlights: Record<string, string> = {
    'COMPUTE':     'text-blue text-glow-blue',
    'DISSOLVE':    'text-magenta text-glow-magenta',
    'DELIBERATE':  'text-blue text-glow-blue',
  }
  const words = line.split(' ')
  return words.map((word, i) => {
    // Strip trailing punctuation for matching
    const clean = word.replace(/[^A-Z]/gi, '').toUpperCase()
    const cls = highlights[clean]
    return cls
      ? <span key={i} className={cls}>{word}{i < words.length - 1 ? ' ' : ''}</span>
      : <span key={i} className="text-white">{word}{i < words.length - 1 ? ' ' : ''}</span>
  })
}

export function Signal() {
  const sectionRef = useRef<HTMLElement>(null)
  const scanRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      const lines     = gsap.utils.toArray<HTMLElement>('[data-line]', sectionRef.current!)
      const wrappers  = gsap.utils.toArray<HTMLElement>('[data-line-wrap]', sectionRef.current!)

      gsap.set(lines, { opacity: 0, yPercent: 55, skewY: 4 })
      gsap.set(wrappers, { borderLeftColor: 'rgba(0,191,255,0)' })

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

      // Scan sweep across full timeline
      if (scanRef.current) {
        tl.fromTo(scanRef.current,
          { top: '-2px' },
          { top: '100%', ease: 'none', duration: lines.length * 0.42 + 0.3 },
          0,
        )
      }

      lines.forEach((line, i) => {
        const wrapper = wrappers[i]
        const pos = i * 0.42

        tl.to(line,
          { opacity: 1, yPercent: 0, skewY: 0, ease: 'power3.out', duration: 0.45 },
          pos,
        )

        // Left border accent draws in
        if (wrapper) {
          tl.to(wrapper,
            { borderLeftColor: 'rgba(0,191,255,0.35)', ease: 'power2.out', duration: 0.3 },
            pos + 0.1,
          )
        }

        // Glitch pulse: skewX snap
        tl.to(line,
          { skewX: 6, duration: 0.04, ease: 'none' },
          pos + 0.38,
        )
        tl.to(line,
          { skewX: -3, duration: 0.03, ease: 'none' },
          pos + 0.42,
        )
        tl.to(line,
          { skewX: 0, duration: 0.06, ease: 'power2.out' },
          pos + 0.45,
        )
      })

      // Scale-out as section unpins
      tl.to(sectionRef.current, { scale: 0.96, opacity: 0.7, ease: 'none', duration: 0.3 }, '>')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="signal"
      className="relative min-h-screen flex flex-col justify-center px-6 md:px-20 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(0,191,255,0.04)_0%,transparent_70%)]"
    >
      {/* Scan sweep line */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 h-px pointer-events-none z-20"
        style={{ top: '-2px', boxShadow: '0 0 12px 3px rgba(0,191,255,0.5)', background: 'rgba(0,191,255,0.7)' }}
      />

      {/* Section label */}
      <div className="flex items-center gap-4 mb-16">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">
          {site.signal.label}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue/40 to-transparent" />
      </div>

      {/* Manifesto lines */}
      <div className="space-y-1 overflow-hidden">
        {site.signal.lines.map((line, i) => (
          <div
            key={i}
            data-line-wrap
            className="overflow-hidden py-1 pl-4 border-l-2"
          >
            <p
              data-line
              className="font-display font-black leading-[1.0] tracking-tight uppercase"
              style={{ fontSize: 'clamp(2.8rem, 7.5vw, 7.5rem)' }}
            >
              {renderLine(line)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 h-px w-24 bg-blue/50" />
    </section>
  )
}
