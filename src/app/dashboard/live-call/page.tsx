'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { normalizePersona } from '@/lib/mockData'
import { useLanguage } from '@/hooks/useLanguage'

// LiveCallMonitor uses Web Speech API — must be client-only, no SSR
const LiveCallMonitor = dynamic(() => import('@/components/LiveCallMonitor'), { ssr: false })

function LiveCallContent() {
  const searchParams = useSearchParams()
  const personaId    = normalizePersona(searchParams.get('persona'))
  const { t }        = useLanguage()

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: 'var(--text)',
          letterSpacing: '-0.03em', marginBottom: 6,
        }}>
          {t.liveCall.title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 540 }}>
          {t.liveCall.subtitle}
        </p>
      </div>

      <LiveCallMonitor personaId={personaId} />
    </div>
  )
}

export default function LiveCallPage() {
  return (
    <Suspense fallback={
      <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 24 }}>Loading…</div>
    }>
      <LiveCallContent />
    </Suspense>
  )
}
