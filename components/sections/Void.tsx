'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TEXT = '18HRSHIFT'
const TEXT_WW = 7.2   // world width of the wordmark
const TEXT_HW = TEXT_WW * (256 / 1024)
const DEPTH   = 0.32  // half-thickness of the extruded letters
const SDF_SUPPORT = 8 // px range of the SDF texture

// ---------------------------------------------------------------------------

// 1D squared-Euclidean-distance transform (Felzenszwalb–Huttenlocher).
function edt1D(f: number[]): Float32Array {
  const n = f.length
  const d = new Float32Array(n)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  let k = 0
  v[0] = 0; z[0] = -1e30; z[1] = 1e30
  for (let q = 1; q < n; q++) {
    let s: number
    while (true) {
      const vq = v[k]
      s = ((f[q] + q * q) - (f[vq] + vq * vq)) / (2 * (q - vq))
      if (s <= z[k]) { k-- } else break
    }
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = 1e30
  }
  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    const w = q - v[k]
    d[q] = w * w + f[v[k]]
  }
  return d
}

// Build a signed distance field of the wordmark (union of all glyphs).
function buildTextSDF(): THREE.DataTexture {
  const W = 1024, H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-barlow-condensed').trim() || 'sans-serif'
  ctx.fillStyle = '#fff'
  ctx.font = `800 ${H * 0.86}px ${fontFamily}, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(TEXT, W / 2, H / 2)

  const { data } = ctx.getImageData(0, 0, W, H)
  const INF = 1e9
  const fg = new Float32Array(W * H)
  const bg = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    const inside = data[i * 4 + 3] > 128
    fg[i] = inside ? 0 : INF
    bg[i] = inside ? INF : 0
  }

  const dt2 = (f: Float32Array): Float32Array => {
    const colPass = new Float32Array(W * H)
    const row = new Array<number>(W)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) row[x] = f[y * W + x]
      const r = edt1D(row)
      for (let x = 0; x < W; x++) colPass[y * W + x] = r[x]
    }
    const out = new Float32Array(W * H)
    const col = new Array<number>(H)
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) col[y] = colPass[y * W + x]
      const r = edt1D(col)
      for (let y = 0; y < H; y++) out[y * W + x] = r[y]
    }
    return out
  }

  const dfg2 = dt2(fg)
  const dbg2 = dt2(bg)
  const tex = new Uint8Array(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    const x = i % W
    const y = (i / W) | 0                 // 0 = top of the rendered text
    const dIn  = Math.sqrt(dfg2[i])
    const dOut = Math.sqrt(dbg2[i])
    const sdf  = dIn - dOut               // <0 inside, >0 outside
    const v    = Math.round(THREE.MathUtils.clamp((sdf + SDF_SUPPORT) / (2 * SDF_SUPPORT), 0, 1) * 255)
    // Write bottom-first so that with flipY=false, texture v=0 is the bottom
    // of the wordmark → a positive world-Y maps to a rising v (upright, unmirrored).
    const dst = ((H - 1 - y) * W + x) * 4
    tex[dst + 0] = v
    tex[dst + 1] = v
    tex[dst + 2] = v
    tex[dst + 3] = 255
  }

  const dtex = new THREE.DataTexture(tex, W, H, THREE.RGBAFormat)
  dtex.flipY = false
  dtex.minFilter = THREE.LinearFilter
  dtex.magFilter = THREE.LinearFilter
  dtex.needsUpdate = true
  return dtex
}

// ---------------------------------------------------------------------------

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
  uniform sampler2D uTextSDF;
  uniform float uRWorld;
  uniform float uTextWw;
  uniform float uTextHw;
  uniform float uDepth;

  #define MAX_STEPS 80
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

    float k = 0.35;
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // The abstract liquid — morphs knot ↔ gyroid as uProgress rises
  float sdLiquid(vec3 p) {
    float t = uTime * 0.22;
    p.xz = rot2(t * 0.55) * p.xz;
    p.yz = rot2(t * 0.38) * p.yz;

    float knot = sdKnot(p);

    float gy  = sdGyroid(p, 2.8, 0.08);
    float sph = sdSphere(p, 1.55);
    float gyrObj = max(gy, sph);

    float k = 0.28;
    float blend = smoothstep(0.0, 1.0, uProgress);
    float h = clamp(0.5 + 0.5 * (gyrObj - knot) / k, 0.0, 1.0);
    float blended = mix(gyrObj, knot, h) - k * h * (1.0 - h);
    return mix(knot, blended, blend);
  }

  // Extruded wordmark as an SDF (letters + slab-thickness in z)
  float sdText(vec3 p) {
    p.x = -p.x; // texture row-major + bottom-first buffers read mirrored; flip to face the viewer
    vec2 hw  = vec2(0.5 * uTextWw, 0.5 * uTextHw);
    float boxd = length(max(abs(p.xy) - hw, vec2(0.0)));
    vec2 uv   = (p.xy + hw) / vec2(uTextWw, uTextHw);
    float d01  = texture(uTextSDF, uv).r;
    float d2d  = (d01 - 0.5) * 2.0 * uRWorld;
    float extr = max(d2d, abs(p.z) - uDepth);
    return max(extr, boxd);
  }

  // Morph from liquid → wordmark as you scroll
  float sdScene(vec3 p) {
    float liq = sdLiquid(p);
    if (uProgress < 0.02) return liq;
    float txt = sdText(p);
    float f   = smoothstep(0.35, 0.95, uProgress);
    return mix(liq, txt, f);
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    return normalize(vec3(
      sdScene(p + e.xyy) - sdScene(p - e.xyy),
      sdScene(p + e.yxy) - sdScene(p - e.yxy),
      sdScene(p + e.yyx) - sdScene(p - e.yyx)
    ));
  }

  float calcAO(vec3 p, vec3 n) {
    float ao = 0.0;
    float sc = 1.0;
    for (int i = 1; i <= 6; i++) {
      float h  = float(i) * 0.11;
      ao += sc * (h - sdScene(p + n * h));
      sc *= 0.5;
    }
    return clamp(1.0 - 2.2 * ao, 0.0, 1.0);
  }

  float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t   = mint;
    for (int i = 0; i < 16; i++) {
      float h = sdScene(ro + rd * t);
      if (h < EPSILON) return 0.0;
      res = min(res, k * h / t);
      t  += clamp(h, 0.02, 0.3);
      if (t > maxt) break;
    }
    return res;
  }

  void main() {
    vec2 baseUV = (gl_FragCoord.xy - uResolution * 0.5) / uResolution.y;
    vec2 offset = vec2(0.35, -0.35) / uResolution.y;

    vec3 col = vec3(0.0);
    for (int s = 0; s < 2; s++) {
      vec2 uvo = s == 0 ? baseUV : baseUV + offset;

      float camYaw   = uMouse.x * 0.5;
      float camPitch = uMouse.y * 0.26;
      vec3 ro = vec3(0.0, 0.0, 3.8);
      ro.xz = rot2(camYaw)   * ro.xz;
      ro.yz = rot2(-camPitch) * ro.yz;

      vec3 target  = vec3(0.0);
      vec3 forward = normalize(target - ro);
      vec3 right   = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
      vec3 up      = cross(forward, right);
      vec3 rd      = normalize(forward + uvo.x * right + uvo.y * up);

      float t   = 0.1;
      bool  hit = false;
      for (int i = 0; i < MAX_STEPS; i++) {
        float d = sdScene(ro + rd * t);
        if (d < EPSILON) { hit = true; break; }
        if (t > MAX_DIST)  break;
        t += d * 0.85;
      }

      vec3 bgCol = vec3(0.018, 0.012, 0.025);
      vec2 st    = gl_FragCoord.xy / uResolution;
      float star = fract(sin(dot(floor(st * 180.0), vec2(127.1, 311.7))) * 43758.5453);
      bgCol     += step(0.995, star) * 0.06 * vec3(0.6, 0.8, 1.0);

      vec3 sc = bgCol;

      if (hit) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        float ao = calcAO(p, n);
        float f  = smoothstep(0.35, 0.95, uProgress);

        vec3 lDir  = normalize(vec3(1.8, 2.5, -1.2));
        vec3 lDir2 = normalize(vec3(-1.5, -0.5, 2.0));
        float diff  = max(dot(n, lDir), 0.0);
        float diff2 = max(dot(n, lDir2), 0.0) * 0.35;
        float sha   = softShadow(p + n * 0.01, lDir, 0.1, 6.0, 12.0);
        float spec  = pow(max(dot(reflect(-lDir, n), -rd), 0.0), 32.0);
        float rim   = pow(1.0 - max(dot(-rd, n), 0.0), 4.0);
        float fres  = pow(1.0 - abs(dot(n, -rd)), 3.0);

        vec3 blueHi = vec3(0.00, 0.75, 1.00);
        vec3 magHi  = vec3(1.00, 0.18, 0.47);
        vec3 blueLo = vec3(0.00, 0.18, 0.35);
        vec3 magLo  = vec3(0.30, 0.04, 0.12);
        float p01   = smoothstep(0.0, 1.0, uProgress);
        vec3 hiCol  = mix(blueHi, magHi, p01);
        vec3 loCol  = mix(blueLo, magLo, p01);

        float facing = dot(n, vec3(0.0, 1.0, 0.5)) * 0.5 + 0.5;
        vec3 surfCol = mix(loCol, hiCol, facing);

        sc  = surfCol * (diff * sha * 0.85 + diff2 + 0.12) * ao;
        // Lift the wordmark so letters stay readable as they form
        sc += surfCol * (0.55 * f);
        sc += hiCol * spec * sha * 0.6;
        sc += hiCol * rim  * (0.5 + p01 * 0.6) * ao;
        sc += hiCol * fres * 0.15;
      }

      // Distance glow — traces through the merged scene
      {
        float minD = MAX_DIST;
        float gt   = 0.1;
        for (int i = 0; i < 30; i++) {
          float d = sdScene(ro + rd * gt);
          minD = min(minD, d);
          gt  += max(d * 0.6, 0.04);
          if (gt > MAX_DIST) break;
        }
        vec3 glowCol = mix(vec3(0.0, 0.45, 0.8), vec3(0.7, 0.1, 0.35), smoothstep(0.0, 1.0, uProgress));
        sc += glowCol * 0.018 / (minD * minD + 0.01);
      }

      float fog = 1.0 - exp(-t * 0.055);
      sc = mix(sc, bgCol, fog * 0.55);

      col += s == 0 ? sc : sc;   // sum; averaged below
    }
    col *= 0.5;

    vec2 vUV = gl_FragCoord.xy / uResolution;
    float vign = 1.0 - dot((vUV - 0.5) * 1.6, (vUV - 0.5) * 1.6);
    col *= smoothstep(0.0, 1.0, vign);

    col  = col * (2.51 * col + 0.03) / (col * (2.43 * col + 0.59) + 0.14);
    col  = pow(clamp(col, 0.0, 1.0), vec3(0.4545));

    gl_FragColor = vec4(col, 1.0);
  }
`

// ---------------------------------------------------------------------------

export function Void() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    let disposed = false
    let sdfTex: THREE.DataTexture | null = null
    let cleanup = () => {}

    document.fonts.ready.then(() => {
      if (disposed) return

      const W = canvas.clientWidth
      const H = canvas.clientHeight
      const dprVoid = Math.min(window.devicePixelRatio, 1.0)
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false })
      renderer.setPixelRatio(dprVoid)
      renderer.setSize(W, H, false)

      const scene  = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      sdfTex = buildTextSDF()

      const uniforms = {
        uResolution: { value: new THREE.Vector2(W * dprVoid, H * dprVoid) },
        uTime:       { value: 0 },
        uMouse:      { value: new THREE.Vector2(0, 0) },
        uProgress:   { value: 0 },
        uTextSDF:    { value: sdfTex },
        uRWorld:     { value: (SDF_SUPPORT * TEXT_WW) / 1024 },
        uTextWw:     { value: TEXT_WW },
        uTextHw:     { value: TEXT_HW },
        uDepth:      { value: DEPTH },
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
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        renderer.setSize(w, h, false)
        uniforms.uResolution.value.set(w * dprVoid, h * dprVoid)
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true })
      window.addEventListener('resize',    onResize,    { passive: true })

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

        const mu = uniforms.uMouse.value
        mu.x += (targetMouse.x - mu.x) * 0.04
        mu.y += (targetMouse.y - mu.y) * 0.04

        renderer.render(scene, camera)
      }

      const observer = new IntersectionObserver(
        ([e]) => { running = e.isIntersecting },
        { threshold: 0.01 },
      )
      observer.observe(section)
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        cancelAnimationFrame(raf)
        observer.disconnect()
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize',    onResize)
        st.kill()
        mat.dispose()
        renderer.dispose()
        if (sdfTex) sdfTex.dispose()
      }
    })

    return () => {
      disposed = true
      cleanup()
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
          <span className="font-mono text-[9px] text-muted/50 tracking-[0.4em]">SCROLL TO CONVERGE · FORMS 18HRSHIFT</span>
          <div className="w-px h-8 bg-gradient-to-b from-magenta/40 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  )
}