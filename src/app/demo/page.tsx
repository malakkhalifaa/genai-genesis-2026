'use client'

import { useState } from 'react'
import Link from 'next/link'
import { demoComparisons } from '@/lib/mockData'

export default function DemoPage() {
  const [index, setIndex] = useState(0)
  const current = demoComparisons[index]

  const runNext = () => {
    setIndex((prev) => (prev + 1) % demoComparisons.length)
  }

  const reset = () => setIndex(0)

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-xl border bg-white p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-600">Live Comparison Mode</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Same scam. Different protection.</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border bg-gray-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Without ScamShield</h2>
            <p className="mt-4 rounded-lg border bg-white p-3 text-gray-700">“{current.genericWarning}”</p>
            <p className="mt-4 text-sm text-gray-500">[Generic warning]</p>
            <p className="mt-10 text-sm text-gray-700">Risk: {current.genericRisk}</p>
          </section>

          <section className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">With ScamShield</h2>
            <p className="mt-4 rounded-lg border border-red-200 bg-white p-3 text-gray-800">“{current.personalizedWarning}”</p>
            <p className="mt-4 text-sm text-red-700">[Personalized]</p>
            <p className="mt-10 text-sm text-gray-800">Risk: {current.personalizedRisk}</p>
            <p className="mt-1 text-sm text-gray-800">Action: {current.personalizedAction}</p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={runNext} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            Run next example
          </button>
          <button onClick={reset} className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Reset
          </button>
          <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Back to landing
          </Link>
        </div>
      </div>
    </main>
  )
}
