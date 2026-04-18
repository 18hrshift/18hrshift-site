'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS = [
  { id: 'wow',       label: 'PARTICLE' },
  { id: 'void',      label: 'VOID'     },
  { id: 'frequency', label: 'FREQ'     },
  { id: 'finale',    label: 'FINALE'   },
] as const

export function SectionDots() {
  const [active, setActive] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    // Show dots when first WOW section enters, hide when scrolled back above it
    const showST = ScrollTrigger.create({
      trigger: '#wow',
      start:   'top 80%',
      end:     'bottom top',
      onEnter:     () => setVisible(true),
      onLeaveBack: () => setVisible(false),
    })

    const hideST = ScrollTrigger.create({
      trigger: '#finale',
      start:   'bottom bottom',
      onLeave: () => setVisible(false),
      onEnterBack: () => setVisible(true),
    })

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const st = ScrollTrigger.create({
        trigger: el,
        start:   'top 60%',
        end:     'bottom 40%',
        onEnter:      () => setActive(id),
        onEnterBack:  () => setActive(id),
        onLeave:      () => setActive(a => a === id ? null : a),
        onLeaveBack:  () => setActive(a => a === id ? null : a),
      })
      triggers.push(st)
    })

    return () => {
      showST.kill()
      hideST.kill()
      triggers.forEach(t => t.kill())
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-4 pointer-events-none">
      {SECTIONS.map(({ id, label }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={`#${id}`}
            className="pointer-events-auto flex items-center gap-2 group"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="font-mono text-[8px] tracking-[0.3em] uppercase transition-all duration-300"
              style={{
                color: isActive ? 'var(--clr-blue)' : 'transparent',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0)' : 'translateX(4px)',
              }}
            >
              {label}
            </span>
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width:  isActive ? '8px' : '5px',
                height: isActive ? '8px' : '5px',
                background: isActive ? 'var(--clr-blue)' : 'var(--clr-muted)',
                boxShadow: isActive ? '0 0 10px var(--clr-blue)' : 'none',
              }}
            />
          </a>
        )
      })}
    </div>
  )
}
