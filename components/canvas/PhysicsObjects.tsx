'use client'

import { useRef, useMemo, useEffect } from 'react'
import { RigidBody } from '@react-three/rapier'
import { MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { useMousePosition } from '@/hooks/useMousePosition'

type ShapeConfig = {
  pos:    [number, number, number]
  color:  string
  size:   number
  type:   'icosahedron' | 'octahedron' | 'torus'
  torusR?: number
}

const TYPES  = ['icosahedron', 'octahedron', 'torus'] as const
const COLORS = ['#00BFFF', '#FF2D78'] as const

// Shared registry — PhysicsShape registers bodies, MouseRepulsor reads them
const bodyRegistry: RapierRigidBody[] = []

function rnd(min: number, max: number) { return Math.random() * (max - min) + min }

// Triangular distribution — averages two randoms, clusters toward center
function rndCenter(spread: number) {
  return (Math.random() + Math.random() - 1) * spread
}

function generateShapes(): ShapeConfig[] {
  return Array.from({ length: 12 }, (_, i) => {
    const type  = TYPES[i % TYPES.length]
    const color = COLORS[i % 2]
    const size  = rnd(0.26, 0.52)
    return {
      type, color, size, torusR: size * 0.30,
      pos: [rndCenter(3.2), rnd(7.0, 16.0), rndCenter(1.8)],
    }
  })
}

function PhysicsShape({ pos, color, size, type, torusR = 0.10 }: ShapeConfig) {
  const rigidRef = useRef<RapierRigidBody>(null)

  useEffect(() => {
    const body = rigidRef.current
    if (!body) return
    bodyRegistry.push(body)
    return () => {
      const idx = bodyRegistry.indexOf(body)
      if (idx !== -1) bodyRegistry.splice(idx, 1)
    }
  }, [])

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
      canSleep={false}
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
  const shapes = useMemo(() => generateShapes(), [])
  return (
    <>
      {shapes.map((shape, i) => (
        <PhysicsShape key={i} {...shape} />
      ))}
    </>
  )
}

const REPULSOR_RADIUS = 2.2  // influence zone
const REPULSOR_FORCE  = 18   // base impulse strength

export function MouseRepulsor() {
  const repulsorRef = useRef<RapierRigidBody>(null)
  const { camera }  = useThree()
  const mouse       = useMousePosition()
  const raycaster   = useMemo(() => new THREE.Raycaster(), [])
  const plane       = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const pos         = useMemo(() => new THREE.Vector3(), [])
  const prevPos     = useMemo(() => new THREE.Vector3(), [])
  const ndc         = useMemo(() => new THREE.Vector2(), [])
  const bodyPos     = useMemo(() => new THREE.Vector3(), [])
  const dir         = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    ndc.set(mouse.current.x, mouse.current.y)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.ray.intersectPlane(plane, pos)
    if (!hit) return

    // Mouse velocity for directional punch
    const vel = pos.clone().sub(prevPos).divideScalar(Math.max(delta, 0.001))
    const speed = vel.length()

    // Move collision sphere
    if (repulsorRef.current) {
      repulsorRef.current.setNextKinematicTranslation(pos)
      if (speed > 0.5) {
        repulsorRef.current.setLinvel({ x: vel.x, y: vel.y, z: vel.z }, true)
      }
    }

    // Direct force field — hit every body within REPULSOR_RADIUS
    for (const body of bodyRegistry) {
      const t = body.translation()
      bodyPos.set(t.x, t.y, t.z)
      const dist = bodyPos.distanceTo(pos)
      if (dist > REPULSOR_RADIUS || dist < 0.01) continue

      // Radial direction away from cursor + mouse velocity contribution
      dir.subVectors(bodyPos, pos).normalize()

      // Falloff: stronger when closer
      const falloff = 1 - dist / REPULSOR_RADIUS
      const magnitude = REPULSOR_FORCE * falloff * falloff

      // Blend: radial push + mouse velocity direction
      const vx = dir.x * magnitude + vel.x * falloff * 0.9
      const vy = dir.y * magnitude + vel.y * falloff * 0.9 + 2 * falloff
      const vz = dir.z * magnitude + vel.z * falloff * 0.9

      body.applyImpulse({ x: vx, y: vy, z: vz }, true)
    }

    prevPos.copy(pos)
  })

  return (
    <RigidBody ref={repulsorRef} type="kinematicPosition" colliders="ball">
      <mesh visible={false}>
        <sphereGeometry args={[REPULSOR_RADIUS * 0.5]} />
        <meshBasicMaterial />
      </mesh>
    </RigidBody>
  )
}
