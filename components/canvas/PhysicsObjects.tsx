'use client'

import { useRef, useMemo, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { useMousePosition } from '@/hooks/useMousePosition'

const STORAGE_KEY = '18hs-physics-v1'

function loadPositions(): ([number, number, number])[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as { x: number; y: number; z: number }[]
    if (!Array.isArray(data) || data.length < 3) return null
    // Clamp Y so objects don't restore underground
    return data.map(p => [p.x, Math.max(p.y, -1.5), p.z])
  } catch { return null }
}

type ShapeConfig = {
  pos:    [number, number, number]
  color:  string
  size:   number
  type:   'icosahedron' | 'octahedron' | 'torus'
  torusR?: number
}

const TYPES = ['icosahedron', 'octahedron', 'torus'] as const
const COLORS = ['#00BFFF', '#FF2D78'] as const

function rnd(min: number, max: number) { return Math.random() * (max - min) + min }

// Triangular distribution — averages two randoms, clusters toward center
function rndCenter(spread: number) {
  return (Math.random() + Math.random() - 1) * spread
}

function generateShapes(saved: ([number, number, number])[] | null): ShapeConfig[] {
  return Array.from({ length: 12 }, (_, i) => {
    const type  = TYPES[i % TYPES.length]
    const color = COLORS[i % 2]
    const size  = rnd(0.26, 0.52)
    const pos: [number, number, number] = saved?.[i] ?? [
      rndCenter(3.2),
      rnd(7.0, 16.0),
      rndCenter(1.8),
    ]
    return { type, color, size, torusR: size * 0.30, pos }
  })
}

function PhysicsShape({
  pos, color, size, type, torusR = 0.10,
  onBodyReady,
}: ShapeConfig & { onBodyReady: (ref: RapierRigidBody) => void }) {
  const rigidRef = useRef<RapierRigidBody>(null)

  useEffect(() => {
    if (rigidRef.current) onBodyReady(rigidRef.current)
  }, [onBodyReady])

  const handleClick = () => {
    const b = rigidRef.current
    if (!b) return
    // Pop in a random direction with strong upward bias
    const angle = Math.random() * Math.PI * 2
    const lateral = 14 + Math.random() * 8
    b.applyImpulse(
      { x: Math.cos(angle) * lateral, y: 22 + Math.random() * 10, z: Math.sin(angle) * lateral },
      true,
    )
    b.applyTorqueImpulse(
      { x: (Math.random() - 0.5) * 14, y: (Math.random() - 0.5) * 14, z: (Math.random() - 0.5) * 14 },
      true,
    )
  }

  return (
    <RigidBody
      ref={rigidRef}
      position={pos}
      colliders="hull"
      restitution={0.65}
      friction={0.3}
      linearDamping={0.2}
      angularDamping={0.25}
    >
      <mesh onClick={handleClick} castShadow>
        {type === 'icosahedron' && <icosahedronGeometry args={[size, 0]} />}
        {type === 'octahedron'  && <octahedronGeometry  args={[size, 0]} />}
        {type === 'torus'       && <torusGeometry        args={[size, torusR, 16, 32]} />}

        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          transmission={0.97}
          roughness={0.03}
          thickness={0.45}
          ior={1.5}
          chromaticAberration={0.07}
          anisotropy={0.4}
          distortion={0.15}
          distortionScale={0.25}
          temporalDistortion={0.06}
          color={color}
          attenuationDistance={0.6}
          attenuationColor="#ffffff"
        />
      </mesh>
    </RigidBody>
  )
}

export function PhysicsObjects() {
  const saved  = useMemo(() => loadPositions(), [])
  const shapes = useMemo(() => generateShapes(saved), [saved])
  const bodies = useRef<RapierRigidBody[]>([])

  // Save positions to localStorage every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const positions = bodies.current.map(b => {
        const t = b.translation()
        return { x: t.x, y: t.y, z: t.z }
      })
      if (positions.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {shapes.map((shape, i) => (
        <PhysicsShape
          key={i}
          {...shape}
          onBodyReady={(ref) => { bodies.current[i] = ref }}
        />
      ))}
    </>
  )
}

export function MouseRepulsor() {
  const repulsorRef = useRef<RapierRigidBody>(null)
  const { camera }  = useThree()
  const mouse       = useMousePosition()
  const raycaster   = useMemo(() => new THREE.Raycaster(), [])
  const plane       = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const target      = useMemo(() => new THREE.Vector3(), [])
  const prevTarget  = useMemo(() => new THREE.Vector3(), [])
  const ndc         = useMemo(() => new THREE.Vector2(), [])

  useFrame((_, delta) => {
    ndc.set(mouse.current.x, mouse.current.y)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.ray.intersectPlane(plane, target)
    if (!hit || !repulsorRef.current) return

    // Mouse velocity in world space this frame
    const vel = target.clone().sub(prevTarget).divideScalar(delta)
    const speed = vel.length()

    repulsorRef.current.setNextKinematicTranslation(target)

    // Blast nearby bodies when mouse moves fast
    if (speed > 2.5) {
      repulsorRef.current.setLinvel(
        { x: vel.x * 0.6, y: vel.y * 0.6, z: vel.z * 0.6 },
        true,
      )
    }

    prevTarget.copy(target)
  })

  return (
    // Radius 1.8 — much larger collision footprint
    <RigidBody ref={repulsorRef} type="kinematicPosition" colliders="ball">
      <mesh visible={false}>
        <sphereGeometry args={[1.8]} />
        <meshBasicMaterial />
      </mesh>
    </RigidBody>
  )
}
