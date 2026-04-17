'use client'

import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import { NoiseField } from './NoiseField'
import { Particles } from './Particles'
import { PostFX } from './PostFX'

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1.5]}
      style={{ background: '#050508', width: '100%', height: '100%' }}
    >
      <AdaptiveDpr pixelated />
      <NoiseField />
      <Particles />
      <PostFX />
    </Canvas>
  )
}
