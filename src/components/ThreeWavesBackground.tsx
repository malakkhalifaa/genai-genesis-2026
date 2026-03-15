'use client'

import dynamic from 'next/dynamic'

const ThreeWaves = dynamic(() => import('./ThreeWaves'), { ssr: false })

export default function ThreeWavesBackground() {
  return <ThreeWaves />
}
