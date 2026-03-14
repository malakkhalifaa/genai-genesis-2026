'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { normalizePersona, personaOrder, personas, type PersonaId } from '@/lib/mockData'

const cycleOrder: PersonaId[] = ['margaret', 'ahmed', 'none']

function LoginContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(() => {
    const rawPersona = searchParams.get('persona')
    if (rawPersona) return normalizePersona(rawPersona)
    if (typeof window === 'undefined') return 'margaret'
    const saved = window.localStorage.getItem('ss-persona')
    return normalizePersona(saved)
  })
  const [displayPersona, setDisplayPersona] = useState<PersonaId>(selectedPersona)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayPersona((current) => {
        const currentIndex = cycleOrder.indexOf(current)
        const nextIndex = (currentIndex + 1) % cycleOrder.length
        return cycleOrder[nextIndex]
      })
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('ss-persona', selectedPersona)
  }, [selectedPersona])

  const selectedProfile = useMemo(() => personas[selectedPersona], [selectedPersona])
  const displayProfile = useMemo(() => personas[displayPersona], [displayPersona])

  const rightPanelClass =
    selectedPersona === 'margaret'
      ? 'bg-orange-50'
      : selectedPersona === 'ahmed'
        ? 'bg-blue-50'
        : 'bg-gray-100'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen md:grid-cols-2">
        <section className="flex min-h-[40vh] flex-col justify-between border-r bg-[linear-gradient(140deg,rgba(31,41,55,0.95),rgba(220,38,38,0.82))] p-8 text-white md:min-h-screen">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">Persona Gateway</p>
            <h1 className="mt-4 text-3xl font-semibold">Choose a perspective for the live fraud demo</h1>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-6">
            <div className="text-5xl">{displayProfile.avatar}</div>
            <p className="mt-4 text-xl font-semibold">{displayProfile.shortName}</p>
            <p className="mt-1 text-white/80">{displayProfile.role}</p>
            <p className="mt-6 text-lg leading-relaxed">“{displayProfile.quote}”</p>
          </div>
          <p className="text-sm text-white/70">Auto-rotates every 5 seconds for preview. Your selected persona stays locked.</p>
        </section>

        <section className={`flex items-center justify-center p-6 md:p-10 ${rightPanelClass}`}>
          <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Welcome back</h2>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700">Persona</label>
              <select
                value={selectedPersona}
                onChange={(event) => {
                  const next = normalizePersona(event.target.value)
                  setSelectedPersona(next)
                  setDisplayPersona(next)
                }}
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-red-600 transition focus:ring-2"
              >
                {personaOrder.map((id) => (
                  <option value={id} key={id}>
                    {personas[id].shortName}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                disabled
                value={selectedProfile.email}
                className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm text-gray-600"
              />

              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-red-600 transition focus:ring-2"
              />

              <button
                onClick={() => router.push(`/dashboard/analysis?persona=${selectedPersona}`)}
                className="mt-2 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Enter ScamShield
              </button>

              <Link href="/" className="inline-block text-sm font-medium text-gray-600 hover:text-gray-900">
                ← Back to landing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
