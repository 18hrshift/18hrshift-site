'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BAR_COUNT  = 128
const OUTER_R    = 2.4
const INNER_R    = 1.35

// Frequency range for the arpeggio root (logged by mouse X)
const ROOT_MIN   = 110   // A2
const ROOT_MAX   = 440   // A4
// Filter range for mouse Y (logarithmic)
const FILT_MIN   = 300
const FILT_MAX   = 14000

// Step sequencer: minor-key run that keeps the sound genuinely musical,
// not a static drone. Index-gated so it always evolves on its own.
const STEP_MS    = 135                       // ~111 BPM 8th notes
const SEQUENCE   = [0, 0, 3, 7, 5, 7, 10, 12, 10, 12, 15, 12, 10, 7, 8, 7]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function logMap(t: number, lo: number, hi: number) {
  return lo * Math.pow(hi / lo, t)
}

type AudioRig = {
  ctx:     AudioContext
  osc1:    OscillatorNode
  osc2:    OscillatorNode
  osc3:    OscillatorNode
  filter:  BiquadFilterNode
  analyser:AnalyserNode
  gain:    GainNode
}

function buildAudio(): AudioRig {
  const ctx      = new AudioContext()
  const gain     = ctx.createGain()
  const filter   = ctx.createBiquadFilter()
  const analyser = ctx.createAnalyser()

  filter.type            = 'lowpass'
  filter.frequency.value = 3000
  filter.Q.value         = 1.2
  analyser.fftSize       = BAR_COUNT * 2
  gain.gain.value        = 0

  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const osc3 = ctx.createOscillator()
  osc1.type = 'sawtooth';  osc1.frequency.value = 220
  osc2.type = 'sawtooth';  osc2.frequency.value = 220; osc2.detune.value = 9
  osc3.type = 'square';    osc3.frequency.value = 110; osc3.detune.value = -4

  const g1 = ctx.createGain(); g1.gain.value = 0.34
  const g2 = ctx.createGain(); g2.gain.value = 0.30
  const g3 = ctx.createGain(); g3.gain.value = 0.22

  osc1.connect(g1); g1.connect(filter)
  osc2.connect(g2); g2.connect(filter)
  osc3.connect(g3); g3.connect(filter)
  filter.connect(analyser)
  analyser.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(); osc2.start(); osc3.start()
  return { ctx, osc1, osc2, osc3, filter, analyser, gain }
}

export function Frequency() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [active, setActive]     = useState(false)
  const [mode, setMode]         = useState<'synth' | 'mic'>('synth')
  const [freqHz, setFreqHz]     = useState(220)
  const [filtHz, setFiltHz]     = useState(3000)

  const rigRef          = useRef<AudioRig | null>(null)
  const micStreamRef    = useRef<MediaStream | null>(null)
  const schedRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const genRef          = useRef(0)
  const rootRef         = useRef(220)
  const stepRef         = useRef(0)
  const activeRef       = useRef(false)
  const modeRef         = useRef<'synth' | 'mic'>('synth')
  const mouseRef        = useRef({ x: 0, y: 0 })
  const switchToMicRef  = useRef<(() => void) | null>(null)
  const switchToSynthRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H, false)
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100)
    // Actual position set each tick via orbit; initialise close to that orbit to avoid pop
    camera.position.set(0, 2.0, 5.5)
    camera.lookAt(0, 0.8, 0)

    // ── Bar geometry (InstancedMesh) ───────────────────────────
    // CylinderGeometry reads clearly from any camera angle; boxes show edge-on to most bars
    const barGeo = new THREE.CylinderGeometry(0.05, 0.1, 1, 8)
    barGeo.translate(0, 0.5, 0)
    const barMat = new THREE.MeshBasicMaterial({ vertexColors: true })
    const bars   = new THREE.InstancedMesh(barGeo, barMat, BAR_COUNT)
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(bars)

    // Additive glow layer around each bar for a luminous halo
    const glowMat  = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const glowBars = new THREE.InstancedMesh(barGeo, glowMat, BAR_COUNT)
    glowBars.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(glowBars)

    // Pre-compute bar colors — full saturation, high lightness so they read on dark bg
    const color = new THREE.Color()
    for (let i = 0; i < BAR_COUNT; i++) {
      const t   = 0.5 - 0.5 * Math.cos((i / BAR_COUNT) * Math.PI * 2)
      const hue = lerp(0.545, 0.94, t) % 1.0
      color.setHSL(hue, 1.0, 0.72)
      bars.setColorAt(i, color)
      glowBars.setColorAt(i, color)
    }
    if (bars.instanceColor)    bars.instanceColor.needsUpdate = true
    if (glowBars.instanceColor) glowBars.instanceColor.needsUpdate = true

    // ── Base ring (torus at floor) ─────────────────────────────
    const ringGeo = new THREE.TorusGeometry(OUTER_R, 0.02, 8, 128)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00BFFF, transparent: true, opacity: 0.5 })
    const ring    = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

    // Soft floor glow disc
    const floorGeo = new THREE.CircleGeometry(OUTER_R * 0.96, 64)
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x0055AA, transparent: true, opacity: 0.16, depthWrite: false,
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.02
    scene.add(floor)

    // ── Inner waveform ring ────────────────────────────────────
    const wavePositions = new Float32Array((BAR_COUNT + 1) * 3)
    const waveGeo = new THREE.BufferGeometry()
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3))
    const waveMat  = new THREE.LineBasicMaterial({ color: 0x00BFFF, transparent: true, opacity: 0.9 })
    const waveLine = new THREE.Line(waveGeo, waveMat)
    scene.add(waveLine)

    // Duplicate wave ring for magenta glow layer
    const wave2Positions = new Float32Array((BAR_COUNT + 1) * 3)
    const wave2Geo = new THREE.BufferGeometry()
    wave2Geo.setAttribute('position', new THREE.BufferAttribute(wave2Positions, 3))
    const wave2Mat  = new THREE.LineBasicMaterial({ color: 0xFF2D78, transparent: true, opacity: 0.4 })
    const wave2Line = new THREE.Line(wave2Geo, wave2Mat)
    wave2Line.position.y = 0.04
    scene.add(wave2Line)

    // ── FFT / waveform buffers ─────────────────────────────────
    const fftBuf  = new Uint8Array(BAR_COUNT)
    const waveBuf = new Uint8Array(BAR_COUNT)
    const dummy   = new THREE.Object3D()

    // Shared shutdown: immediate, race-free teardown.
    const shutdownAudio = () => {
      genRef.current++               // invalidate any in-flight async (mic)
      if (schedRef.current) { clearInterval(schedRef.current); schedRef.current = null }
      const rig = rigRef.current
      if (rig) {
        try {
          rig.gain.gain.cancelScheduledValues(rig.ctx.currentTime)
          rig.gain.gain.setTargetAtTime(0, rig.ctx.currentTime, 0.02)
          rig.osc1.stop(); rig.osc2.stop(); rig.osc3.stop()
        } catch {}
        // Null the ref synchronously so a fresh click can't be clobbered
        rigRef.current = null
        setTimeout(() => { try { rig.ctx.close() } catch {} }, 120)
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop())
        micStreamRef.current = null
      }
      activeRef.current = false
      modeRef.current   = 'synth'
      setActive(false)
      setMode('synth')
    }

    // Step-sequencer: plays the arpeggio so the sound never sits on one note.
    const startSequencer = () => {
      if (schedRef.current) return
      stepRef.current = 0
      schedRef.current = setInterval(() => {
        const rig = rigRef.current
        if (!rig || modeRef.current !== 'synth') return
        const gen = genRef.current
        const semi = SEQUENCE[stepRef.current % SEQUENCE.length]
        stepRef.current++
        const freq = rootRef.current * Math.pow(2, semi / 12)
        const now  = rig.ctx.currentTime
        rig.osc1.frequency.setTargetAtTime(freq,     now, 0.02)
        rig.osc2.frequency.setTargetAtTime(freq * 1.013, now, 0.02)
        rig.osc3.frequency.setTargetAtTime(freq / 2, now, 0.04)
        if (gen !== genRef.current) return
      }, STEP_MS)
    }

    // ── Mic toggle ─────────────────────────────────────────────
    const switchToMic = async () => {
      const rig = rigRef.current
      if (!rig) return
      const gen = genRef.current
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        if (gen !== genRef.current) { stream.getTracks().forEach(t => t.stop()); return }
        micStreamRef.current = stream
        // Disconnect oscillators, connect mic
        const micSource = rig.ctx.createMediaStreamSource(stream)
        micSource.connect(rig.analyser)
        // Silence the synth oscillators
        rig.gain.gain.setTargetAtTime(0, rig.ctx.currentTime, 0.1)
        modeRef.current = 'mic'
        setMode('mic')
      } catch {
        // User denied mic — stay in synth mode
      }
    }

    const switchToSynth = () => {
      const rig = rigRef.current
      if (!rig) return
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop())
        micStreamRef.current = null
      }
      rig.gain.gain.setTargetAtTime(0.5, rig.ctx.currentTime, 0.15)
      modeRef.current = 'synth'
      setMode('synth')
    }

    switchToMicRef.current   = switchToMic
    switchToSynthRef.current = switchToSynth

    // ── ScrollTrigger ──────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger:     section,
      start:       'top top',
      end:         'bottom bottom',
      scrub:       1.4,
      onLeave:     () => shutdownAudio(),
      onLeaveBack: () => shutdownAudio(),
    })

    // ── Mouse ──────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth
      const ny = 1 - (e.clientY / window.innerHeight)
      mouseRef.current = { x: nx * 2 - 1, y: ny * 2 - 1 }

      const root = Math.round(logMap(nx, ROOT_MIN, ROOT_MAX))
      const g    = Math.round(logMap(ny, FILT_MIN, FILT_MAX))
      rootRef.current = root
      setFreqHz(root)
      setFiltHz(g)

      if (rigRef.current) {
        const now = rigRef.current.ctx.currentTime
        rigRef.current.filter.frequency.setTargetAtTime(g, now, 0.08)
      }
    }

    // ── Click: toggle audio ────────────────────────────────────
    const onClick = async () => {
      if (!activeRef.current) {
        // Activate
        const gen = ++genRef.current
        const rig = buildAudio()
        rigRef.current = rig
        activeRef.current = true
        setActive(true)
        if (rig.ctx.state === 'suspended') await rig.ctx.resume()
        if (gen !== genRef.current) return
        rig.gain.gain.setTargetAtTime(0.5, rig.ctx.currentTime, 0.3)
        rig.filter.frequency.setValueAtTime(3000, rig.ctx.currentTime)
        startSequencer()
      } else {
        shutdownAudio()
      }
    }

    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize',    onResize,    { passive: true })
    canvas.addEventListener('click', onClick)

    // ── RAF loop ───────────────────────────────────────────────
    let raf: number
    let elapsed = 0
    let lastTime = 0
    let running = false

    const observer = new IntersectionObserver(
      ([e]) => { running = e.isIntersecting },
      { threshold: 0.01 },
    )
    observer.observe(section)

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick)
      if (!running) { lastTime = 0; return }
      const delta = lastTime > 0 ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
      lastTime = time
      elapsed += delta

      const rig   = rigRef.current
      const isOn  = activeRef.current && !!rig

      if (isOn) {
        rig!.analyser.getByteFrequencyData(fftBuf)
        rig!.analyser.getByteTimeDomainData(waveBuf)
      }

      // Update bars
      for (let i = 0; i < BAR_COUNT; i++) {
        const angle = (i / BAR_COUNT) * Math.PI * 2
        const x     = Math.cos(angle) * OUTER_R
        const z     = Math.sin(angle) * OUTER_R

        let amp: number
        if (isOn) {
          amp = (fftBuf[i] / 255) * 3.6 + 0.10
        } else {
          amp = Math.abs(Math.sin(elapsed * 1.1 + (i / BAR_COUNT) * Math.PI * 6)) * 1.6 + 0.22
        }

        dummy.position.set(x, 0, z)
        dummy.rotation.y = -angle
        dummy.scale.set(1, amp, 1)
        dummy.updateMatrix()
        bars.setMatrixAt(i, dummy.matrix)

        // Glow layer: same bar, scaled slightly larger for a halo
        dummy.scale.set(1.45, amp * 1.3, 1.45)
        dummy.updateMatrix()
        glowBars.setMatrixAt(i, dummy.matrix)
      }
      bars.instanceMatrix.needsUpdate   = true
      glowBars.instanceMatrix.needsUpdate = true

      // Update inner waveform rings
      for (let i = 0; i <= BAR_COUNT; i++) {
        const idx   = i % BAR_COUNT
        const angle = (idx / BAR_COUNT) * Math.PI * 2
        let   r     = INNER_R
        if (isOn) {
          r += ((waveBuf[idx] / 128) - 1.0) * 0.6
        } else {
          r += Math.sin(elapsed * 2.2 + angle * 3) * 0.22
        }
        const rx = Math.cos(angle) * r
        const rz = Math.sin(angle) * r
        wavePositions[i * 3 + 0]  = rx
        wavePositions[i * 3 + 1]  = 0
        wavePositions[i * 3 + 2]  = rz
        wave2Positions[i * 3 + 0] = rx
        wave2Positions[i * 3 + 1] = 0
        wave2Positions[i * 3 + 2] = rz
      }
      waveGeo.attributes.position.needsUpdate  = true
      wave2Geo.attributes.position.needsUpdate = true

      // Camera: side-on angle so bars are clearly visible against dark bg
      const autoAngle = elapsed * 0.12
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      camera.position.x = Math.sin(autoAngle + mx * 0.5) * 5.5
      camera.position.z = Math.cos(autoAngle + mx * 0.5) * 5.5
      camera.position.y = 2.0 + my * 0.8
      camera.lookAt(0, 0.8, 0)

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
      canvas.removeEventListener('click', onClick)
      st.kill()
      if (schedRef.current) { clearInterval(schedRef.current); schedRef.current = null }
      if (micStreamRef.current) { micStreamRef.current.getTracks().forEach(t => t.stop()); micStreamRef.current = null }
      if (rigRef.current) { rigRef.current.ctx.close(); rigRef.current = null }
      barGeo.dispose(); barMat.dispose()
      glowMat.dispose()
      ringGeo.dispose(); ringMat.dispose()
      floorGeo.dispose(); floorMat.dispose()
      waveGeo.dispose(); waveMat.dispose()
      wave2Geo.dispose(); wave2Mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="frequency"
      className="relative h-[250vh] bg-bg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden cursor-pointer">
        {/* Label */}
        <div className="absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <span className="font-mono text-[9px] text-muted tracking-[0.5em] uppercase">
            WOW_03 // FREQUENCY
          </span>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* CTA when inactive */}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-px h-10 bg-gradient-to-b from-transparent to-blue/60" />
              <span className="font-mono text-[10px] text-blue/70 tracking-[0.45em] uppercase animate-pulse">
                CLICK TO ACTIVATE
              </span>
              <div className="w-px h-10 bg-gradient-to-t from-transparent to-blue/60" />
            </div>
          </div>
        )}

        {/* Live readout when active */}
        {active && mode === 'synth' && (
          <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center gap-12 pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[8px] text-muted tracking-[0.4em]">PITCH</span>
              <span className="font-mono text-[11px] text-blue tracking-widest">{freqHz} Hz</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[8px] text-muted tracking-[0.4em]">CUTOFF</span>
              <span className="font-mono text-[11px] text-magenta tracking-widest">
                {filtHz >= 1000 ? `${(filtHz / 1000).toFixed(1)} kHz` : `${filtHz} Hz`}
              </span>
            </div>
          </div>
        )}
        {active && mode === 'mic' && (
          <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center pointer-events-none">
            <span className="font-mono text-[9px] text-magenta/70 tracking-[0.45em] uppercase animate-pulse">
              MIC INPUT // LIVE
            </span>
          </div>
        )}

        {/* Mode toggle — SYNTH / MIC */}
        {active && (
          <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (mode === 'synth') {
                  switchToMicRef.current?.()
                } else {
                  switchToSynthRef.current?.()
                }
              }}
              className="font-mono text-[8px] tracking-[0.35em] uppercase px-3 py-1.5 border border-current transition-colors duration-200"
              style={{ color: mode === 'mic' ? '#FF2D78' : '#00BFFF', borderColor: 'currentColor' }}
            >
              {mode === 'synth' ? 'SYNTH' : 'MIC'}
            </button>
          </div>
        )}

        {/* Mouse hint */}
        <div className="absolute bottom-10 right-8 z-10 flex flex-col items-end gap-2 pointer-events-none">
          {active && (
            <span className="font-mono text-[8px] text-muted/40 tracking-[0.3em]">
              X:KEY&nbsp;&nbsp;Y:CUTOFF
            </span>
          )}
          {active && (
            <span className="font-mono text-[8px] text-muted/50 tracking-[0.3em]">
              CLICK TO STOP
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
