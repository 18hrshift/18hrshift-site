'use client'

import { useEffect, useRef } from 'react'

export function useMousePosition() {
  const ref = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1
      ref.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  return ref
}
