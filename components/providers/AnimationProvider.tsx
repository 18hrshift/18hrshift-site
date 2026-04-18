'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Reveal all [data-reveal] elements on scroll
    const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const triggers: ScrollTrigger[] = []

    revealEls.forEach((el) => {
      triggers.push(ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => el.classList.add('is-visible'),
        once: true,
      }))
    })

    return () => triggers.forEach((t) => t.kill())
  }, [])

  return <>{children}</>
}
