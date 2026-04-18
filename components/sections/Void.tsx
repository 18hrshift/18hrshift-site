'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const vertexShader = /* glsl */`
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  uniform vec2  uResolution;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uProgress;

  #define MAX_STEPS 120
  #define MAX_DIST  18.0
  #define EPSILON   0.0008

  mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  float sdTorus(vec3 p, float r1, float r2) {
    vec2 q = vec2(length(p.xz) - r1, p.y);
    return length(q) - r2;
  }

  float sdGyroid(vec3 p, float scale, float thick) {
    p *= scale;
    return (abs(dot(sin(p), cos(p.yzx))) - thick) / scale;
  }

  float sdSphere(vec3 p, float r) {
    return length(p) - r;
  }

  // Torus knot approximation via twisted tori
  float sdKnot(vec3 p) {
    float t   = uTime * 0.14;
    vec3  q   = p;
    q.xz = rot2(t * 0.7) * q.xz;
    q.xy = rot2(t * 0.5) * q.xy;

    float a = sdTorus(q, 0.90, 0.32);

    vec3 q2 = p;
    q2.yz = rot2(t * 0.9 + 1.57) * q2.yz;
    q2.xz = rot2(t * 0.3) * q2.xz;
    float b = sdTorus(q2, 0.70, 0.22);

    // Soft min blend
    float k = 0.35;
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float sdVoid(vec3 p) {
    float t = uTime * 0.22;
    p.xz = rot2(t * 0.55) * p.xz;
    p.yz = rot2(t * 0.38) * p.yz;

    float knot = sdKnot(p);

    // Gyroid bounded by sphere
    float gy  = sdGyroid(p, 2.8, 0.055);
    float sph = sdSphere(p, 1.55);
    float gyrObj = max(gy, sph);

    // Smooth morph between knot and gyroid
    float k = 0.28;
    float blend = smoothstep(0.0, 1.0, uProgress);
    float h = clamp(0.5 + 0.5 * (gyrObj - knot) / k, 0.0, 1.0);
    float blended = mix(gyrObj, knot, h) - k * h * (1.0 - h);
    return mix(knot, blended, blend);
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    return normalize(vec3(
      sdVoid(p + e.xyy) - sdVoid(p - e.xyy),
      sdVoid(p + e.yxy) - sdVoid(p - e.yxy),
      sdVoid(p + e.yyx) - sdVoid(p - e.yyx)
    ));
  }

  float calcAO(vec3 p, vec3 n) {
    float ao = 0.0;
    float sc = 1.0;
    for (int i = 1; i <= 6; i++) {
      float h  = float(i) * 0.11;
      ao += sc * (h - sdVoid(p + n * h));
      sc *= 0.5;
    }
    return clamp(1.0 - 2.2 * ao, 0.0, 1.0);
  }

  float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t   = mint;
    for (int i = 0; i < 32; i++) {
      float h = sdVoid(ro + rd * t);
      if (h < EPSILON) return 0.0;
      res = min(res, k * h / t);
      t  += clamp(h, 0.02, 0.3);
      if (t > maxt) break;
    }
    return res;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;

    // Camera — mouse-driven orbit
    float camYaw   = uMouse.x * 0.55;
    float camPitch = uMouse.y * 0.28;
    vec3 ro = vec3(0.0, 0.0, 3.8);
    ro.xz = rot2(camYaw)   * ro.xz;
    ro.yz = rot2(-camPitch) * ro.yz;

    vec3 target  = vec3(0.0);
    vec3 forward = normalize(target - ro);
    vec3 right   = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up      = cross(forward, right);
    vec3 rd      = normalize(forward + uv.x * right + uv.y * up);

    // Raymarch
    float t   = 0.1;
    bool  hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
      float d = sdVoid(ro + rd * t);
      if (d < EPSILON) { hit = true; break; }
      if (t > MAX_DIST)  break;
      t += d * 0.85;
    }

    // Background: deep void with faint volumetric haze
    vec3 bgCol = vec3(0.018, 0.012, 0.025);
    // Subtle star-noise in bg
    vec2 st    = gl_FragCoord.xy / uResolution;
    float star = fract(sin(dot(floor(st * 180.0), vec2(127.1, 311.7))) * 43758.5453);
    bgCol     += step(0.995, star) * 0.06 * vec3(0.6, 0.8, 1.0);

    vec3 col = bgCol;

    if (hit) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      float ao = calcAO(p, n);

      // Lights
      vec3 lDir  = normalize(vec3(1.8, 2.5, -1.2));
      vec3 lDir2 = normalize(vec3(-1.5, -0.5, 2.0));
      float diff  = max(dot(n, lDir), 0.0);
      float diff2 = max(dot(n, lDir2), 0.0) * 0.35;
      float sha   = softShadow(p + n * 0.01, lDir, 0.1, 6.0, 12.0);
      float spec  = pow(max(dot(reflect(-lDir, n), -rd), 0.0), 32.0);
      float rim   = pow(1.0 - max(dot(-rd, n), 0.0), 4.0);
      float fres  = pow(1.0 - abs(dot(n, -rd)), 3.0);

      // Palette — morphs blue → magenta with scroll
      vec3 blueHi    = vec3(0.00, 0.75, 1.00);
      vec3 magHi     = vec3(1.00, 0.18, 0.47);
      vec3 blueLo    = vec3(0.00, 0.18, 0.35);
      vec3 magLo     = vec3(0.30, 0.04, 0.12);
      float p01      = smoothstep(0.0, 1.0, uProgress);
      vec3 hiCol     = mix(blueHi, magHi, p01);
      vec3 loCol     = mix(blueLo, magLo, p01);

      // Normal-mapped color gradient
      float facing = dot(n, vec3(0.0, 1.0, 0.5)) * 0.5 + 0.5;
      vec3 surfCol = mix(loCol, hiCol, facing);

      col  = surfCol * (diff * sha * 0.85 + diff2 + 0.12) * ao;
      col += hiCol * spec * sha * 0.6;
      col += hiCol * rim  * 0.5 * ao;
      col += hiCol * fres * 0.15;
    }

    // Distance glow — object halo bleeds into void
    {
      float minD = MAX_DIST;
      float gt   = 0.1;
      for (int i = 0; i < 48; i++) {
        float d = sdVoid(ro + rd * gt);
        minD = min(minD, d);
        gt  += max(d * 0.6, 0.04);
        if (gt > MAX_DIST) break;
      }
      vec3 glowCol = mix(vec3(0.0, 0.45, 0.8), vec3(0.7, 0.1, 0.35), smoothstep(0.0, 1.0, uProgress));
      col += glowCol * 0.018 / (minD * minD + 0.01);
    }

    // Depth fog
    float fog = 1.0 - exp(-t * 0.055);
    col = mix(col, bgCol, fog * 0.55);

    // Vignette
    vec2 vUV = gl_FragCoord.xy / uResolution;
    float vign = 1.0 - dot((vUV - 0.5) * 1.6, (vUV - 0.5) * 1.6);
    col *= smoothstep(0.0, 1.0, vign);

    // Filmic tone map + gamma
    col  = col * (2.51 * col + 0.03) / (col * (2.43 * col + 0.59) + 0.14);
    col  = pow(clamp(col, 0.0, 1.0), vec3(0.4545));

    gl_FragColor = vec4(col, 1.0);
  }
`

export function Void() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const W = canvas.clientWidth
    const H = canvas.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H, false)

    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      uResolution: { value: new THREE.Vector2(W * Math.min(window.devicePixelRatio, 1.5), H * Math.min(window.devicePixelRatio, 1.5)) },
      uTime:       { value: 0 },
      uMouse:      { value: new THREE.Vector2(0, 0) },
      uProgress:   { value: 0 },
    }

    const mat  = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    scene.add(mesh)

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.6,
      onUpdate: (self) => { uniforms.uProgress.value = self.progress },
    })

    const targetMouse = new THREE.Vector2(0, 0)

    const onMouseMove = (e: MouseEvent) => {
      targetMouse.set(
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      )
    }

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      uniforms.uResolution.value.set(w * dpr, h * dpr)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize',    onResize,    { passive: true })

    let raf: number
    let elapsed = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      elapsed += 0.016
      uniforms.uTime.value = elapsed

      const mu = uniforms.uMouse.value
      mu.x += (targetMouse.x - mu.x) * 0.04
      mu.y += (targetMouse.y - mu.y) * 0.04

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
      st.kill()
      mat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="void"
      className="relative h-[250vh] bg-bg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
          <span className="font-mono text-[9px] text-muted tracking-[0.5em] uppercase">
            WOW_02 // VOID
          </span>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
          <span className="font-mono text-[9px] text-muted/50 tracking-[0.4em]">SCROLL TO MORPH</span>
          <div className="w-px h-8 bg-gradient-to-b from-magenta/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}
