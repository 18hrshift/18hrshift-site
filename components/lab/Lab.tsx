'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { labCopy, labDefaults, labModes } from '@/config/lab'
import { labPage } from '@/config/site'
import type { LabMode, SceneStatus } from '@/components/lab/types'
import useReducedMotion from '@/components/lab/useReducedMotion'
import { DisplayTitle } from '@/components/ui/primitives'

const LabScene = dynamic(() => import('@/components/lab/LabScene'), {
  ssr: false,
  loading: () => <div className="lab-loading">{labCopy.loading}<span> / 18</span></div>,
})

// The /lab workbench: page heading, the live scene and its controls.
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
  const stageStatus = status === 'unavailable' ? labCopy.stageStatus.unavailable : status === 'loading' ? labCopy.stageStatus.loading : playing ? labCopy.stageStatus.live : labCopy.stageStatus.paused

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
          <p className="lab-eyebrow"><span>{labPage.eyebrow}</span><span className="lab-experiment-tag">{labPage.tag}</span></p>
          <h1 id="lab-title"><DisplayTitle lines={labPage.title} /></h1>
        </div>
        <p className="lab-heading-copy">{labPage.intro}</p>
      </div>
      <h2 className="sr-only">{labPage.experiments}</h2>

      <div className="lab-workbench">
        <div className="lab-stage">
          <div className="lab-stage-top" aria-hidden="true">
            <span>{labCopy.experiment} {selected.number}</span>
            <span className="lab-status"><i data-playing={status === 'ready' && playing} />{stageStatus}</span>
          </div>
          <LabScene mode={mode} energy={energy} paused={!playing} allowMotion={allowMotion} burst={burst} reset={reset} onStatus={setStatus} />
          <div className="lab-stage-bottom">
            <span className="lab-object-label">{selected.name}<sup>/{selected.number}</sup></span>
            <span className="lab-pointer-hint">{labCopy.pointerHint} <span aria-hidden="true">↗</span></span>
          </div>
          <span className="lab-cross lab-cross--tl" aria-hidden="true">+</span>
          <span className="lab-cross lab-cross--br" aria-hidden="true">+</span>
        </div>

        <div className="lab-controls">
          <div className="lab-controls-heading"><span>{labCopy.controlsHeading}</span><span aria-hidden="true">↙</span></div>
          <fieldset className="lab-mode-picker" disabled={status === 'unavailable'}>
            <legend>{labCopy.pickerLegend}</legend>
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
            <label htmlFor="lab-energy">{labCopy.energy} <output htmlFor="lab-energy">{Math.round(energy * 100)}<span>%</span></output></label>
            <input id="lab-energy" type="range" min="0" max="100" step="1" value={Math.round(energy * 100)} onChange={(event) => setEnergy(Number(event.target.value) / 100)} disabled={status === 'unavailable'} aria-valuetext={`${Math.round(energy * 100)} percent`} />
            <div className="lab-range-labels" aria-hidden="true"><span>{labCopy.calm}</span><span>{labCopy.chaos}</span></div>
          </div>

          <button className="lab-burst" type="button" onClick={() => setBurst((value) => value + 1)} disabled={status !== 'ready'}>{labCopy.burst} <span aria-hidden="true">↗</span></button>
          <div className="lab-playback">
            <button type="button" onClick={togglePlayback} disabled={status !== 'ready'}><span aria-hidden="true">{playing ? 'Ⅱ' : '▷'}</span> {playing ? labCopy.pause : labCopy.play}</button>
            <button type="button" onClick={resetScene} disabled={status !== 'ready'}><span aria-hidden="true">↺</span> {labCopy.reset}</button>
          </div>
          <p className="lab-motion-note">{reducedMotion && !allowMotion ? labCopy.reducedMotionNote : labCopy.motionNote}</p>
        </div>
      </div>
      <div className="lab-footnote"><span>{labCopy.footnote[0]}</span><span>{labCopy.footnote[1]} <span aria-hidden="true">✳</span></span></div>
    </section>
  )
}
