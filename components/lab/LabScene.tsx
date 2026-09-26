'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  sculptureVertex, sculptureFragment,
  particlesVertex, particlesFragment,
  terrainVertex, terrainFragment,
} from './shaders'
import type { LabSceneProps, SceneStatus } from './types'
import '@/styles/lab.css'

export default function LabScene({
  variant = 'lab',
  mode = 'flux',
  energy = 0.55,
  paused = false,
  allowMotion = false,
  burst = 0,
  reset = 0,
  onStatus,
}: LabSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<() => void>(() => {})
  const settingsRef = useRef({ mode, energy, paused, allowMotion, burst, reset, onStatus })
  const [status, setStatus] = useState<SceneStatus>('loading')

  useEffect(() => {
    settingsRef.current = { mode, energy, paused, allowMotion, burst, reset, onStatus }
    frameRef.current()
  }, [mode, energy, paused, allowMotion, burst, reset, onStatus])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch (error) {
      console.error('Unable to initialize the 18HRSHIFT 3D renderer.', error)
      settingsRef.current.onStatus?.('unavailable')
      queueMicrotask(() => setStatus('unavailable'))
      return
    }

    const colors = getComputedStyle(document.documentElement)
    const color = (token: string) => new THREE.Color(colors.getPropertyValue(token).trim() || 'white')
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 60)
    const root = new THREE.Group()
    scene.add(root)

    const uniforms = {
      uTime: { value: 0 },
      uEnergy: { value: settingsRef.current.energy },
      uBurst: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: pixelRatio },
      uAccent: { value: color('--clr-accent') },
      uBlue: { value: color('--clr-blue') },
      uInk: { value: color('--clr-ink') },
    }

    const flux = new THREE.Group()
    const sculpture = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.26, 0.46, 240, 40, 2, 3),
      new THREE.ShaderMaterial({ uniforms, vertexShader: sculptureVertex, fragmentShader: sculptureFragment }),
    )
    sculpture.rotation.set(0.24, 0.3, -0.4)
    flux.add(sculpture)

    const ringPoints: THREE.Vector3[] = []
    for (let index = 0; index <= 200; index++) {
      const angle = index / 200 * Math.PI * 2
      ringPoints.push(new THREE.Vector3(Math.cos(angle) * 2.36, Math.sin(angle) * 2.36, 0))
    }
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(ringPoints),
      new THREE.LineBasicMaterial({ color: uniforms.uAccent.value, transparent: true, opacity: 0.26 }),
    )
    orbit.rotation.set(1.06, -0.35, 0.28)
    flux.add(orbit)
    root.add(flux)

    const count = variant === 'hero' ? 8000 : 16000
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let index = 0; index < count; index++) {
      const y = 1 - index / (count - 1) * 2
      const radius = Math.sqrt(1 - y * y)
      const angle = goldenAngle * index
      const seed = (Math.sin(index * 127.1) * 43758.5453) % 1
      seeds[index] = Math.abs(seed)
      const shell = 1.7 + seeds[index] * 0.65
      positions[index * 3] = Math.cos(angle) * radius * shell
      positions[index * 3 + 1] = y * shell
      positions[index * 3 + 2] = Math.sin(angle) * radius * shell
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const swarm = new THREE.Points(particleGeometry, new THREE.ShaderMaterial({
      uniforms,
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }))
    // The vertex shader can expand the field beyond its original bounds.
    swarm.frustumCulled = false
    root.add(swarm)

    const terrain = new THREE.Mesh(new THREE.PlaneGeometry(10, 8, 180, 150), new THREE.ShaderMaterial({
      uniforms,
      vertexShader: terrainVertex,
      fragmentShader: terrainFragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }))
    terrain.rotation.set(-0.95, 0, -0.14)
    terrain.position.y = -0.4
    terrain.frustumCulled = false
    root.add(terrain)

    let disposed = false
    let failed = false
    let frame = 0
    let visible = false
    let elapsed = 0
    let lastTime = 0
    let previousBurst = settingsRef.current.burst
    let previousReset = settingsRef.current.reset
    let ready = false
    const pointer = new THREE.Vector2()
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
    }

    const unavailable = () => {
      if (disposed || failed) return
      failed = true
      stop()
      setStatus('unavailable')
      settingsRef.current.onStatus?.('unavailable')
    }

    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      console.error('Unable to compile an 18HRSHIFT visual experiment.', {
        program: gl.getProgramInfoLog(program),
        vertex: gl.getShaderInfoLog(vertex),
        fragment: gl.getShaderInfoLog(fragment),
      })
      unavailable()
    }

    const draw = (time: number) => {
      frame = 0
      if (disposed || failed || !visible || document.hidden) return
      const settings = settingsRef.current
      const animate = !settings.paused && (!motionQuery.matches || settings.allowMotion)
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
      lastTime = time

      if (settings.reset !== previousReset) {
        elapsed = 0
        uniforms.uBurst.value = 0
        pointer.set(0, 0)
        uniforms.uPointer.value.set(0, 0)
        root.rotation.set(0, 0, 0)
        previousReset = settings.reset
      }
      if (settings.burst !== previousBurst) {
        uniforms.uBurst.value = 1
        previousBurst = settings.burst
      } else if (animate) {
        uniforms.uBurst.value *= Math.exp(-delta * 1.4)
      }

      if (animate) elapsed += delta * (0.2 + settings.energy * 1.4)
      uniforms.uTime.value = elapsed
      uniforms.uEnergy.value = settings.energy
      uniforms.uPointer.value.lerp(pointer, animate ? 0.07 : 1)
      flux.visible = settings.mode === 'flux'
      swarm.visible = settings.mode === 'swarm'
      terrain.visible = settings.mode === 'terrain'
      sculpture.rotation.y = 0.3 + elapsed * 0.13
      sculpture.rotation.z = -0.4 + Math.sin(elapsed * 0.18) * 0.16
      orbit.rotation.z = 0.28 - elapsed * 0.04
      swarm.rotation.z = elapsed * 0.025
      root.rotation.y = uniforms.uPointer.value.x * 0.14
      root.rotation.x = -uniforms.uPointer.value.y * 0.09

      try {
        renderer.render(scene, camera)
      } catch (error) {
        console.error('Unable to render the 18HRSHIFT visual experiment.', error)
        unavailable()
        return
      }
      if (!ready && !failed) {
        ready = true
        setStatus('ready')
        settingsRef.current.onStatus?.('ready')
      }
      if (animate && !failed) frame = requestAnimationFrame(draw)
      else lastTime = 0
    }

    const requestFrame = () => {
      if (!disposed && !failed && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw)
    }
    frameRef.current = requestFrame

    const resize = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.position.z = camera.aspect < 1 ? 9.2 : variant === 'hero' ? 7.3 : 7.5
      camera.updateProjectionMatrix()
      requestFrame()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) requestFrame()
      else stop()
    }, { threshold: 0.01 })
    observer.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) stop()
      else requestFrame()
    }
    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
        -((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
      )
      requestFrame()
    }
    const onPointerLeave = () => { pointer.set(0, 0); requestFrame() }
    const onMotionChange = () => { stop(); requestFrame() }
    const onContextLost = (event: Event) => { event.preventDefault(); unavailable() }
    document.addEventListener('visibilitychange', onVisibility)
    canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('webglcontextlost', onContextLost)
    motionQuery.addEventListener('change', onMotionChange)

    return () => {
      disposed = true
      stop()
      frameRef.current = () => {}
      observer.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      motionQuery.removeEventListener('change', onMotionChange)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
      // Keep the canvas context reusable for React Strict Mode's effect replay.
      // Geometry, materials, and renderer caches have all been disposed above.
    }
  }, [variant])

  return (
    <div className={`lab-scene lab-scene--${variant}`} data-scene-status={status} data-scene-mode={mode}>
      <canvas
        ref={canvasRef}
        className="lab-scene-canvas"
        role="img"
        aria-hidden={status !== 'ready'}
        aria-label={`${mode === 'flux' ? 'Liquid chrome sculpture' : mode === 'swarm' ? 'Interactive particle sphere' : 'Procedural wireframe landscape'}, rendered in real time`}
        style={{ opacity: status === 'ready' ? 1 : 0 }}
      />
      {status !== 'ready' && (
        <div className="lab-scene-fallback" aria-hidden="true">
          <svg viewBox="0 0 500 500" fill="none">
            {Array.from({ length: 18 }, (_, index) => (
              <ellipse key={index} cx="250" cy="250" rx="170" ry="75" transform={`rotate(${index * 10} 250 250)`} />
            ))}
          </svg>
        </div>
      )}
      {status === 'unavailable' && (
        <span className="lab-scene-unavailable" role="status">Static preview · interactive 3D is unavailable in this browser.</span>
      )}
    </div>
  )
}
