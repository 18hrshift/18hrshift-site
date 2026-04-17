@AGENTS.md

# CLAUDE.md — 18hrshift-site

## Project Overview
18HRSHIFT — cryptic immersive web experience. Dark aesthetic, Three.js 3D canvas with custom GLSL shaders,
scroll-driven animations. Built to push the limits of what a browser can render.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4, deployed on Vercel.

## Stack
- **Framework:** Next.js 16.2.4, App Router, React 19, TypeScript
- **3D:** @react-three/fiber 9, @react-three/drei 10, three 0.184
- **Post-FX:** @react-three/postprocessing 3 — film grain, chromatic aberration, vignette
- **Scroll:** Lenis 1.3 + GSAP 3 ScrollTrigger
- **Styling:** Tailwind v4 — all design tokens in `app/globals.css` @theme block, never inline hex values
- **Fonts:** Barlow Condensed (display), Barlow (body), JetBrains Mono (interface/labels)
- **Deployment:** Vercel — push to `main` = production deploy

## Design System

### Colors (always use Tailwind class names)
| Token       | Hex       | Use |
|-------------|-----------|-----|
| `bg`        | `#050508` | Page background |
| `surface`   | `#0d0d14` | Card/panel backgrounds |
| `surface2`  | `#13131e` | Grid lines, dividers |
| `ink`       | `#E2E2EE` | Primary text |
| `muted`     | `#444458` | Secondary text, labels |
| `blue`      | `#00BFFF` | Primary accent, hovers |
| `magenta`   | `#FF2D78` | Secondary accent, hot states |
| `dim-blue`  | `#003d88` | Shader low-color |

### Typography
- Display headings: `font-display font-black uppercase tracking-tighter` (Barlow Condensed 800)
- Labels/nav/captions: `font-mono text-xs tracking-widest uppercase` (JetBrains Mono)
- Body: `font-body` (Barlow 400/500) — rarely used, most text is display or mono

### Visual Rules
- **No standard shadows** — use `glow-blue` / `glow-magenta` utility classes or `text-glow-*`
- **No 1px solid borders** — use `bg-surface2` background shifts or `border-blue/20` ghost borders
- **No inline hex values** — always reference design tokens via Tailwind class names
- **Grain is always on** — PostFX component handles this at the canvas level

## File Structure
```
app/
  globals.css          # Tailwind v4 @theme tokens — single source of design truth
  layout.tsx           # Fonts, metadata, LenisProvider wrapper
  page.tsx             # Assembles sections (server component)
components/
  canvas/
    Scene.tsx          # R3F Canvas root — dynamically imported (ssr: false)
    NoiseField.tsx     # Displacement plane + custom GLSL vertex/fragment shaders
    Particles.tsx      # InstancedMesh particle cloud (blue + magenta)
    PostFX.tsx         # @react-three/postprocessing effects stack
  layout/
    Nav.tsx            # Fixed top nav — scroll-aware transparency
    Footer.tsx         # Minimal footer
  sections/
    Hero.tsx           # Full-viewport 3D canvas + 18HRSHIFT headline (client)
    Signal.tsx         # Manifesto lines with scroll reveal
    Archive.tsx        # Work grid — 6 tiles, hover glitch
    Endpoint.tsx       # Contact terminal prompt
  providers/
    LenisProvider.tsx  # Lenis smooth scroll + GSAP ScrollTrigger bridge
config/
  site.ts              # All nav items, archive tiles, contact — single source of truth
hooks/
  useMousePosition.ts  # Normalized XY mouse ref (no re-renders, feeds shader uniforms)
lib/
  scramble.ts          # Text character scramble animation utility
```

## Component Rules
- One component per file. No multi-export files.
- `'use client'` only where needed (canvas, nav, providers, hero).
- All canvas components require `'use client'` — Three.js runs in the browser only.
- `Scene.tsx` must be dynamically imported with `ssr: false` anywhere it's used.
- Config (nav items, archive data, contact) lives in `config/site.ts` — not hardcoded.
- Never hardcode hex values in components — use Tailwind tokens.

## 3D / Shader Notes
- `NoiseField.tsx` uses inline GLSL template literals (no webpack glsl-loader needed).
- Noise algorithm: 2D value noise + 5-octave fBm displacement.
- Mouse influence: uniforms `uMouseX`/`uMouseY` lerped 5% per frame via `useFrame`.
- `Particles.tsx` uses `InstancedMesh` (not `Points`) for proper 3D sphere particles.
- PostFX stack: Noise (grain) → ChromaticAberration → Vignette.
- Scanlines: CSS `::after` pseudo-element on `.scanlines` class (GPU-free, no perf cost).

## Testing
`bash test.sh` must pass before every merge (runs `tsc --noEmit` + `next build`).
