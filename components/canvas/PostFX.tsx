'use client'

import {
  EffectComposer,
  Noise,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export function PostFX() {
  return (
    <EffectComposer>
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.06}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0018, 0.0014)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        offset={0.4}
        darkness={0.88}
        eskil={false}
      />
    </EffectComposer>
  )
}
