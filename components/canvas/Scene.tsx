'use client'

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { NoiseField } from './NoiseField'
import { Particles } from './Particles'
import { PostFX } from './PostFX'

function ScrollCamera() {
  const { camera } = useThree()
  const scrollY = useRef(0)
  const targetY  = useRef(0)

  // Track page scroll without re-renders
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      scrollY.current = window.scrollY
    }, { passive: true })
  }

  useFrame(() => {
    // Map scroll to a gentle camera drift
    const progress = scrollY.current / Math.max(document.body.scrollHeight - window.innerHeight, 1)
    targetY.current = -progress * 1.5

    camera.position.y += (targetY.current - camera.position.y) * 0.04
    camera.rotation.x += (-progress * 0.08 - camera.rotation.x) * 0.04

    camera.lookAt(new THREE.Vector3(0, camera.position.y * 0.3, 0))
  })

  return null
}

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1.5]}
      style={{ background: '#050508', width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <ScrollCamera />
      <NoiseField />
      <Particles />
      <PostFX />
    </Canvas>
  )
}
