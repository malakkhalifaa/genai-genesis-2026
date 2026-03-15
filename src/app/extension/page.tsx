import Link from 'next/link'
import { ShieldCheck, Download, Chrome, MonitorDot, BookOpen } from 'lucide-react'

const steps = [
  {
    num: 1,
    title: 'Download the extension',
    body: 'Click the button above to download the ScamShield extension zip file to your computer.',
  },
  {
    num: 2,
    title: 'Unzip the file',
    body: 'Find the downloaded file (usually in your Downloads folder) and unzip/extract it to a permanent folder — e.g. Documents/ScamShield-Extension.',
  },
  {
    num: 3,
    title: 'Open your browser extensions page',
    body: null,
    browsers: [
      { name: 'Chrome',  icon: '🌐', url: 'chrome://extensions'  },
      { name: 'Edge',    icon: '🔵', url: 'edge://extensions'     },
      { name: 'Brave',   icon: '🦁', url: 'brave://extensions'    },
    ],
  },
  {
    num: 4,
    title: 'Enable Developer mode',
    body: 'Look for the "Developer mode" toggle in the top-right corner of the extensions page and turn it on.',
  },
  {
    num: 5,
    title: 'Load the unpacked extension',
    body: 'Click "Load unpacked", then select the folder you unzipped in step 2. ScamShield will appear in your extensions list.',
  },
  {
    num: 6,
    title: 'Pin the extension (optional but recommended)',
    body: 'Click the puzzle-piece icon in your browser toolbar → find ScamShield → click the pin icon so it always shows in the toolbar.',
  },
]

export default function ExtensionPage() {
  return (
    <main style={{ background: '#030712', color: '#f0f0f0', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        background: 'rgba(3,7,18,0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f0f0f0' }}>
          <ShieldCheck style={{ width: 20, height: 20, color: '#ef4444' }} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ScamShield</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{
            padding: '8px 18px', borderRadius: 8,
            background: '#dc2626', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 120, paddingBottom: 60,
        textAlign: 'center', maxWidth: 720, margin: '0 auto', padding: '120px 32px 60px',
      }}>
        {/* Browser extension icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.08))',
          border: '1px solid rgba(220,38,38,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
        }}>
          🛡️
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 54px)',
          fontWeight: 900, letterSpacing: '-0.03em',
          lineHeight: 1.1, margin: '0 0 16px',
          color: '#fff',
        }}>
          ScamShield Browser Extension
        </h1>
        <p style={{ fontSize: 16, color: '#9ca3af', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
          Analyse any webpage, email, or text for scams in one click — directly from your browser toolbar.
        </p>

        {/* Download button */}
        <a
          href="/scamshield-extension.zip"
          download="scamshield-extension.zip"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 32px', borderRadius: 12,
            background: '#dc2626',
            boxShadow: '0 0 32px rgba(220,38,38,0.4)',
            color: '#fff', fontSize: 16, fontWeight: 700,
            textDecoration: 'none', transition: 'all 0.2s',
          }}
        >
          <Download style={{ width: 20, height: 20 }} />
          Download Extension (.zip)
        </a>

        <p style={{ marginTop: 12, fontSize: 12, color: '#4b5563' }}>
          Free · Chrome · Edge · Brave · No account required
        </p>

        {/* Compatibility badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {['🌐 Chrome', '🔵 Edge', '🦁 Brave'].map(b => (
            <div key={b} style={{
              padding: '6px 16px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              fontSize: 13, color: '#9ca3af',
            }}>
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* ── INSTALLATION STEPS ── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 32,
        }}>
          <BookOpen style={{ width: 18, height: 18, color: '#ef4444' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>
            Installation Steps
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step, idx) => (
            <div
              key={step.num}
              style={{
                display: 'flex', gap: 18,
                padding: '20px 24px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Step number */}
              <div style={{
                flexShrink: 0,
                width: 36, height: 36, borderRadius: '50%',
                background: idx === 0 ? '#dc2626' : 'rgba(220,38,38,0.15)',
                border: `1px solid ${idx === 0 ? '#dc2626' : 'rgba(220,38,38,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
                color: idx === 0 ? '#fff' : '#ef4444',
              }}>
                {step.num}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {step.title}
                </div>

                {step.body && (
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>
                    {step.body}
                  </p>
                )}

                {/* Browser links for step 3 */}
                {step.browsers && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {step.browsers.map(b => (
                      <div key={b.name} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        fontSize: 13, color: '#9ca3af',
                      }}>
                        <span>{b.icon}</span>
                        <span style={{ fontWeight: 600, color: '#d1d5db', minWidth: 52 }}>{b.name}:</span>
                        <code style={{
                          padding: '2px 10px', borderRadius: 6,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          fontSize: 12, color: '#60a5fa', fontFamily: 'ui-monospace, monospace',
                        }}>
                          {b.url}
                        </code>
                      </div>
                    ))}
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                      Copy the address above and paste it into your browser&apos;s address bar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success note */}
        <div style={{
          marginTop: 28, padding: '18px 22px', borderRadius: 14,
          background: 'rgba(74,222,128,0.06)',
          border: '1px solid rgba(74,222,128,0.2)',
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>✅</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>
              You&apos;re all set!
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
              Click the ScamShield icon in your toolbar to start protecting yourself.
              The extension connects to <span style={{ color: '#9ca3af' }}>demo-sigma-nine-38.vercel.app</span> automatically —
              no setup needed.
            </p>
          </div>
        </div>

        {/* Create account CTA */}
        <div style={{
          marginTop: 20, padding: '18px 22px', borderRadius: 14,
          background: 'rgba(220,38,38,0.06)',
          border: '1px solid rgba(220,38,38,0.2)',
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🧠</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f87171', marginBottom: 3 }}>
              Personalize your protection
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Create a free account so ScamShield can learn your habits and warn you by name.
            </p>
          </div>
          <Link href="/login" style={{
            flexShrink: 0, padding: '8px 18px', borderRadius: 8,
            background: '#dc2626', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            Create account
          </Link>
        </div>
      </section>

    </main>
  )
}
