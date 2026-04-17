'use client'

import { useEffect, useRef, useState } from 'react'

/* ── Panel chrome ──────────────────────────────────────── */
function Panel({
  title,
  status,
  children,
}: {
  title: string
  status: string
  children: React.ReactNode
}) {
  return (
    <div className="group relative bg-bg border border-surface2 flex flex-col overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface border-b border-surface2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-magenta" />
        <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
        <span className="font-mono text-[9px] text-muted tracking-[0.3em] ml-2">{title}</span>
      </div>
      {/* Content */}
      <div className="flex-1 relative min-h-[220px]">{children}</div>
      {/* Status bar */}
      <div className="px-3 py-1.5 bg-surface border-t border-surface2 font-mono text-[8px] text-muted tracking-[0.25em] shrink-0">
        {status}
      </div>
    </div>
  )
}

/* ── WAVEFORM :: Analog oscilloscope ───────────────────── */
function WaveformPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const { width, height } = canvas
      const t = tRef.current

      // Ghost trail for phosphor persistence
      ctx.fillStyle = 'rgba(5, 5, 8, 0.18)'
      ctx.fillRect(0, 0, width, height)

      // Dim center line
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0,191,255,0.1)'
      ctx.lineWidth = 1
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Composite wave: fundamental + 2nd + 3rd harmonic
      ctx.beginPath()
      ctx.strokeStyle = '#00BFFF'
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 12
      ctx.shadowColor = '#00BFFF'

      for (let x = 0; x < width; x++) {
        const nx = x / width
        const y =
          height / 2 +
          Math.sin(nx * Math.PI * 6 + t) * (height * 0.18) +
          Math.sin(nx * Math.PI * 12 + t * 1.7) * (height * 0.07) +
          Math.sin(nx * Math.PI * 3 + t * 0.5) * (height * 0.09)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      tRef.current += 0.035
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <Panel title="WAVEFORM :: ANALOG" status="FREQ: 432Hz // AMP: 0.87 // PHASE: CONTINUOUS">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </Panel>
  )
}

/* ── STREAM :: Hex memory dump ─────────────────────────── */
function StreamPanel() {
  const [lines, setLines] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const genLine = () => {
      const addr = Math.floor(Math.random() * 0xffff)
        .toString(16)
        .padStart(4, '0')
        .toUpperCase()
      const bytes = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
          .toUpperCase(),
      ).join(' ')
      const ascii = Array.from({ length: 16 }, () => {
        const c = Math.floor(Math.random() * 94) + 33
        return String.fromCharCode(c)
      }).join('')
      return `${addr}  ${bytes}  ${ascii}`
    }

    setLines(Array.from({ length: 12 }, genLine))

    const interval = setInterval(() => {
      setLines((prev) => [genLine(), ...prev.slice(0, 11)])
    }, 140)

    return () => clearInterval(interval)
  }, [])

  return (
    <Panel
      title="STREAM :: SECTOR 0xF7A2"
      status="ADDR: 0x7F3C // RATE: 7.2MB/s // MODE: READ"
    >
      <div className="absolute inset-0 overflow-hidden p-3">
        {mounted &&
          lines.map((line, i) => (
            <div
              key={i}
              className="font-mono text-[8px] leading-5 whitespace-pre"
              style={{
                color: i === 0 ? '#FF2D78' : `rgba(68, 68, 88, ${1 - i * 0.07})`,
                transition: 'color 0.3s ease',
              }}
            >
              {line}
            </div>
          ))}
      </div>
    </Panel>
  )
}

/* ── FIELD :: Clifford strange attractor ───────────────── */
function FieldPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef({ x: 0.1, y: 0.1, iter: 0 })
  const [iter, setIter] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const a = -1.4
    const b = 1.6
    const c = 1.0
    const d = 0.7

    let animating = true

    const draw = () => {
      if (!animating) return
      const { width, height } = canvas
      const cx = width / 2
      const cy = height / 2
      const s = Math.min(width, height) * 0.38

      ctx.fillStyle = 'rgba(0, 191, 255, 0.6)'

      for (let i = 0; i < 200; i++) {
        const { x, y } = stateRef.current
        const nx = Math.sin(a * y) + c * Math.cos(a * x)
        const ny = Math.sin(b * x) + d * Math.cos(b * y)
        stateRef.current.x = nx
        stateRef.current.y = ny
        stateRef.current.iter++

        const px = cx + nx * s * 0.42
        const py = cy + ny * s * 0.42

        if (stateRef.current.iter > 50) {
          ctx.beginPath()
          ctx.arc(px, py, 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Faint decay so accumulation stays luminous rather than saturating
      if (stateRef.current.iter % 300 === 0) {
        ctx.fillStyle = 'rgba(5, 5, 8, 0.04)'
        ctx.fillRect(0, 0, width, height)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      animating = false
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setIter((i) => i + 200 * 16), 16)
    return () => clearInterval(t)
  }, [])

  return (
    <Panel
      title="FIELD :: CLIFFORD ATTRACTOR"
      status={`ITER: ${iter.toLocaleString()} // PARAMS: a=-1.4 b=1.6 // CONV: \u221E`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </Panel>
  )
}

/* ── SYS :: Metric bars ────────────────────────────────── */
const METRICS: { label: string; base: number; color: string }[] = [
  { label: 'CPU', base: 73, color: '#00BFFF' },
  { label: 'MEM', base: 61, color: '#00BFFF' },
  { label: 'NET', base: 44, color: '#FF2D78' },
  { label: 'GPU', base: 89, color: '#FF2D78' },
]

function MetricsPanel() {
  const [values, setValues] = useState<number[]>(() => METRICS.map((m) => m.base))

  useEffect(() => {
    const t = setInterval(() => {
      setValues((prev) =>
        prev.map((v) => {
          const delta = (Math.random() - 0.5) * 8
          return Math.max(10, Math.min(99, v + delta))
        }),
      )
    }, 800)
    return () => clearInterval(t)
  }, [])

  const SEGMENTS = 20

  return (
    <Panel
      title="SYS :: PROCESS ALLOCATION"
      status="THREAD: 18HRSHIFT // PID: 0x1A3F // STATUS: NOMINAL"
    >
      <div className="absolute inset-0 flex flex-col justify-center gap-5 px-5 py-4">
        {METRICS.map((metric, i) => {
          const filled = Math.round((values[i] / 100) * SEGMENTS)
          return (
            <div key={metric.label} className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-muted tracking-widest w-8 shrink-0">
                {metric.label}
              </span>
              <div className="flex gap-px flex-1">
                {Array.from({ length: SEGMENTS }).map((_, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex-1 h-3 transition-all duration-700"
                    style={{
                      background: sIdx < filled ? metric.color : 'rgba(68,68,88,0.2)',
                      boxShadow: sIdx < filled ? `0 0 6px ${metric.color}88` : 'none',
                    }}
                  />
                ))}
              </div>
              <span
                className="font-mono text-[9px] w-8 text-right shrink-0"
                style={{ color: metric.color }}
              >
                {Math.round(values[i])}%
              </span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

/* ── Showcase section ──────────────────────────────────── */
export function Showcase() {
  return (
    <section
      id="showcase"
      className="py-36 px-6 md:px-16 relative overflow-hidden"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0,191,255,0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Vignette over dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,#050508_100%)] pointer-events-none" />

      {/* Section label */}
      <div data-reveal className="flex items-center gap-4 mb-8 relative z-10">
        <span className="font-mono text-[10px] text-muted tracking-[0.4em]">
          CORE SYSTEMS
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue/40 to-transparent" />
      </div>

      {/* Large heading */}
      <div data-reveal className="relative z-10 mb-16">
        <h2
          className="font-display font-black leading-none tracking-tighter text-ink uppercase"
          style={{ fontSize: 'clamp(4rem, 12vw, 11rem)' }}
        >
          CORE
          <span className="text-blue animate-[blink_1s_step-end_infinite]">_</span>
        </h2>
        <p className="font-mono text-[10px] text-muted tracking-[0.4em] mt-4">
          SYSTEM VISUALIZATION // REALTIME // 18HRSHIFT
        </p>
      </div>

      {/* 2x2 panel grid */}
      <div
        data-reveal
        className="grid grid-cols-1 md:grid-cols-2 gap-px bg-surface2 relative z-10 border border-surface2"
      >
        <WaveformPanel />
        <StreamPanel />
        <FieldPanel />
        <MetricsPanel />
      </div>

      {/* Bottom accent */}
      <div className="relative z-10 mt-8 flex items-center gap-4">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-blue/40" />
        <span className="font-mono text-[9px] text-muted tracking-[0.4em]">
          END TRANSMISSION
        </span>
      </div>
    </section>
  )
}
