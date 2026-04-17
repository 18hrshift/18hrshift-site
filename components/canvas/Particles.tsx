'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 1200

export function Particles() {
  const meshRef  = useRef<THREE.InstancedMesh>(null)
  const dummy    = useMemo(() => new THREE.Object3D(), [])
  const colorObj = useMemo(() => new THREE.Color(), [])

  const data = useMemo(() => {
    const pos    = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    const scales = new Float32Array(COUNT)
    const cols: string[] = []

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      speeds[i]      = 0.0008 + Math.random() * 0.0025
      scales[i]      = 0.008 + Math.random() * 0.022
      cols.push(Math.random() > 0.65 ? '#FF2D78' : '#00BFFF')
    }
    return { pos, speeds, scales, cols }
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2])
      dummy.scale.setScalar(data.scales[i])
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      colorObj.set(data.cols[i])
      mesh.setColorAt(i, colorObj)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data, dummy, colorObj])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < COUNT; i++) {
      data.pos[i * 3 + 1] += data.speeds[i]
      if (data.pos[i * 3 + 1] > 6) data.pos[i * 3 + 1] = -6

      dummy.position.set(
        data.pos[i * 3] + Math.sin(t * 0.3 + i * 1.7) * 0.08,
        data.pos[i * 3 + 1],
        data.pos[i * 3 + 2] + Math.cos(t * 0.2 + i * 0.9) * 0.05,
      )
      const pulse = data.scales[i] * (0.85 + Math.sin(t * 1.5 + i) * 0.15)
      dummy.scale.setScalar(pulse)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  )
}
