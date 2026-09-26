'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import useReducedMotion from '@/components/lab/useReducedMotion'
import type { SceneStatus } from '@/components/lab/types'

const LabScene = dynamic(() => import('@/components/lab/LabScene'), { ssr: false })

export function Hero() {
  const [paused, setPaused] = useState(false)
  const [allowMotion, setAllowMotion] = useState(false)
  const [status, setStatus] = useState<SceneStatus>('loading')
  const reducedMotion = useReducedMotion()
  const playing = !paused && (!reducedMotion || allowMotion)
  const toggleMotion = () => {
    if (playing) setPaused(true)
    else { setPaused(false); setAllowMotion(true) }
  }
  return (
    <section id="hero" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero-topline eyebrow"><span><i className="status-dot" /> A studio in perpetual motion</span><span>Think. Make. Repeat.</span></div>
      <div className="hero-content">
        <div className="hero-copy">
          <h1 id="hero-title">IDEAS DON’T<br /><span>CLOCK OUT.</span></h1>
          <p>We turn restless curiosity into things you can play, use, and feel. Digital products. New worlds. Whatever comes next.</p>
          <div className="hero-actions">
            <a className="button button-accent" href="#work">Explore the work <span aria-hidden="true">↗</span></a>
            <a className="text-link" href="#lab"><span className="play-icon" aria-hidden="true">▷</span> Enter the lab</a>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit" aria-hidden="true" />
          <LabScene variant="hero" paused={!playing} allowMotion={allowMotion} onStatus={setStatus} />
          <button type="button" className="hero-motion eyebrow" aria-pressed={!playing} disabled={status !== 'ready'} onClick={toggleMotion}>{status === 'unavailable' ? 'Static preview' : !playing ? 'Resume motion ▷' : 'Pause motion Ⅱ'}</button>
          <span className="hero-art-label eyebrow">An idea, taking shape.</span>
          <a href="#lab" className="hero-art-link" aria-label="Experiment with this sculpture in the lab">↗</a>
        </div>
      </div>
      <div className="hero-bottom eyebrow"><span>One collective. Many dimensions.</span><a href="#work">Scroll to discover <span aria-hidden="true">↓</span></a></div>
    </section>
  )
}
