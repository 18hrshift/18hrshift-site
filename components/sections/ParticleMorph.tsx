'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const PARTICLE_COUNT = 15_000
const TEXT = '18HRSHIFT'

const vertexShader = /* glsl */`
  attribute vec3 aInitPos;
  attribute vec3 aTargetPos;
  attribute float aOffset;
  attribute vec3 aColor;

  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;

  varying vec3 vColor;
  varying float vAlpha;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float delay = aOffset * 0.45;
    float denom = max(1.0 - delay * 0.6, 0.001);
    float localP = clamp((uProgress - delay) / denom, 0.0, 1.0);
    localP = easeInOut(localP);

    vec3 pos = mix(aInitPos, aTargetPos, localP);

    // Letter breathing when formed
    float breathe = sin(uTime * 1.3 + aOffset * 6.2831) * 0.018 * localP;
    pos.xy += vec2(breathe, breathe * 0.6);

    // Mouse repulsion — gaussian falloff for smooth feathering
    vec2 toMouse = pos.xy - uMouse;
    float dist = length(toMouse);
    if (dist < uMouseRadius && dist > 0.001) {
      float t     = dist / uMouseRadius;
      float force = exp(-t * t * 4.0);  // gaussian: full centre, feathers to ~0 at edge
      pos.xy += normalize(toMouse) * force * uMouseStrength * (0.2 + localP * 0.8);
    }

    vColor = aColor;
    vAlpha = 0.65 + 0.35 * localP;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.8 + abs(breathe) * 40.0;
    gl_Position = projectionMatrix * mvPos;
  }
`

const fragmentShader = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    float alpha = (1.0 - r * 2.0) * vAlpha;
    alpha = pow(alpha, 1.5);

    gl_FragColor = vec4(vColor, alpha);
  }
`

type SampledText = { positions: Float32Array; splitX: number }

function sampleTextPositions(text: string, count: number): SampledText {
  const W = 1200, H = 300
  const offscreen = document.createElement('canvas')
  offscreen.width  = W
  offscreen.height = H
  const ctx = offscreen.getContext('2d')!

  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-barlow-condensed').trim() || 'sans-serif'

  ctx.fillStyle = '#ffffff'
  ctx.font = `800 ${H * 0.78}px ${fontFamily}, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2, H / 2)

  const { data } = ctx.getImageData(0, 0, W, H)

  const candidates: [number, number][] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 128) candidates.push([x, y])
    }
  }

  // Find actual split between "18" and "HRSHIFT" by measuring "18" width
  const splitCtx = document.createElement('canvas').getContext('2d')!
  splitCtx.font = `800 ${H * 0.78}px ${fontFamily}, sans-serif`
  const fullW = splitCtx.measureText(text).width
  const prefW = splitCtx.measureText('18').width
  // The text is centred at W/2; left edge of text is at W/2 - fullW/2
  const splitPixelX = W / 2 - fullW / 2 + prefW

  const scaleX = 7.2 / W
  const scaleY = 7.2 / W

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const [cx, cy] = candidates[Math.floor(Math.random() * candidates.length)]
    positions[i * 3 + 0] = (cx + Math.random() - 0.5 - W / 2) * scaleX
    positions[i * 3 + 1] = -(cy + Math.random() - 0.5 - H / 2) * scaleY
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.25
  }

  // splitX in world space
  const splitX = (splitPixelX - W / 2) * scaleX
  return { positions, splitX }
}

export function ParticleMorph() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [formed, setFormed] = useState(false)
  const interactedRef = useRef(false)
  const enteredRef    = useRef(0)

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    let aborted = false
    let doCleanup = () => {}

    // Wait for fonts before sampling text — avoids sans-serif fallback on first visit
    document.fonts.ready.then(() => {
      if (aborted) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H, false)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.z = 5

    // Target positions: sampled from rendered text
    const { positions: targetPos, splitX } = sampleTextPositions(TEXT, PARTICLE_COUNT)

    // Init positions: random sphere
    const initPos = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 3.5 + Math.random() * 4
      initPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      initPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      initPos[i * 3 + 2] = r * Math.cos(phi)
    }

    // Colors: blue for "18", magenta for "HRSHIFT" — split measured from actual render
    const blue    = new THREE.Color('#00BFFF')
    const magenta = new THREE.Color('#FF2D78')
    const colors  = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const c = targetPos[i * 3] < splitX ? blue : magenta
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    // Random stagger offsets
    const offsets = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) offsets[i] = Math.random()

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position',   new THREE.BufferAttribute(initPos.slice(), 3))
    geo.setAttribute('aInitPos',   new THREE.BufferAttribute(initPos, 3))
    geo.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPos, 3))
    geo.setAttribute('aOffset',    new THREE.BufferAttribute(offsets, 1))
    geo.setAttribute('aColor',     new THREE.BufferAttribute(colors, 3))

    const uniforms = {
      uProgress:      { value: 0 },
      uTime:          { value: 0 },
      uMouse:         { value: new THREE.Vector2(9999, 9999) },
      uMouseRadius:   { value: 0.7 },
      uMouseStrength: { value: 1.2 },
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent:  true,
      depthWrite:   false,
      blending:     THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geo, mat)

    // Wrap in a group so drag gestures can rotate the whole object
    const rotGroup = new THREE.Group()
    rotGroup.add(points)
    scene.add(rotGroup)

    // Click/drag: a tap toggles form↔scatter; a drag rotates the object
    const progressRef = { value: 0 }
    const targetRef   = { value: 0 }

    let pointerDown = false
    let dragging    = false
    let downX = 0, downY = 0, downT = 0
    let lastX = 0, lastY = 0

    const onPointerDown = (e: PointerEvent) => {
      interactedRef.current = true
      pointerDown = true
      dragging    = false
      downX = lastX = e.clientX
      downY = lastY = e.clientY
      downT = performance.now()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return
      if (!dragging && Math.hypot(e.clientX - downX, e.clientY - downY) > 6) dragging = true
      if (dragging) {
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        rotGroup.rotation.y += dx * 0.01
        rotGroup.rotation.x  = THREE.MathUtils.clamp(rotGroup.rotation.x + dy * 0.006, -1.2, 1.2)
        lastX = e.clientX
        lastY = e.clientY
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const isTap = !dragging && performance.now() - downT < 400
      pointerDown = false
      if (isTap) {
        const next = targetRef.value < 0.5 ? 1 : 0
        targetRef.value = next
        setFormed(next === 1)
      }
    }

    // Mouse → world XY at z=0 plane
    const targetMouse = new THREE.Vector2(9999, 9999)
    const _v3 = new THREE.Vector3()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      const ny = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
      _v3.set(nx, ny, 0.5).unproject(camera)
      const dir = _v3.sub(camera.position).normalize()
      const t   = -camera.position.z / dir.z
      targetMouse.set(
        camera.position.x + dir.x * t,
        camera.position.y + dir.y * t,
      )
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
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup',   onPointerUp)

    let raf: number
    let elapsed = 0
    let lastTime = 0
    let running = false

    const tick = (time: number) => {
      raf = requestAnimationFrame(tick)
      if (!running) { lastTime = 0; return }
      const delta = lastTime > 0 ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
      lastTime = time
      elapsed += delta
      uniforms.uTime.value = elapsed

      // Smoothly chase the clicked target — gather slightly slower than scatter
      const diff = targetRef.value - progressRef.value
      const k = (diff > 0 ? 2.6 : 3.4)
      progressRef.value += diff * (1 - Math.exp(-k * delta))
      uniforms.uProgress.value = progressRef.value

      // If the user hasn't interacted, auto-form the wordmark after it's on screen
      if (!interactedRef.current && enteredRef.current > 0
          && performance.now() - enteredRef.current > 700) {
        targetRef.value = 1
      }

      const mu = uniforms.uMouse.value
      mu.x += (targetMouse.x - mu.x) * 0.07
      mu.y += (targetMouse.y - mu.y) * 0.07

      renderer.render(scene, camera)
    }

    const observer = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting
        if (e.isIntersecting && enteredRef.current === 0) enteredRef.current = performance.now()
      },
      { threshold: 0.01 },
    )
    observer.observe(section)
    raf = requestAnimationFrame(tick)

    doCleanup = () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup',   onPointerUp)
      geo.dispose()
      mat.dispose()
      renderer.dispose()
    }
    }) // end document.fonts.ready.then

    return () => {
      aborted = true
      doCleanup()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="wow"
      className="relative h-screen bg-bg overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full cursor-pointer">
        {/* Label */}
        <div className="absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <span className="font-mono text-[9px] text-muted tracking-[0.5em] uppercase">
            WOW_01 // PARTICLE_MORPH
          </span>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Click cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
          <span className="font-mono text-[9px] text-muted/50 tracking-[0.4em]">
            {formed ? 'DRAG TO ROTATE · CLICK TO DISPERSE' : 'CLICK TO FORM'}
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-blue/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
