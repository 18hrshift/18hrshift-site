'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BAR_COUNT  = 128
const OUTER_R    = 2.4
const INNER_R    = 1.35

// Frequency range for mouse X (logarithmic)
const FREQ_MIN   = 60
const FREQ_MAX   = 880
// Filter range for mouse Y (logarithmic)
const FILT_MIN   = 300
const FILT_MAX   = 14000

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

  const g1 = ctx.createGain(); g1.gain.value = 0.45
  const g2 = ctx.createGain(); g2.gain.value = 0.40
  const g3 = ctx.createGain(); g3.gain.value = 0.18

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
  const activeRef       = useRef(false)
  const modeRef         = useRef<'synth' | 'mic'>('synth')
  const mouseRef        = useRef({ x: 0, y: 0 })
  const targetFreq      = useRef(220)
  const targetFilt      = useRef(3000)
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
    const barGeo = new THREE.CylinderGeometry(0.02, 0.055, 1, 6)
    barGeo.translate(0, 0.5, 0)
    const barMat = new THREE.MeshBasicMaterial({ vertexColors: true })
    const bars   = new THREE.InstancedMesh(barGeo, barMat, BAR_COUNT)
    bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(bars)

    // Pre-compute bar colors — full saturation, high lightness so they read on dark bg
    const color = new THREE.Color()
    for (let i = 0; i < BAR_COUNT; i++) {
      const t   = 0.5 - 0.5 * Math.cos((i / BAR_COUNT) * Math.PI * 2)
      const hue = lerp(0.545, 0.94, t) % 1.0
      color.setHSL(hue, 1.0, 0.68)
      bars.setColorAt(i, color)
    }
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true

    // ── Base ring (torus at floor) ─────────────────────────────
    const ringGeo = new THREE.TorusGeometry(OUTER_R, 0.012, 8, 128)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00BFFF, transparent: true, opacity: 0.35 })
    const ring    = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    scene.add(ring)

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

    // ── Shared shutdown ────────────────────────────────────────
    const shutdownAudio = () => {
      if (!activeRef.current || !rigRef.current) return
      const rig = rigRef.current
      rig.gain.gain.setTargetAtTime(0, rig.ctx.currentTime, 0.2)
      setTimeout(() => { rig.ctx.close(); rigRef.current = null }, 500)
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop())
        micStreamRef.current = null
      }
      activeRef.current = false
      modeRef.current   = 'synth'
      setActive(false)
      setMode('synth')
    }

    // ── Mic toggle ─────────────────────────────────────────────
    const switchToMic = async () => {
      const rig = rigRef.current
      if (!rig) return
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
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
      rig.gain.gain.setTargetAtTime(0.55, rig.ctx.currentTime, 0.15)
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

      const f = Math.round(logMap(nx, FREQ_MIN, FREQ_MAX))
      const g = Math.round(logMap(ny, FILT_MIN, FILT_MAX))
      targetFreq.current = f
      targetFilt.current = g
      setFreqHz(f)
      setFiltHz(g)

      if (rigRef.current) {
        const { osc1, osc2, osc3, filter, ctx } = rigRef.current
        const now = ctx.currentTime
        osc1.frequency.setTargetAtTime(f,       now, 0.06)
        osc2.frequency.setTargetAtTime(f,       now, 0.06)
        osc3.frequency.setTargetAtTime(f / 2,   now, 0.06)
        filter.frequency.setTargetAtTime(g,     now, 0.08)
      }
    }

    // ── Click: toggle audio ────────────────────────────────────
    const onClick = async () => {
      if (!activeRef.current) {
        // Activate
        const rig = buildAudio()
        rigRef.current = rig
        activeRef.current = true
        setActive(true)
        if (rig.ctx.state === 'suspended') await rig.ctx.resume()
        // Fade in
        rig.gain.gain.setTargetAtTime(0.55, rig.ctx.currentTime, 0.3)
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
          amp = (fftBuf[i] / 255) * 3.2 + 0.08
        } else {
          amp = Math.abs(Math.sin(elapsed * 1.1 + (i / BAR_COUNT) * Math.PI * 6)) * 1.4 + 0.12
        }

        dummy.position.set(x, 0, z)
        dummy.rotation.y = -angle
        dummy.scale.set(1, amp, 1)
        dummy.updateMatrix()
        bars.setMatrixAt(i, dummy.matrix)
      }
      bars.instanceMatrix.needsUpdate = true

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
      if (rigRef.current) { rigRef.current.ctx.close(); rigRef.current = null }
      barGeo.dispose(); barMat.dispose()
      ringGeo.dispose(); ringMat.dispose()
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
        <div className="absolute bottom-10 right-8 z-10 pointer-events-none">
          {active && (
            <span className="font-mono text-[8px] text-muted/40 tracking-[0.3em]">
              X:PITCH&nbsp;&nbsp;Y:FILTER
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
