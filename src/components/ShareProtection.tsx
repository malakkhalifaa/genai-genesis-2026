'use client'

import { useEffect, useState } from 'react'

interface Props {
  riskLevel: 'high' | 'critical'
  reasons: string[]      // e.g. ["Bank impersonation", "Urgency language"]
  region?: string        // from user profile
  onClose?: () => void
}

// Map reason strings → canonical scam type labels
function inferScamType(reasons: string[]): string {
  const r = reasons.join(' ').toLowerCase()
  if (r.includes('crypto') || r.includes('bitcoin'))   return 'Crypto fraud'
  if (r.includes('gift card'))                          return 'Gift card scam'
  if (r.includes('impersonat') || r.includes('bank'))  return 'Bank impersonation'
  if (r.includes('cra') || r.includes('irs') || r.includes('tax'))  return 'Tax authority scam'
  if (r.includes('job') || r.includes('employ'))       return 'Fake job offer'
  if (r.includes('phish') || r.includes('link'))       return 'Phishing link'
  if (r.includes('prize') || r.includes('lottery'))    return 'Lottery / prize scam'
  if (r.includes('romance') || r.includes('love'))     return 'Romance scam'
  if (r.includes('arrest') || r.includes('legal'))     return 'Legal threat scam'
  if (r.includes('support') || r.includes('tech'))     return 'Tech support scam'
  return 'Unknown scam'
}

interface CommunityStats {
  total: number
  nearby: number
  similarCount: number
}

export default function ShareProtection({ riskLevel, reasons, region, onClose }: Props) {
  const [step, setStep]         = useState<'ask' | 'sharing' | 'done' | 'dismissed'>('ask')
  const [stats, setStats]       = useState<CommunityStats | null>(null)
  const [sharedCount, setSharedCount] = useState(0)
  const scamType = inferScamType(reasons)

  // Load community stats on mount
  useEffect(() => {
    const params = new URLSearchParams()
    if (region)   params.set('region',   region)
    if (scamType) params.set('scamType', scamType)
    fetch(`/api/community-alerts?${params}`)
      .then(r => r.json())
      .then(d => setStats({ total: d.total ?? 0, nearby: d.nearby ?? 0, similarCount: d.similarCount ?? 0 }))
      .catch(() => {})
  }, [region, scamType])

  const handleShare = async () => {
    setStep('sharing')
    try {
      await fetch('/api/community-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskLevel,
          scamType,
          region: region ?? null,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : null,
        }),
      })
      // Re-fetch stats after share
      const params = new URLSearchParams()
      if (region)   params.set('region',   region)
      if (scamType) params.set('scamType', scamType)
      const updated = await fetch(`/api/community-alerts?${params}`).then(r => r.json())
      setStats({ total: updated.total ?? 0, nearby: updated.nearby ?? 0, similarCount: updated.similarCount ?? 0 })
      setSharedCount(updated.similarCount ?? 0)
      setStep('done')
    } catch {
      setStep('done') // non-fatal
    }
  }

  if (step === 'dismissed') return null

  const borderColor = riskLevel === 'critical' ? 'rgba(220,38,38,0.3)' : 'rgba(234,88,12,0.3)'
  const bgColor     = riskLevel === 'critical' ? 'rgba(220,38,38,0.05)' : 'rgba(234,88,12,0.04)'

  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${borderColor}`,
      background: bgColor, padding: '16px 18px',
      position: 'relative',
    }}>
      {/* Dismiss */}
      <button
        onClick={() => { setStep('dismissed'); onClose?.() }}
        style={{
          position: 'absolute', top: 10, right: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, color: 'var(--text-3)', lineHeight: 1,
        }}
        aria-label="Dismiss"
      >×</button>

      {step === 'ask' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>🌍</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                Share to protect others?
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                Anonymous report — no personal information is sent.
              </div>
            </div>
          </div>

          {/* Scam type preview */}
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 12,
            background: 'var(--bg)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              What will be shared
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
              {scamType}
            </div>
            {region && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                📍 {region.split(',')[0]} region
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              No names, emails, or message content included.
            </div>
          </div>

          {/* Community context */}
          {stats && (stats.similarCount > 0 || stats.nearby > 0) && (
            <div style={{
              display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap',
            }}>
              {stats.similarCount > 0 && (
                <div style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12,
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--text)',
                }}>
                  ⚠ <strong>{stats.similarCount}</strong> similar scam{stats.similarCount !== 1 ? 's' : ''} reported this month
                </div>
              )}
              {stats.nearby > 0 && region && (
                <div style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12,
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--text)',
                }}>
                  📍 <strong>{stats.nearby}</strong> near {region.split(',')[0]}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleShare}
              style={{
                flex: 1, padding: '9px 14px', borderRadius: 8,
                border: 'none', background: 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Share anonymously
            </button>
            <button
              onClick={() => setStep('dismissed')}
              style={{
                padding: '9px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
              }}
            >
              No thanks
            </button>
          </div>
        </>
      )}

      {step === 'sharing' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
          <span style={{ fontSize: 18 }}>🌐</span>
          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>Sending anonymized report…</span>
        </div>
      )}

      {step === 'done' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>Report shared!</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                Your anonymous report helps protect others from the same scam.
              </div>
            </div>
          </div>
          {sharedCount > 0 && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
              fontSize: 13, color: 'var(--text)',
            }}>
              🌍 <strong>{sharedCount}</strong> people have now reported this type of scam.
              Others in your community will be warned automatically.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
