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

const SHAPES: ShapeConfig[] = [
  { type: 'icosahedron', pos: [-3.5,  8.0, -1.5], color: '#00BFFF', size: 0.40 },
  { type: 'torus',       pos: [ 1.5,  9.5, -0.5], color: '#FF2D78', size: 0.30, torusR: 0.10 },
  { type: 'octahedron',  pos: [ 3.2,  7.5,  0.5], color: '#00BFFF', size: 0.44 },
  { type: 'icosahedron', pos: [-0.8, 11.0,  1.0], color: '#FF2D78', size: 0.28 },
  { type: 'torus',       pos: [ 2.8, 10.5, -2.0], color: '#00BFFF', size: 0.24, torusR: 0.08 },
  { type: 'octahedron',  pos: [-2.8, 12.0,  0.3], color: '#FF2D78', size: 0.36 },
  { type: 'icosahedron', pos: [ 0.6,  8.5, -3.0], color: '#00BFFF', size: 0.32 },
  { type: 'torus',       pos: [-1.8, 13.5,  2.0], color: '#FF2D78', size: 0.22, torusR: 0.08 },
  { type: 'octahedron',  pos: [ 3.8,  9.0,  1.5], color: '#00BFFF', size: 0.28 },
  { type: 'icosahedron', pos: [ 0.0, 14.5, -0.5], color: '#FF2D78', size: 0.46 },
]

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
  return (
    <>
      {SHAPES.map((shape, i) => (
        <PhysicsShape key={i} {...shape} />
      ))}
    </>
  )
}

export function MouseRepulsor() {
  const repulsorRef = useRef<RapierRigidBody>(null)
  const { camera } = useThree()
  const mouse = useMousePosition()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane     = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const target    = useMemo(() => new THREE.Vector3(), [])
  const ndc       = useMemo(() => new THREE.Vector2(), [])

  useFrame(() => {
    ndc.set(mouse.current.x, mouse.current.y)
    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.ray.intersectPlane(plane, target)
    if (hit && repulsorRef.current) {
      repulsorRef.current.setNextKinematicTranslation(target)
    }
  })

  return (
    <RigidBody ref={repulsorRef} type="kinematicPosition" colliders="ball">
      <mesh visible={false}>
        <sphereGeometry args={[1.0]} />
        <meshBasicMaterial />
      </mesh>
    </RigidBody>
  )
}
