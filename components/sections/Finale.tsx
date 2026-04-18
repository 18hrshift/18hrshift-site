'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PARTICLE_COUNT = 22_000

// ── Background plasma ──────────────────────────────────────────────────────

const bgVert = /* glsl */`void main() { gl_Position = vec4(position, 1.0); }`

const bgFrag = /* glsl */`
  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uProgress;

  vec3 hsv(float h, float s, float v) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
    return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p  = (uv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);

    float t = uTime * 0.22;
    float v = sin(p.x * 1.8 + t)       * sin(p.y * 1.8 + t * 1.3)
            + sin(length(p) * 3.2 - t * 2.1) * 0.6
            + sin((p.x - p.y) * 1.4 + t * 0.55) * 0.4;

    float hue   = v * 0.18 + uTime * 0.055 + uProgress * 0.4;
    float superP = clamp((uProgress - 0.70) / 0.30, 0.0, 1.0);
    float bright = 0.06 + superP * superP * 0.22;
    vec3  col    = hsv(mod(hue, 1.0), 0.9, bright);

    // Radial pulse during supernova
    float ring = abs(length(p) - superP * 3.5);
    col += hsv(mod(hue + 0.5, 1.0), 1.0, smoothstep(0.12, 0.0, ring) * superP * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`

// ── Particles ──────────────────────────────────────────────────────────────

const ptVert = /* glsl */`
  attribute vec3  aInitPos;
  attribute float aOffset;
  attribute float aId;

  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uMouse;

  varying vec3  vColor;
  varying float vAlpha;

  vec3 hsv(float h, float s, float v) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
    return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
  }

  float easeOut(float t) { return t * (2.0 - t); }
  float easeIn(float t)  { return t * t * t; }

  void main() {
    float impP   = clamp((uProgress - 0.40) / 0.30, 0.0, 1.0);
    float superP = clamp((uProgress - 0.70) / 0.30, 0.0, 1.0);

    // --- CHAOS ---
    vec3  dir  = normalize(aInitPos);
    float az   = atan(dir.z, dir.x) + uTime * (0.10 + aOffset * 0.18);
    float el   = asin(clamp(dir.y, -0.999, 0.999));
    float r    = length(aInitPos) * (0.88 + sin(uTime * 0.85 + aOffset * 6.283) * 0.12);
    vec3  chaos = vec3(
      r * cos(el) * cos(az),
      r * sin(el),
      r * cos(el) * sin(az)
    );

    // Mouse gravity (chaos only)
    float mDist = length(uMouse - chaos.xy);
    float pull  = smoothstep(2.8, 0.0, mDist) * (1.0 - impP) * 0.5;
    chaos.xy   += normalize(uMouse - chaos.xy + 0.001) * pull;

    // --- IMPLOSION (vortex spiral) ---
    float iEase = easeIn(impP);
    float sAngle = az + iEase * 18.0;   // 9 full spiral rotations
    float sR     = r * (1.0 - iEase);
    float sEl    = el * (1.0 - iEase * 0.8);
    vec3  implode = vec3(
      sR * cos(sEl) * cos(sAngle),
      sR * sin(sEl),
      sR * cos(sEl) * sin(sAngle)
    );

    // --- SUPERNOVA ---
    float sEase   = easeOut(superP);
    float explodeR = sEase * (4.0 + aOffset * 4.5);
    vec3  explode  = dir * explodeR;

    // --- BLEND ---
    vec3 pos;
    if (uProgress < 0.40) {
      pos = chaos;
    } else if (uProgress < 0.70) {
      pos = mix(chaos, implode, iEase);
    } else {
      pos = mix(vec3(0.0), explode, sEase * (0.6 + aOffset * 0.4));
    }

    // --- COLOR: full-spectrum rainbow, cycling ---
    float hue = mod(aId * 3.0 + uTime * 0.20 + superP * 1.2, 1.0);
    float sat = 1.0;
    float val = 1.0;
    vColor = hsv(hue, sat, val);

    // --- ALPHA ---
    float distFade = 1.0 - clamp(length(pos) / 8.5, 0.0, 1.0);
    float impBright = 1.0 + iEase * 0.8;
    vAlpha = 0.75 * distFade * impBright * (0.5 + 0.5 * (1.0 - superP * 0.4));

    // --- SIZE ---
    float sz = 2.2 + iEase * iEase * 5.0;         // swells during implosion
    sz = mix(sz, 2.5 + aOffset * 1.5, superP);     // normalises during explosion

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = sz;
    gl_Position  = projectionMatrix * mv;
  }
`

const ptFrag = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float r  = length(uv);
    if (r > 0.5) discard;
    float alpha = (1.0 - r * 2.0) * vAlpha;
    alpha = pow(alpha, 1.3);
    gl_FragColor = vec4(vColor, alpha);
  }
`

export function Finale() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const labelRef   = useRef<HTMLDivElement>(null)
  const textRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    const textEl  = textRef.current
    if (!canvas || !section || !textEl) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio, 2)

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false })
    renderer.setPixelRatio(dpr)
    renderer.setSize(W, H, false)
    renderer.autoClear = false

    // ── Background scene (orthographic fullscreen quad) ──────────
    const bgScene    = new THREE.Scene()
    const bgCamera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const bgUniforms = {
      uResolution: { value: new THREE.Vector2(W * dpr, H * dpr) },
      uTime:       { value: 0 },
      uProgress:   { value: 0 },
    }
    const bgMat  = new THREE.ShaderMaterial({ vertexShader: bgVert, fragmentShader: bgFrag, uniforms: bgUniforms })
    const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat)
    bgScene.add(bgMesh)

    // ── Particle scene ────────────────────────────────────────────
    const ptScene  = new THREE.Scene()
    const ptCamera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100)
    ptCamera.position.set(0, 0, 7)

    // Build attributes
    const initPos = new Float32Array(PARTICLE_COUNT * 3)
    const offsets = new Float32Array(PARTICLE_COUNT)
    const ids     = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Uniform sphere distribution
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 1.5 + Math.random() * 1.8
      initPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      initPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      initPos[i * 3 + 2] = r * Math.cos(phi)
      offsets[i] = Math.random()
      ids[i]     = i / PARTICLE_COUNT
    }

    const ptGeo = new THREE.BufferGeometry()
    ptGeo.setAttribute('position',  new THREE.BufferAttribute(initPos.slice(), 3))
    ptGeo.setAttribute('aInitPos',  new THREE.BufferAttribute(initPos, 3))
    ptGeo.setAttribute('aOffset',   new THREE.BufferAttribute(offsets, 1))
    ptGeo.setAttribute('aId',       new THREE.BufferAttribute(ids, 1))

    const ptUniforms = {
      uTime:     { value: 0 },
      uProgress: { value: 0 },
      uMouse:    { value: new THREE.Vector2(0, 0) },
    }
    const ptMat = new THREE.ShaderMaterial({
      vertexShader:   ptVert,
      fragmentShader: ptFrag,
      uniforms:       ptUniforms,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    })
    const points = new THREE.Points(ptGeo, ptMat)
    ptScene.add(points)

    // ── ScrollTrigger ─────────────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.8,
      onUpdate: (self) => {
        const p = self.progress
        ptUniforms.uProgress.value = p
        bgUniforms.uProgress.value = p

        // Text fades in during supernova peak
        const textOpacity = Math.max(0, (p - 0.72) / 0.18)
        textEl.style.opacity = String(Math.min(textOpacity, 1))

        // Fade entire canvas to bg colour as section ends (last 8%)
        const fadeOut = Math.max(0, (p - 0.92) / 0.08)
        canvas.style.opacity = String(1 - fadeOut)
      },
    })

    // ── Mouse → world XY ─────────────────────────────────────────
    const targetMouse = new THREE.Vector2()
    const _v3 = new THREE.Vector3()

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2
      _v3.set(nx, ny, 0.5).unproject(ptCamera)
      const dir = _v3.sub(ptCamera.position).normalize()
      const t   = -ptCamera.position.z / dir.z
      targetMouse.set(
        ptCamera.position.x + dir.x * t,
        ptCamera.position.y + dir.y * t,
      )
    }

    const onResize = () => {
      const w   = canvas.clientWidth
      const h   = canvas.clientHeight
      const d   = Math.min(window.devicePixelRatio, 2)
      renderer.setSize(w, h, false)
      bgUniforms.uResolution.value.set(w * d, h * d)
      ptCamera.aspect = w / h
      ptCamera.updateProjectionMatrix()
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize',    onResize,    { passive: true })

    // ── RAF ───────────────────────────────────────────────────────
    let raf: number
    let elapsed = 0
    let running = false

    const observer = new IntersectionObserver(
      ([e]) => { running = e.isIntersecting },
      { threshold: 0.01 },
    )
    observer.observe(section)

    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!running) return
      elapsed += 0.016

      bgUniforms.uTime.value = elapsed
      ptUniforms.uTime.value = elapsed

      // Smooth mouse
      const mu = ptUniforms.uMouse.value
      mu.x += (targetMouse.x - mu.x) * 0.05
      mu.y += (targetMouse.y - mu.y) * 0.05

      // Camera: slow drift during chaos, locks steady during explosion
      const p      = ptUniforms.uProgress.value
      const superP = Math.max(0, (p - 0.70) / 0.30)
      const orbit  = elapsed * 0.06 * (1 - Math.min(superP * 2, 1))
      ptCamera.position.x = Math.sin(orbit) * 0.8
      ptCamera.position.y = Math.cos(orbit * 0.7) * 0.4
      ptCamera.lookAt(0, 0, 0)

      renderer.clear()
      renderer.render(bgScene, bgCamera)
      renderer.clearDepth()
      renderer.render(ptScene, ptCamera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
      st.kill()
      ptGeo.dispose(); ptMat.dispose()
      bgMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="finale"
      className="relative h-[400vh] bg-bg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Label */}
        <div className="absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <span className="font-mono text-[9px] text-muted tracking-[0.5em] uppercase">
            CHROMATIC_SUPERNOVA // FINALE
          </span>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Supernova text — appears during explosion phase */}
        <div
          ref={textRef}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
        >
          <h2 className="font-display font-black text-[clamp(2rem,6vw,7rem)] leading-none tracking-tighter text-ink uppercase text-center select-none"
            style={{
              textShadow: `
                0 0 40px #00BFFF,
                0 0 80px #FF2D78,
                0 0 120px #00BFFF
              `,
            }}
          >
            OUTPUT IS<br />THE ONLY<br />METRIC.
          </h2>
        </div>

        {/* Scroll cue — only at start */}
        <div ref={labelRef} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
          <span className="font-mono text-[9px] text-muted/50 tracking-[0.4em]">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-blue/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
