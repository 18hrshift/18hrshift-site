'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useMousePosition } from '@/hooks/useMousePosition'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMouseX;
  uniform float uMouseY;
  uniform float uIntensity;

  varying float vDisplacement;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value    = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value     += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    vec2 st = uv * 3.5 + vec2(uTime * 0.04, uTime * 0.025);
    float mouseWave = fbm(st + vec2(uMouseX * 1.2, uMouseY * 1.2));
    float base      = fbm(st);
    float d         = mix(base, mouseWave, 0.4) * uIntensity;

    pos.z += d - uIntensity * 0.5;
    vDisplacement = clamp(d / uIntensity, 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorLow;
  uniform vec3 uColorMid;
  uniform vec3 uColorHigh;

  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    vec3 color = vDisplacement < 0.5
      ? mix(uColorLow,  uColorMid,  vDisplacement * 2.0)
      : mix(uColorMid, uColorHigh, (vDisplacement - 0.5) * 2.0);

    float alpha = 0.45 + vDisplacement * 0.55;
    gl_FragColor = vec4(color, alpha);
  }
`

export function NoiseField() {
  const meshRef    = useRef<THREE.Mesh>(null)
  const wireMeshRef = useRef<THREE.Mesh>(null)
  const mouse      = useMousePosition()

  const uniforms = useMemo<Record<string, THREE.IUniform>>(() => ({
    uTime:      { value: 0 },
    uMouseX:    { value: 0 },
    uMouseY:    { value: 0 },
    uIntensity: { value: 2.2 },
    uColorLow:  { value: new THREE.Color('#050508') },
    uColorMid:  { value: new THREE.Color('#003d88') },
    uColorHigh: { value: new THREE.Color('#FF2D78') },
  }), [])

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime()
    uniforms.uMouseX.value += (mouse.current.x - uniforms.uMouseX.value) * 0.05
    uniforms.uMouseY.value += (mouse.current.y - uniforms.uMouseY.value) * 0.05
  })

  return (
    <group rotation={[-Math.PI * 0.32, 0, 0]} position={[0, -1.8, 0]}>
      {/* Displacement surface */}
      <mesh ref={meshRef}>
        <planeGeometry args={[20, 20, 160, 160]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe grid overlay */}
      <mesh ref={wireMeshRef}>
        <planeGeometry args={[20, 20, 48, 48]} />
        <meshBasicMaterial
          color="#00BFFF"
          wireframe
          transparent
          opacity={0.045}
        />
      </mesh>
    </group>
  )
}
