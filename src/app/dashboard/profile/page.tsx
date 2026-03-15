'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getScans } from '@/lib/scanStorage'
import VulnerabilityScore from '@/components/VulnerabilityScore'

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
}

interface UserProfile {
  id?: string
  name?: string
  email?: string
  region?: string
  never_used_crypto?: boolean
  never_sent_giftcards?: boolean
  known_domains?: string[]
  trusted_contacts?: string[]
  created_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Editable fields
  const [name,     setName]     = useState('')
  const [region,   setRegion]   = useState('')
  const [noCrypto, setNoCrypto] = useState(false)
  const [noGift,   setNoGift]   = useState(false)
  const [contacts, setContacts] = useState('')
  const [domains,  setDomains]  = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ss-user-profile')
      if (!raw) return
      const p: UserProfile = JSON.parse(raw)
      setProfile(p)
      setName(p.name ?? '')
      setRegion(p.region ?? '')
      setNoCrypto(!!p.never_used_crypto)
      setNoGift(!!p.never_sent_giftcards)
      setContacts((p.trusted_contacts ?? []).join(', '))
      setDomains((p.known_domains ?? []).join(', '))

      const userId = localStorage.getItem('ss-user-id') ?? undefined
      setScanCount(getScans(userId).length)
    } catch { /* ignore */ }
  }, [])

  const handleSave = async () => {
    const userId = localStorage.getItem('ss-user-id')
    if (!userId) return
    setSaving(true)
    const update = {
      userId,
      name,
      region: region || undefined,
      never_used_crypto: noCrypto,
      never_sent_giftcards: noGift,
      trusted_contacts: contacts.split(',').map(s => s.trim()).filter(Boolean),
      known_domains:    domains.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })
      if (res.ok) {
        const updated = await res.json()
        const merged = { ...profile, ...updated }
        localStorage.setItem('ss-user-profile', JSON.stringify(merged))
        setProfile(merged)
      } else {
        // Update localStorage even if DB unavailable
        const merged = { ...profile, name, region, never_used_crypto: noCrypto, never_sent_giftcards: noGift }
        localStorage.setItem('ss-user-profile', JSON.stringify(merged))
        setProfile(merged)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('ss-user-id')
    localStorage.removeItem('ss-user-profile')
    router.push('/login')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    borderRadius: 8, border: '1px solid var(--border)',
    padding: '8px 12px', fontSize: 13, outline: 'none',
    background: 'var(--bg)', color: 'var(--text)',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    display: 'block', marginBottom: 5,
  }

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s',
    background: on ? 'var(--accent)' : 'var(--border)', border: 'none', position: 'relative',
  })

  if (!profile) {
    return (
      <div style={{ maxWidth: 600, textAlign: 'center', paddingTop: 80 }}>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 20 }}>
          No profile found. Please sign in first.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '10px 24px', borderRadius: 9, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Go to Login
        </button>
      </div>
    )
  }

  const initials = (profile.name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long' })
    : 'Recently'

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>
        My Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginBottom: 20 }}>

        {/* ── Left: Avatar card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            ...card, padding: '24px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--accent-soft)', border: '2px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'var(--accent)', marginBottom: 14,
            }}>
              {initials}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{profile.email}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Member since {memberSince}</div>
            {profile.region && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>📍 {profile.region}</div>
            )}

            <div style={{ height: 1, background: 'var(--border)', width: '100%', margin: '14px 0' }} />

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)',
                fontSize: 12, fontWeight: 500, color: '#ef4444', cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Activity
            </div>
            {[
              { label: 'Scans run', value: String(scanCount) },
              { label: 'Crypto known', value: profile.never_used_crypto ? 'No' : 'Yes' },
              { label: 'Gift card user', value: profile.never_sent_giftcards ? 'No' : 'Yes' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Edit form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {saved && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)',
              fontSize: 13, color: '#4ade80', fontWeight: 500,
            }}>
              ✓ Profile saved
            </div>
          )}

          <div style={{ ...card, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Personal details</div>

            <div>
              <label style={labelStyle}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Region</label>
              <input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. Ontario, Canada" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Trusted contacts <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-3)' }}>(comma-separated)</span></label>
              <input value={contacts} onChange={e => setContacts(e.target.value)} placeholder="family, bank, doctor" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Known safe websites <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-3)' }}>(comma-separated)</span></label>
              <input value={domains} onChange={e => setDomains(e.target.value)} placeholder="amazon.com, td.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Behaviour flags</div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 14px' }}>
              These help ScamShield personalise warnings specifically for you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>I&apos;ve never used cryptocurrency</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Any crypto request will be flagged as highly suspicious</div>
                </div>
                <button style={toggleStyle(noCrypto)} onClick={() => setNoCrypto(v => !v)} aria-pressed={noCrypto}>
                  <span style={{
                    position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    left: noCrypto ? 18 : 4, transition: 'left 0.2s',
                  }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>I&apos;ve never sent gift cards as payment</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Gift card requests will be treated as a strong scam signal</div>
                </div>
                <button style={toggleStyle(noGift)} onClick={() => setNoGift(v => !v)} aria-pressed={noGift}>
                  <span style={{
                    position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                    left: noGift ? 18 : 4, transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '11px 0', borderRadius: 9, border: 'none',
              background: saving ? 'rgba(220,38,38,0.5)' : 'var(--accent)',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Vulnerability Score ── */}
      <div style={{ marginTop: 20 }}>
        <VulnerabilityScore profile={profile} />
      </div>
    </div>
  )
}
