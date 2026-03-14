import Link from 'next/link'
import {
  ShieldCheck,
  Brain,
  Eye,
  MessageSquare,
  ArrowRight,
  Users,
  GraduationCap,
  Globe,
  ScanSearch,
  Copy,
  RotateCcw,
  ChevronDown,
} from 'lucide-react'
import ThreeWavesBackground from '@/components/ThreeWavesBackground'

const quickTests = ['Crypto scam', 'Job offer', 'Bank alert', 'Safe message']
const resultTags = ['Never used crypto', 'Urgency pressure', 'Unknown sender', 'Suspicious link']

export default function LandingPage() {
  return (
    <main
      style={{ background: '#030712', color: '#f0f0f0', minHeight: '100vh', overflowX: 'hidden' }}
      id="main-content"
    >
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          position: 'absolute', top: -100, left: 16, zIndex: 9999,
          background: '#dc2626', color: '#fff', padding: '8px 16px',
          borderRadius: 6, fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}
      >
        Skip to content
      </a>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 40px', height: 60,
          background: 'rgba(3,7,18,0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck style={{ width: 20, height: 20, color: '#ef4444' }} aria-hidden="true" />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ScamShield</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="#how-it-works"
            style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none' }}>
            How it works
          </a>
          <a href="#demo"
            style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none' }}>
            See demo
          </a>
          <Link href="/login" style={{
            borderRadius: 8, background: '#dc2626', padding: '9px 20px',
            fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 16px rgba(220,38,38,0.35)',
          }}>
            Try it free
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          background: '#030712',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <ThreeWavesBackground />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(3,7,18,0.5) 0%, rgba(3,7,18,0.15) 40%, rgba(3,7,18,0.85) 90%, #030712 100%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Soft red glow */}
        <div style={{
          position: 'absolute', top: '45%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        <div style={{
          position: 'relative', zIndex: 10,
          maxWidth: 760, margin: '0 auto',
          padding: '120px 32px 100px',
          textAlign: 'center',
        }}>
          {/* Hackathon badge — subtle, at the top */}
          <div style={{
            display: 'inline-block',
            fontSize: 11, color: '#6b7280',
            marginBottom: 32, letterSpacing: '0.06em',
          }}>
            GenAI Genesis 2026
          </div>

          <h1
            id="hero-heading"
            style={{
              fontSize: 'clamp(44px, 7.5vw, 84px)',
              fontWeight: 900,
              lineHeight: 1.07,
              letterSpacing: '-0.03em',
              margin: '0 0 28px',
              color: '#fff',
            }}
          >
            Your AI Guardian<br />
            <span style={{
              background: 'linear-gradient(135deg, #f87171 0%, #dc2626 60%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Against Fraud
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2.5vw, 21px)',
            color: '#9ca3af',
            maxWidth: 520, margin: '0 auto 12px',
            lineHeight: 1.65,
          }}>
            Learns your habits. Spots what's off.{' '}
            <span style={{ color: '#d1d5db', fontWeight: 500 }}>
              Explains it in plain language — not jargon.
            </span>
          </p>

          {/* Trust line — helps less tech-savvy users */}
          <p style={{
            fontSize: 14, color: '#6b7280', marginBottom: 44,
          }}>
            Free to try &nbsp;·&nbsp; No account needed &nbsp;·&nbsp; Takes 30 seconds
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              borderRadius: 10, background: '#dc2626',
              padding: '17px 40px',
              fontSize: 17, fontWeight: 700, color: '#fff', textDecoration: 'none',
              boxShadow: '0 0 40px rgba(220,38,38,0.45)',
              letterSpacing: '-0.01em',
            }}>
              Try the Demo <ArrowRight style={{ width: 18, height: 18 }} aria-hidden="true" />
            </Link>
            <a href="#how-it-works" style={{
              display: 'inline-flex', alignItems: 'center',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.05)',
              padding: '17px 40px',
              fontSize: 17, fontWeight: 600, color: '#e5e7eb', textDecoration: 'none',
            }}>
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ──────────────────────────────────────── */}
      {/*  Deliberately asymmetric — one big featured stat, two smaller below */}
      <section
        id="problem"
        aria-labelledby="problem-heading"
        style={{ padding: '100px 40px', background: '#030712' }}
      >
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>

          {/* Editorial heading block */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 60, alignItems: 'end', marginBottom: 60,
          }}>
            <div>
              <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                Who gets targeted
              </p>
              <h2 id="problem-heading" style={{
                fontSize: 'clamp(30px, 4vw, 46px)',
                fontWeight: 800, letterSpacing: '-0.025em',
                color: '#fff', margin: 0, lineHeight: 1.1,
              }}>
                Scammers don&apos;t<br />pick targets randomly.
              </h2>
            </div>
            <p style={{
              fontSize: 16, color: '#6b7280', lineHeight: 1.8, margin: 0,
              paddingBottom: 4,
            }}>
              They study their victims first — looking for gaps in knowledge, trust in authority,
              and moments of vulnerability. Three groups are hit hardest.
            </p>
          </div>

          {/* Featured large card + two smaller */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
            {/* Featured: Seniors */}
            <div style={{
              borderRadius: 16,
              border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.04)',
              padding: '36px 32px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(239,68,68,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <Users style={{ width: 20, height: 20, color: '#ef4444' }} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Seniors</h3>
                <p style={{ fontSize: 15, color: '#9ca3af', lineHeight: 1.7, margin: '0 0 20px' }}>
                  Tech-support scams, fake Medicare calls, grandparent fraud.
                  Elderly adults are targeted because they&apos;re more likely to trust
                  and less likely to verify.
                </p>
              </div>
              <div style={{
                fontSize: 36, fontWeight: 900, color: '#ef4444',
                letterSpacing: '-0.03em',
              }}>
                $3B lost<br />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#6b7280' }}>every year in the US alone</span>
              </div>
            </div>

            {/* Right column: Students + Immigrants */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                borderRadius: 16,
                border: '1px solid rgba(249,115,22,0.2)',
                background: 'rgba(249,115,22,0.04)',
                padding: '24px 24px', flex: 1,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(249,115,22,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <GraduationCap style={{ width: 18, height: 18, color: '#f97316' }} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Students</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Fake job offers, rental scams, scholarship fraud. Desperate for opportunities and short on experience.
                </p>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#f97316' }}>1 in 3</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}> students are targeted</span>
              </div>

              <div style={{
                borderRadius: 16,
                border: '1px solid rgba(245,158,11,0.2)',
                background: 'rgba(245,158,11,0.04)',
                padding: '24px 24px', flex: 1,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(245,158,11,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Globe style={{ width: 18, height: 18, color: '#f59e0b' }} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Immigrants</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, margin: '0 0 16px' }}>
                  Authority impersonation, CRA fraud, visa scams. Language barriers and unfamiliarity with local systems are exploited.
                </p>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Language barriers exploited</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section
        id="how-it-works"
        aria-labelledby="hiw-heading"
        style={{
          padding: '100px 40px',
          background: 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <h2 id="hiw-heading" style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800, letterSpacing: '-0.025em',
            color: '#fff', margin: '0 0 64px',
          }}>
            How it works
          </h2>

          {/* Numbered steps — horizontal rule between them */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                num: '1', Icon: Brain,
                title: 'It learns your patterns',
                desc: 'ScamShield builds a quiet behavioral profile — the senders you normally hear from, the types of payments you make, the sites you use. It takes about a minute to set up.',
              },
              {
                num: '2', Icon: Eye,
                title: 'You paste anything suspicious',
                desc: 'Got a weird text? A job offer that feels off? An email asking you to click something? Paste it in. ScamShield checks it against your profile, not just a generic list of bad words.',
              },
              {
                num: '3', Icon: MessageSquare,
                title: 'It explains what it found',
                desc: '"You\'ve never received a payment request from this sender before. This pattern matches known gift-card scams." Clear language. No tech jargon. Action steps included.',
              },
            ].map(({ num, Icon, title, desc }, i, arr) => (
              <div key={num}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr',
                  gap: 32, padding: '40px 0', alignItems: 'start',
                }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(220,38,38,0.1)',
                      border: '1.5px solid rgba(220,38,38,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: 22, height: 22, color: '#f87171' }} aria-hidden="true" />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#3d3d3d',
                      letterSpacing: '0.04em',
                    }}>0{num}</span>
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>{title}</h3>
                    <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.75, margin: 0, maxWidth: 560 }}>{desc}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: 80 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ────────────────────────────────────────── */}
      <section
        id="demo"
        aria-labelledby="demo-heading"
        style={{ padding: '100px 40px', background: '#030712' }}
      >
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ marginBottom: 48 }}>
            <h2 id="demo-heading" style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800, letterSpacing: '-0.025em',
              color: '#fff', margin: '0 0 12px',
            }}>
              See it protect Margaret
            </h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, lineHeight: 1.7, margin: 0 }}>
              Margaret is 72. She doesn&apos;t use Bitcoin. Here&apos;s what ScamShield tells her.
            </p>
          </div>

          {/* Mock browser window */}
          <div style={{
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.07)',
            background: '#0d1117',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          }}>
            {/* Chrome bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 18px',
              background: 'rgba(0,0,0,0.5)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(239,68,68,0.5)' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(234,179,8,0.5)' }} />
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(34,197,94,0.5)' }} />
              <span style={{ marginLeft: 12, fontSize: 11, color: '#4b5563', fontFamily: 'monospace' }}>
                ScamShield — Analysis Room
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 4px #22c55e' }} />
                Viewing as Margaret
              </span>
            </div>

            {/* Content grid */}
            <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr' }}>
              {/* Input */}
              <div style={{ padding: '26px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
                  Input · Text message
                </div>
                <div style={{
                  borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(0,0,0,0.4)', padding: '14px',
                  fontSize: 13, color: '#9ca3af', lineHeight: 1.7, fontFamily: 'monospace', minHeight: 96,
                }}>
                  URGENT: Your Amazon account has been suspended. Send $500 in Bitcoin to restore access immediately. Click: bit.ly/amzn-restore
                </div>
                <div style={{
                  marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '11px 0', borderRadius: 8, background: '#dc2626',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  boxShadow: '0 0 18px rgba(220,38,38,0.3)',
                }}>
                  <ScanSearch style={{ width: 14, height: 14 }} aria-hidden="true" /> Analyze
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Quick tests</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {quickTests.map(t => (
                      <span key={t} style={{
                        fontSize: 11, borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.07)',
                        padding: '4px 10px', color: '#6b7280',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Result */}
              <div style={{ padding: '26px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>
                  Analysis Result
                </div>

                {/* Score row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20,
                  padding: '16px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                }}>
                  <svg width="80" height="80" viewBox="0 0 96 96" style={{ flexShrink: 0 }} aria-label="Risk score: 87 out of 100">
                    <circle cx="48" cy="48" r="36" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <circle cx="48" cy="48" r="36" fill="none" stroke="#dc2626" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="226.2" strokeDashoffset="29"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }}
                    />
                    <text x="48" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="system-ui,sans-serif">87</text>
                    <text x="48" y="60" textAnchor="middle" fill="#4b5563" fontSize="10" fontFamily="system-ui,sans-serif">/100</text>
                  </svg>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: '#f87171',
                      background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)',
                      display: 'inline-block', borderRadius: 999, padding: '3px 10px', marginBottom: 6,
                    }}>⚠ HIGH RISK</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>This is a scam</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Matched to Margaret&apos;s profile</div>
                  </div>
                </div>

                {/* Personalized reason */}
                <div style={{
                  borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(0,0,0,0.3)', padding: '13px 15px', marginBottom: 14,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
                    Why it matters for Margaret
                  </div>
                  <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                    &ldquo;You&apos;ve never used Bitcoin or made wire transfers. This urgency is very unusual for you — this is almost certainly a scam.&rdquo;
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {resultTags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, borderRadius: 999,
                      background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(239,68,68,0.22)',
                      color: '#fca5a5', padding: '4px 10px',
                    }}>{tag}</span>
                  ))}
                </div>

                <div style={{
                  borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)', padding: '13px 15px', marginBottom: 14,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db', marginBottom: 4 }}>What to do</div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
                    Do not click any links or send money. Contact Amazon directly through amazon.com or your account app.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: 11, color: '#6b7280', cursor: 'default',
                  }}>
                    <Copy style={{ width: 11, height: 11 }} aria-hidden="true" /> Copy
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: 11, color: '#6b7280', cursor: 'default',
                  }}>
                    <RotateCcw style={{ width: 11, height: 11 }} aria-hidden="true" /> Re-run
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontSize: 11, color: '#6b7280', cursor: 'default',
                  }}>
                    <ChevronDown style={{ width: 11, height: 11 }} aria-hidden="true" /> Raw JSON
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 44, textAlign: 'center' }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              borderRadius: 10, background: '#dc2626',
              padding: '16px 44px', fontSize: 17, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 0 40px rgba(220,38,38,0.4)',
            }}>
              Try it yourself — it&apos;s free <ArrowRight style={{ width: 17, height: 17 }} aria-hidden="true" />
            </Link>
            <p style={{ fontSize: 13, color: '#4b5563', marginTop: 12 }}>No signup · Choose a persona · See results in seconds</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        role="contentinfo"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: '#030712',
          padding: '56px 40px',
        }}
      >
        <div style={{
          maxWidth: 1060, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-between', gap: 32,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck style={{ width: 18, height: 18, color: '#ef4444' }} aria-hidden="true" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>ScamShield</span>
            </div>
            <p style={{ fontSize: 13, color: '#4b5563', maxWidth: 280, lineHeight: 1.7, margin: 0 }}>
              Built at GenAI Genesis 2026 to protect people who get targeted most.
              Powered by IBM Watsonx.ai.
            </p>
          </div>
          <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 2 }}>
            <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Targeting prizes</div>
            <div>TD Financial Safety Track</div>
            <div>Google AI Impact Track</div>
            <div>Responsible AI Track</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
            <Link href="/demo" style={{ fontSize: 13, color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
              Side-by-side comparison →
            </Link>
            <Link href="/login" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>
              Try the demo
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
