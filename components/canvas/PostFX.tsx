'use client'

import {
  EffectComposer,
  Bloom,
  Noise,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.025}
        mipmapBlur
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.055}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0018, 0.0014)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        offset={0.38}
        darkness={0.82}
        eskil={false}
      />
    </EffectComposer>
  )
}
