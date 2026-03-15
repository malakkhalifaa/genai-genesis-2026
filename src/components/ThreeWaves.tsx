'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeWaves() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 20, 38)
    camera.lookAt(0, -5, 0)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // ── Main wave mesh ──────────────────────────────────────────
    const geometry = new THREE.PlaneGeometry(160, 100, 65, 48)

    const material = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    // ── Second wave layer (offset, orange tint) ─────────────────
    const material2 = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
    })
    const plane2 = new THREE.Mesh(geometry, material2)
    plane2.rotation.x = -Math.PI / 2
    plane2.position.y = -1.5
    scene.add(plane2)

    // ── Glowing particle dots at grid intersections ─────────────
    const pointsMat = new THREE.PointsMaterial({
      color: 0xfca5a5,
      size: 0.14,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    })
    // Share the same geometry so particles auto-follow wave positions
    const points = new THREE.Points(geometry, pointsMat)
    points.rotation.x = -Math.PI / 2
    scene.add(points)

    // Cache base Z values
    const pos = geometry.attributes.position
    const startZ = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) startZ[i] = pos.getZ(i)

    const startTime = performance.now()

    let mouseX = 0
    let mouseY = 0
    const halfW = window.innerWidth / 2
    const halfH = window.innerHeight / 2

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - halfW) * 0.04
      mouseY = (e.clientY - halfH) * 0.04
    }
    document.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      requestAnimationFrame(animate)
      const t = (performance.now() - startTime) / 1000

      // Ease camera to cursor
      camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.02
      camera.position.y += (20 + mouseY * 0.06 - camera.position.y) * 0.02
      camera.lookAt(0, -5, 0)

      // Wave displacement on Z axis (pre-rotation = world Y)
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i)
        const w =
          Math.sin(x * 0.09 + t * 0.65) * 2.8 +
          Math.cos(y * 0.11 + t * 0.55) * 2.2 +
          Math.sin((x + y) * 0.045 + t * 0.38) * 1.6
        pos.setZ(i, startZ[i] + w)
      }
      pos.needsUpdate = true

      // Slow drift rotation (synced across all layers)
      const rot = t * 0.012
      plane.rotation.z = rot
      plane2.rotation.z = rot
      points.rotation.z = rot

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousemove', onMouseMove)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      material2.dispose()
      pointsMat.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  )
}
