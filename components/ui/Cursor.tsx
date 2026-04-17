'use client'

import { useEffect, useRef } from 'react'

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0
    let rx = 0, ry = 0
    let targetScale = 1
    let currentScale = 1
    let raf: number

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      }

      rx += (mx - rx) * 0.10
      ry += (my - ry) * 0.10
      currentScale += (targetScale - currentScale) * 0.12

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${currentScale})`
      }

      raf = requestAnimationFrame(animate)
    }

    const onEnter = () => { targetScale = 2.4 }
    const onLeave = () => { targetScale = 1 }

    const bindHovers = () => {
      document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(animate)
    bindHovers()

    const observer = new MutationObserver(bindHovers)
    observer.observe(document.body, { childList: true, subtree: false })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
