'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Link2, Mail, Image as ImageIcon, ScanSearch, Loader2, Copy, RotateCcw, ChevronDown } from 'lucide-react'
import { analyzeInput, normalizePersona, personas, quickTests, type AnalysisResult } from '@/lib/mockData'

type InputMode = 'text' | 'link' | 'email' | 'screenshot'

const inputModes: { id: InputMode; label: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { id: 'text',       label: 'Text',       Icon: FileText  },
  { id: 'link',       label: 'URL',        Icon: Link2     },
  { id: 'email',      label: 'Email',      Icon: Mail      },
  { id: 'screenshot', label: 'Screenshot', Icon: ImageIcon },
]

const riskMeta = {
  'HIGH RISK':   { bgVar: 'var(--risk-high-bg)',  borderVar: 'var(--risk-high-border)', textVar: 'var(--risk-high-text)', icon: '⚠️', strokeColor: '#ef4444' },
  'MEDIUM RISK': { bgVar: 'var(--risk-med-bg)',   borderVar: 'var(--risk-med-border)',  textVar: 'var(--risk-med-text)',  icon: '⚠️', strokeColor: '#f97316' },
  'LOW RISK':    { bgVar: 'var(--risk-low-bg)',   borderVar: 'var(--risk-low-border)',  textVar: 'var(--risk-low-text)',  icon: '✓',  strokeColor: '#22c55e' },
}

const progressSteps = [
  'Loading behavioral profile',
  'Comparing message patterns',
  'Scoring risk indicators',
  'Generating explanation',
]

function AnalysisContent() {
  const searchParams = useSearchParams()
  const personaId   = normalizePersona(searchParams.get('persona'))
  const sample      = searchParams.get('sample')
  const persona     = personas[personaId]
  const sampleContent = useMemo(() => quickTests.find(q => q.id === sample)?.content ?? '', [sample])

  const [mode,        setMode]        = useState<InputMode>('text')
  const [input,       setInput]       = useState(sampleContent)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result,      setResult]      = useState<AnalysisResult | null>(null)
  const [scoreView,   setScoreView]   = useState(0)
  const [stepIndex,   setStepIndex]   = useState(0)
  const [showRaw,     setShowRaw]     = useState(false)

  useEffect(() => {
    if (!result) return
    setScoreView(0)
    let n = 0
    const t = setInterval(() => {
      n += 2
      if (n >= result.riskScore) { setScoreView(result.riskScore); clearInterval(t); return }
      setScoreView(n)
    }, 14)
    return () => clearInterval(t)
  }, [result])

  useEffect(() => {
    if (!isAnalyzing) { setStepIndex(0); return }
    const t = setInterval(() => setStepIndex(i => Math.min(i + 1, progressSteps.length - 1)), 280)
    return () => clearInterval(t)
  }, [isAnalyzing])

  const runAnalysis = async () => {
    const text = (input || sampleContent).trim()
    if (!text) return
    setIsAnalyzing(true)
    setResult(null)
    setScoreView(0)
    setStepIndex(0)
    await new Promise(r => setTimeout(r, 1400))
    setResult(analyzeInput(personaId, text))
    setIsAnalyzing(false)
  }

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    overflow: 'hidden',
  }

  const cardHeader: React.CSSProperties = {
    padding: '14px 18px 12px',
    borderBottom: '1px solid var(--border)',
    fontSize: 11, fontWeight: 700,
    color: 'var(--text-2)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  }

  const risk = result ? riskMeta[result.riskLabel] : null

  // SVG gauge radius
  const R = 36
  const CIRC = 2 * Math.PI * R
  const dashOffset = result ? CIRC * (1 - scoreView / 100) : CIRC

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: 16,
      alignItems: 'start',
    }}>
      {/* ── LEFT: Input panel ── */}
      <div style={card}>
        <div style={cardHeader}>New Scan</div>
        <div style={{ padding: '16px 16px 20px' }}>

          {/* Persona pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--accent-border)',
            background: 'var(--accent-soft)',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 18 }}>{persona.avatar}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Analyzing as {persona.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{persona.role}</div>
            </div>
          </div>

          {/* Input mode tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
            marginBottom: 14,
          }}>
            {inputModes.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '8px 4px', borderRadius: 8,
                  border: '1px solid ' + (mode === id ? 'var(--accent-border)' : 'var(--border)'),
                  background: mode === id ? 'var(--accent-soft)' : 'transparent',
                  color: mode === id ? 'var(--accent)' : 'var(--text-2)',
                  fontSize: 10, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Icon style={{ width: 13, height: 13 }} />
                {label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={input || sampleContent}
            onChange={e => setInput(e.target.value)}
            placeholder={`Paste ${mode} content to analyze…`}
            rows={8}
            style={{
              width: '100%', boxSizing: 'border-box',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13, lineHeight: 1.6,
              padding: '10px 12px',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {/* Analyze button */}
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            style={{
              width: '100%', marginTop: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 0', borderRadius: 8,
              border: 'none',
              background: isAnalyzing ? 'rgba(220,38,38,0.5)' : 'var(--accent)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: isAnalyzing ? 'none' : '0 0 20px rgba(220,38,38,0.25)',
            }}
          >
            {isAnalyzing
              ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Analyzing…</>
              : <><ScanSearch style={{ width: 14, height: 14 }} /> Analyze</>}
          </button>

          {/* Divider + quick tests */}
          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0 12px' }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Quick Tests
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {quickTests.map(qt => (
              <button
                key={qt.id}
                onClick={() => setInput(qt.content)}
                style={{
                  textAlign: 'left', padding: '7px 10px', borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-2)',
                  fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Results / Progress ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Progress card — shown while analyzing */}
        {isAnalyzing && (
          <div style={card}>
            <div style={cardHeader}>Analyzing…</div>
            <div style={{ padding: '20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {progressSteps.map((step, i) => {
                  const done    = i < stepIndex
                  const active  = i === stepIndex
                  const pending = i > stepIndex
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: done ? 'rgba(34,197,94,0.15)' : active ? 'var(--accent-soft)' : 'var(--border)',
                        border: `1.5px solid ${done ? 'rgba(34,197,94,0.4)' : active ? 'var(--accent-border)' : 'transparent'}`,
                        fontSize: 11,
                        color: done ? '#4ade80' : active ? 'var(--accent)' : 'var(--text-3)',
                      }}>
                        {done ? '✓' : active ? <Loader2 style={{ width: 10, height: 10, animation: 'spin 1s linear infinite' }} /> : '○'}
                      </div>
                      <span style={{
                        fontSize: 13,
                        color: done ? 'var(--text-2)' : active ? 'var(--text)' : 'var(--text-3)',
                        fontWeight: active ? 500 : 400,
                      }}>{step}</span>
                    </div>
                  )
                })}
              </div>
              {/* Progress bar */}
              <div style={{
                height: 4, borderRadius: 2,
                background: 'var(--border)',
                marginTop: 20, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: 'var(--accent)',
                  width: `${(stepIndex / (progressSteps.length - 1)) * 80 + 10}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8, textAlign: 'center' }}>
                Comparing to {persona.name}&apos;s behavioral profile…
              </div>
            </div>
          </div>
        )}

        {/* Results card — shown after analysis */}
        {result && risk && !isAnalyzing ? (
          <div style={card}>
            <div style={cardHeader}>Analysis Result</div>
            <div style={{ padding: '20px' }}>

              {/* Risk score hero */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '16px 18px',
                borderRadius: 10,
                background: risk.bgVar,
                border: `1px solid ${risk.borderVar}`,
                marginBottom: 18,
              }}>
                {/* SVG gauge */}
                <svg width="88" height="88" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
                  <circle cx="48" cy="48" r={R} fill="none" stroke="var(--border)" strokeWidth="8" />
                  <circle
                    cx="48" cy="48" r={R}
                    fill="none" stroke={risk.strokeColor} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dashoffset 0.05s' }}
                  />
                  <text x="48" y="46" textAnchor="middle" fill={risk.strokeColor} fontSize="18" fontWeight="900" fontFamily="system-ui,sans-serif">{scoreView}</text>
                  <text x="48" y="59" textAnchor="middle" fill="var(--text-3)" fontSize="9" fontFamily="system-ui,sans-serif">/100</text>
                </svg>

                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    borderRadius: 999,
                    border: `1px solid ${risk.borderVar}`,
                    padding: '4px 10px',
                    fontSize: 11, fontWeight: 700,
                    color: risk.textVar,
                    marginBottom: 6,
                  }}>
                    {risk.icon} {result.riskLabel}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
                    {result.riskLabel === 'LOW RISK' ? 'Looks safe' : 'Scam detected'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    Scored against {persona.name}&apos;s profile
                  </div>
                </div>
              </div>

              {/* Personalized reason */}
              <div style={{
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--bg)',
                padding: '14px 16px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Why this matters for {persona.name}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                  &ldquo;{result.reason}&rdquo;
                </p>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {result.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, borderRadius: 999,
                    background: risk.bgVar,
                    border: `1px solid ${risk.borderVar}`,
                    color: risk.textVar,
                    padding: '4px 10px', fontWeight: 500,
                  }}>{tag}</span>
                ))}
              </div>

              {/* Action */}
              <div style={{
                borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--card-hover)',
                padding: '14px 16px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 5 }}>What to do</div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{result.action}</p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--card)',
                  color: 'var(--text-2)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  <Copy style={{ width: 12, height: 12 }} /> Copy
                </button>
                <button
                  onClick={runAnalysis}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--card)',
                    color: 'var(--text-2)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw style={{ width: 12, height: 12 }} /> Re-run
                </button>
              </div>

              {/* Raw JSON toggle */}
              <button
                onClick={() => setShowRaw(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-2)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <ChevronDown style={{ width: 12, height: 12, transform: showRaw ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                Raw JSON output
              </button>
              {showRaw && (
                <pre style={{
                  marginTop: 8, padding: '12px 14px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: 11, lineHeight: 1.6,
                  color: 'var(--text-2)', overflow: 'auto',
                  maxHeight: 200,
                }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : !isAnalyzing && (
          <div style={{
            ...card,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 320, padding: 32,
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <ScanSearch style={{ width: 26, height: 26, color: 'var(--accent)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              Ready to protect {persona.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 260, lineHeight: 1.6 }}>
              Paste a message, link, or email on the left and click Analyze.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <Loader2 style={{ width: 28, height: 28, color: 'var(--text-2)', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}
