import { useEffect, useRef } from 'react'

/**
 * Pauses/resumes a Three.js-style RAF loop based on element visibility.
 * Pass the section ref and a start/stop callback pair.
 * Reduces GPU load for off-screen canvas sections from constant to zero.
 */
export function useVisibleRenderer(
  elementRef: React.RefObject<HTMLElement | null>,
  onVisible: () => void,
  onHidden: () => void,
  threshold = 0.01,
) {
  const callbacksRef = useRef({ onVisible, onHidden })
  callbacksRef.current = { onVisible, onHidden }

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callbacksRef.current.onVisible()
        } else {
          callbacksRef.current.onHidden()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [elementRef, threshold])
}
