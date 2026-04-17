'use client'

import { useEffect, useRef } from 'react'

export function useMagnetic<T extends HTMLElement>(strength = 0.38) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width  / 2)) * strength
      const dy = (e.clientY - (rect.top  + rect.height / 2)) * strength
      el.style.transition = 'transform 0.12s ease'
      el.style.transform  = `translate(${dx}px, ${dy}px)`
    }

    const onLeave = () => {
      el.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)'
      el.style.transform  = 'translate(0, 0)'
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return ref
}
