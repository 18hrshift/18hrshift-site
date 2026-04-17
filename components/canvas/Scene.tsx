'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Environment, Sparkles, Float } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { NoiseField } from './NoiseField'
import { PhysicsObjects, MouseRepulsor } from './PhysicsObjects'
import { PostFX } from './PostFX'

function ScrollCamera() {
  const { camera } = useThree()
  const scrollY   = useRef(0)
  const targetY   = useRef(0)
  const targetFov = useRef(65)
  const fovRef    = useRef(65)

  useEffect(() => {
    const handler = () => { scrollY.current = window.scrollY }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useFrame(() => {
    const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1)
    const progress  = scrollY.current / maxScroll

    // Camera drifts back and tilts as page scrolls
    targetY.current   = -progress * 2.2
    targetFov.current = 65 + progress * 12

    camera.position.y += (targetY.current   - camera.position.y) * 0.035
    camera.position.z += ((6 + progress * 2) - camera.position.z) * 0.03
    fovRef.current    += (targetFov.current  - fovRef.current)    * 0.04

    ;(camera as THREE.PerspectiveCamera).fov = fovRef.current
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()

    camera.lookAt(new THREE.Vector3(0, camera.position.y * 0.25, 0))
  })

  return null
}

function FloatingLights() {
  return (
    <>
      <ambientLight intensity={0.04} />
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.8}>
        <pointLight color="#00BFFF" intensity={10} distance={12} position={[-2.5, 2.5, 1.5]} decay={2} />
      </Float>
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={1.2} floatingRange={[0, 1.5]}>
        <pointLight color="#FF2D78" intensity={8}  distance={10} position={[ 3.0, 1.5, -1.0]} decay={2} />
      </Float>
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={2.0}>
        <pointLight color="#003d88" intensity={5}  distance={8}  position={[ 0.0, 3.5, -2.0]} decay={2} />
      </Float>
    </>
  )
}

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 6], fov: 65 }}
      gl={{
        antialias: false,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
      }}
      dpr={[1, 1.5]}
      className="absolute inset-0"
      style={{ background: '#050508' }}
    >
      <AdaptiveDpr pixelated />
      <ScrollCamera />

      {/* Ambient sparkle field */}
      <Sparkles count={140} scale={[16, 12, 8]} size={1.4} speed={0.25} color="#00BFFF" opacity={0.55} />
      <Sparkles count={90}  scale={[14, 10, 6]} size={0.9} speed={0.18} color="#FF2D78" opacity={0.38} />

      {/* Dynamic colored lights for glass illumination */}
      <FloatingLights />

      {/* Base displacement field */}
      <NoiseField />

      {/* Physics glass objects + environment */}
      <Suspense fallback={null}>
        <Environment preset="city" background={false} />
        <Physics gravity={[0, -5.5, 0]}>
          <PhysicsObjects />
          <MouseRepulsor />
          {/* Invisible physics floor */}
          <RigidBody type="fixed" position={[0, -2.5, 0]}>
            <CuboidCollider args={[25, 0.1, 25]} />
          </RigidBody>
        </Physics>
      </Suspense>

      <PostFX />
    </Canvas>
  )
}
