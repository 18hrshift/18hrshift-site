'use client'

import { useRef, useMemo } from 'react'
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

const TYPES = ['icosahedron', 'octahedron', 'torus'] as const
const COLORS = ['#00BFFF', '#FF2D78'] as const

function rnd(min: number, max: number) { return Math.random() * (max - min) + min }

function generateShapes(): ShapeConfig[] {
  return Array.from({ length: 12 }, (_, i) => {
    const type  = TYPES[i % TYPES.length]
    const color = COLORS[i % 2]
    const size  = rnd(0.22, 0.50)
    return {
      type,
      color,
      size,
      torusR: size * 0.30,
      pos: [
        rnd(-5.5, 5.5),           // wide X spread
        rnd(7.0, 18.0),           // varying drop heights
        rnd(-3.5, 3.5),           // deep Z spread
      ] as [number, number, number],
    }
  })
}

function PhysicsShape({ pos, color, size, type, torusR = 0.10 }: ShapeConfig) {
  const rigidRef = useRef<RapierRigidBody>(null)

  const handleClick = () => {
    if (!rigidRef.current) return
    rigidRef.current.applyImpulse(
      { x: (Math.random() - 0.5) * 12, y: 18, z: (Math.random() - 0.5) * 12 },
      true,
    )
    rigidRef.current.applyTorqueImpulse(
      { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8 },
      true,
    )
  }

  return (
    <RigidBody
      ref={rigidRef}
      position={pos}
      colliders="hull"
      restitution={0.55}
      friction={0.4}
      linearDamping={0.25}
      angularDamping={0.3}
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
