'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { labDefaults, labModes } from '@/config/lab'
import type { LabMode, SceneStatus } from '@/components/lab/types'
import useReducedMotion from '@/components/lab/useReducedMotion'
import '@/styles/lab.css'

const LabScene = dynamic(() => import('@/components/lab/LabScene'), {
  ssr: false,
  loading: () => <div className="lab-loading">Preparing the playground<span> / 18</span></div>,
})

export function Lab() {
  const [mode, setMode] = useState<LabMode>(labDefaults.mode)
  const [energy, setEnergy] = useState<number>(labDefaults.energy)
  const [paused, setPaused] = useState(false)
  const [allowMotion, setAllowMotion] = useState(false)
  const [burst, setBurst] = useState(0)
  const [reset, setReset] = useState(0)
  const [status, setStatus] = useState<SceneStatus>('loading')
  const reducedMotion = useReducedMotion()
  const playing = !paused && (!reducedMotion || allowMotion)
  const selected = labModes.find((item) => item.id === mode)!

  const togglePlayback = () => {
    if (playing) setPaused(true)
    else { setPaused(false); setAllowMotion(true) }
  }

  const resetScene = () => {
    setMode(labDefaults.mode)
    setEnergy(labDefaults.energy)
    setPaused(false)
    setAllowMotion(false)
    setReset((value) => value + 1)
  }

  return (
    <section id="lab" className="lab-section" aria-labelledby="lab-title">
      <div className="lab-heading">
        <div>
          <p className="lab-eyebrow"><span>02 / THE PLAYGROUND</span><span className="lab-experiment-tag">EXPERIMENT IN PUBLIC</span></p>
          <h2 id="lab-title">Less talk.<br /><span>More play.</span></h2>
        </div>
        <p className="lab-heading-copy">The browser is a canvas.<br />{' '}This one is yours to mess with.<br /><span>Pick a world. Change the rules.</span></p>
      </div>

      <div className="lab-workbench">
        <div className="lab-stage">
          <div className="lab-stage-top" aria-hidden="true">
            <span>18 / EXPERIMENT {selected.number}</span>
            <span className="lab-status"><i data-playing={status === 'ready' && playing} />{status === 'unavailable' ? 'STATIC PREVIEW' : status === 'loading' ? 'LOADING' : playing ? 'LIVE RENDER' : 'PAUSED'}</span>
          </div>
          <LabScene mode={mode} energy={energy} paused={!playing} allowMotion={allowMotion} burst={burst} reset={reset} onStatus={setStatus} />
          <div className="lab-stage-bottom">
            <span className="lab-object-label">{selected.name}<sup>/{selected.number}</sup></span>
            <span className="lab-pointer-hint">Move your cursor to influence the form <span aria-hidden="true">↗</span></span>
          </div>
          <span className="lab-cross lab-cross--tl" aria-hidden="true">+</span>
          <span className="lab-cross lab-cross--br" aria-hidden="true">+</span>
        </div>

        <div className="lab-controls">
          <div className="lab-controls-heading"><span>MAKE IT YOURS</span><span aria-hidden="true">↙</span></div>
          <fieldset className="lab-mode-picker" disabled={status === 'unavailable'}>
            <legend>Choose an experiment</legend>
            {labModes.map((item) => (
              <button className="lab-mode" key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>
                <span className="lab-mode-number">{item.number}</span>
                <span>{item.name}</span>
                <span className="lab-mode-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </fieldset>

          <div className="lab-experiment-copy" aria-live="polite">
            <p>{selected.description}</p>
            <span>{selected.technique}</span>
          </div>

          <div className="lab-energy-control">
            <label htmlFor="lab-energy">Energy <output htmlFor="lab-energy">{Math.round(energy * 100)}<span>%</span></output></label>
            <input id="lab-energy" type="range" min="0" max="100" step="1" value={Math.round(energy * 100)} onChange={(event) => setEnergy(Number(event.target.value) / 100)} disabled={status === 'unavailable'} aria-valuetext={`${Math.round(energy * 100)} percent`} />
            <div className="lab-range-labels" aria-hidden="true"><span>CALM</span><span>CHAOS</span></div>
          </div>

          <button className="lab-burst" type="button" onClick={() => setBurst((value) => value + 1)} disabled={status !== 'ready'}>Disturb the field <span aria-hidden="true">↗</span></button>
          <div className="lab-playback">
            <button type="button" onClick={togglePlayback} disabled={status !== 'ready'}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span> {playing ? 'Pause' : 'Play'}</button>
            <button type="button" onClick={resetScene} disabled={status !== 'ready'}><span aria-hidden="true">↺</span> Reset</button>
          </div>
          <p className="lab-motion-note">{reducedMotion && !allowMotion ? 'Motion is paused to match your preference. Play when you’re ready.' : 'Made of code. Shaped by you.'}</p>
        </div>
      </div>
      <div className="lab-footnote"><span>THREE EXPERIMENTS. INFINITE VARIATIONS.</span><span>Rendered here, in your browser. No video tricks. <span aria-hidden="true">✳</span></span></div>
    </section>
  )
}
