'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// face-api.js needs browser APIs — never SSR
const FaceCam = dynamic(() => import('@/components/FaceCam'), { ssr: false })

type Tab = 'signin' | 'register'

interface UserProfile {
  id: string
  name: string
  email: string
  region?: string
  never_used_crypto?: boolean
  never_sent_giftcards?: boolean
  known_domains?: string[]
  trusted_contacts?: string[]
}

function saveSession(profile: UserProfile) {
  localStorage.setItem('ss-user-id', profile.id)
  localStorage.setItem('ss-user-profile', JSON.stringify(profile))
}

function LoginContent() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('signin')
  const [showFace, setShowFace] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sign-in fields
  const [siEmail,    setSiEmail]    = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Register fields
  const [regName,     setRegName]     = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRegion,   setRegRegion]   = useState('')
  const [regNoCrypto, setRegNoCrypto] = useState(false)
  const [regNoGift,   setRegNoGift]   = useState(false)
  const [regContacts, setRegContacts] = useState('')  // comma-separated
  const [regDomains,  setRegDomains]  = useState('')  // comma-separated

  // Current logged-in user (for Face ID re-auth)
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    // If already logged in, read profile for Face ID
    try {
      const raw = localStorage.getItem('ss-user-profile')
      if (raw) setCurrentProfile(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const goToDashboard = () => router.push('/dashboard/analysis')

  const handleSignIn = async () => {
    if (!siEmail || !siPassword) { setError('Enter email and password.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: siEmail, password: siPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Login failed'); return }
      saveSession(data)
      goToDashboard()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) { setError('Name, email and password are required.'); return }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    const known_domains  = regDomains.split(',').map(s => s.trim()).filter(Boolean)
    const trusted_contacts = regContacts.split(',').map(s => s.trim()).filter(Boolean)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:               regName,
          email:              regEmail,
          password:           regPassword,
          region:             regRegion || undefined,
          never_used_crypto:  regNoCrypto,
          never_sent_giftcards: regNoGift,
          known_domains,
          trusted_contacts,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
      saveSession(data)
      goToDashboard()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    borderRadius: 8, border: '1px solid #e5e7eb',
    padding: '9px 12px', fontSize: 14, outline: 'none',
    background: '#fff', color: '#111827',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#374151', marginBottom: 4,
  }

  const toggleStyle = (on: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s',
    background: on ? '#dc2626' : '#d1d5db', border: 'none', position: 'relative',
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="grid min-h-screen md:grid-cols-2">

        {/* ── Left panel ── */}
        <section className="flex min-h-[40vh] flex-col justify-between border-r bg-[linear-gradient(140deg,rgba(31,41,55,0.95),rgba(220,38,38,0.82))] p-8 text-white md:min-h-screen">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">ScamShield</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">
              AI-powered scam protection,<br />personalised to you.
            </h1>
          </div>
          <div className="space-y-4 rounded-xl border border-white/20 bg-white/10 p-6">
            {[
              { icon: '🛡️', text: 'Your profile trains the AI to know your habits — so it can warn you personally.' },
              { icon: '📞', text: 'Live call monitoring listens in real-time and alerts you the moment something sounds wrong.' },
              { icon: '🔒', text: 'All data stays private. Face IDs never leave your device.' },
            ].map(({ icon, text }) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'rgba(255,255,255,0.85)' }}>{text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-white/60">Your information is used only to personalise scam detection for you.</p>
        </section>

        {/* ── Right panel ── */}
        <section className="flex items-center justify-center p-6 md:p-10 bg-gray-50">
          <div className="w-full max-w-md">

            {/* Tabs */}
            <div style={{
              display: 'flex', borderRadius: 10, background: '#f3f4f6',
              padding: 4, marginBottom: 24, border: '1px solid #e5e7eb',
            }}>
              {(['signin', 'register'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError('') }}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 7, border: 'none',
                    background: tab === t ? '#fff' : 'transparent',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    fontWeight: 600, fontSize: 14,
                    color: tab === t ? '#111827' : '#6b7280',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border bg-white p-8 shadow-sm">

              {error && (
                <div style={{
                  marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
                  fontSize: 13, color: '#dc2626',
                }}>{error}</div>
              )}

              {/* ── SIGN IN ── */}
              {tab === 'signin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Welcome back</h2>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={siEmail}
                      onChange={e => setSiEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input
                      type="password"
                      value={siPassword}
                      onChange={e => setSiPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={handleSignIn}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 9, border: 'none',
                      background: loading ? 'rgba(220,38,38,0.5)' : '#dc2626',
                      color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  </div>

                  <button
                    onClick={() => setShowFace(true)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      padding: '11px 16px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                      background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>👁️</span>
                    Sign in with Face ID
                  </button>
                </div>
              )}

              {/* ── CREATE ACCOUNT ── */}
              {tab === 'register' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Create your account</h2>

                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Margaret Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Region <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                    <input value={regRegion} onChange={e => setRegRegion(e.target.value)} placeholder="e.g. Ontario, Canada" style={inputStyle} />
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>
                      These help ScamShield personalise warnings for you.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }} onClick={() => setRegNoCrypto(v => !v)}>
                        I&apos;ve never used cryptocurrency
                      </label>
                      <button style={toggleStyle(regNoCrypto)} onClick={() => setRegNoCrypto(v => !v)} aria-pressed={regNoCrypto}>
                        <span style={{
                          position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                          left: regNoCrypto ? 18 : 4, transition: 'left 0.2s',
                        }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }} onClick={() => setRegNoGift(v => !v)}>
                        I&apos;ve never sent gift cards as payment
                      </label>
                      <button style={toggleStyle(regNoGift)} onClick={() => setRegNoGift(v => !v)} aria-pressed={regNoGift}>
                        <span style={{
                          position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                          left: regNoGift ? 18 : 4, transition: 'left 0.2s',
                        }} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Trusted contacts <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma-separated, optional)</span></label>
                    <input value={regContacts} onChange={e => setRegContacts(e.target.value)} placeholder="family, bank, doctor" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Known safe websites <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma-separated, optional)</span></label>
                    <input value={regDomains} onChange={e => setRegDomains(e.target.value)} placeholder="amazon.com, td.com, canada.ca" style={inputStyle} />
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 9, border: 'none',
                      background: loading ? 'rgba(220,38,38,0.5)' : '#dc2626',
                      color: '#fff', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>

                  <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                    👁️ Face ID can be enrolled from your profile after signing in.
                  </p>
                </div>
              )}

              <Link href="/" className="mt-5 inline-block text-sm font-medium text-gray-500 hover:text-gray-800">
                ← Back to landing
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Face cam modal */}
      {showFace && (
        <FaceCam
          personaId={currentProfile?.id ?? 'new'}
          personaName={(currentProfile?.name ?? regName) || 'You'}
          onSuccess={() => { setShowFace(false); goToDashboard() }}
          onClose={() => setShowFace(false)}
        />
      )}
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading…</div>
    }>
      <LoginContent />
    </Suspense>
  )
}
