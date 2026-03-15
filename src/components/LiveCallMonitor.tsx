'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, RotateCcw, AlertTriangle, PhoneCall } from 'lucide-react'
import { useLiveCall, LiveAlert } from '@/hooks/useLiveCall'
import { personas } from '@/lib/mockData'
import type { PersonaId } from '@/lib/mockData'
import { useLanguage } from '@/hooks/useLanguage'
import { saveCallSession } from '@/lib/callStorage'

interface Props {
  personaId: PersonaId
}

const RISK_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'CRITICAL',  color: '#fff',    bg: 'rgba(220,38,38,0.85)',   border: '#dc2626' },
  high:     { label: 'HIGH RISK', color: '#fff',    bg: 'rgba(234,88,12,0.75)',   border: '#ea580c' },
  medium:   { label: 'MEDIUM',    color: '#fff',    bg: 'rgba(202,138,4,0.65)',   border: '#ca8a04' },
  low:      { label: 'LOW',       color: '#aaa',    bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
}

function AlertBadge({ alert }: { alert: LiveAlert }) {
  const meta = RISK_META[alert.riskLevel] ?? RISK_META.low
  const time  = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <div style={{
      background: meta.bg, border: `1px solid ${meta.border}`,
      borderRadius: 8, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 4,
      animation: 'ss-fadein 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 11, color: meta.color, letterSpacing: '0.06em' }}>
          {meta.label}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{time}</span>
      </div>
      <p style={{ fontSize: 12, color: meta.color, opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
        {alert.reason}
      </p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: 0, fontStyle: 'italic' }}>
        &ldquo;{alert.snippet}&rdquo;
      </p>
    </div>
  )
}

export default function LiveCallMonitor({ personaId }: Props) {
  const persona = personas[personaId]
  const { t, speechLang } = useLanguage()
  const [userId,    setUserId]    = useState<string | undefined>(undefined)
  const [clientIp,  setClientIp]  = useState<string | undefined>(undefined)
  const startedAtRef = useRef<string | null>(null)
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined

  useEffect(() => {
    try {
      const id = localStorage.getItem('ss-user-id')
      if (id) setUserId(id)
    } catch { /* ignore */ }
    fetch('/api/ip').then(r => r.json()).then(d => setClientIp(d.ip)).catch(() => {})
  }, [])

  const {
    isListening, transcript, interimTranscript,
    alerts, error, startCall: rawStartCall, stopCall: rawStopCall, resetCall: rawResetCall,
  } = useLiveCall(personaId, speechLang, userId, clientIp)

  const saveSession = (finalTranscript: string, finalAlerts: LiveAlert[]) => {
    if (!finalTranscript && finalAlerts.length === 0) return
    const endedAt = new Date().toISOString()
    const startedAt = startedAtRef.current ?? endedAt
    const durationSeconds = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000)
    const highestRisk = (['critical', 'high', 'medium'].find(r => finalAlerts.some(a => a.riskLevel === r)) ?? 'none') as 'none' | 'medium' | 'high' | 'critical'
    const session = saveCallSession({
      userId,
      startedAt,
      endedAt,
      durationSeconds,
      transcript: finalTranscript,
      alerts: finalAlerts,
      alertCount: finalAlerts.length,
      highestRisk,
      ipAddress: clientIp,
      timezone,
    })
    // Fire-and-forget DB persistence
    fetch('/api/call-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...session, userId: userId ?? null }),
    }).catch(() => {})
    startedAtRef.current = null
  }

  const startCall = () => {
    startedAtRef.current = new Date().toISOString()
    rawStartCall()
  }

  const stopCall = () => {
    saveSession(transcript, alerts)
    rawStopCall()
  }

  const resetCall = () => {
    saveSession(transcript, alerts)
    rawResetCall()
  }

  const transcriptEl = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript box
  useEffect(() => {
    const el = transcriptEl.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript, interimTranscript])

  const highestRisk = alerts.length > 0
    ? (['critical', 'high', 'medium', 'low'].find(r => alerts.some(a => a.riskLevel === r)) ?? 'low')
    : null

  const statusColor = !isListening ? 'var(--text-3)'
    : highestRisk === 'critical' ? '#ef4444'
    : highestRisk === 'high'     ? '#f97316'
    : highestRisk === 'medium'   ? '#eab308'
    : '#4ade80'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      maxWidth: 720, margin: '0 auto',
    }}>

      {/* ── Status bar ── */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pulsing dot */}
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isListening ? statusColor : 'var(--text-3)',
            display: 'inline-block',
            boxShadow: isListening ? `0 0 0 0 ${statusColor}` : 'none',
            animation: isListening ? 'ss-pulse 1.4s ease-in-out infinite' : 'none',
          }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
            {isListening ? t.liveCall.liveLabel : t.liveCall.readyLabel}
          </span>
          {isListening && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: '#ef4444', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 4, padding: '2px 7px', letterSpacing: '0.04em',
            }}>{t.liveCall.recBadge}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{persona.avatar}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{persona.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{persona.role}</div>
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

        {/* Left: Transcript */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <PhoneCall style={{ width: 13, height: 13, color: 'var(--text-3)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              {t.liveCall.transcriptLabel}
            </span>
            {isListening && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>
                {t.liveCall.analysedEvery}
              </span>
            )}
          </div>

          <div
            ref={transcriptEl}
            style={{
              flex: 1, minHeight: 260, maxHeight: 360,
              overflowY: 'auto', padding: '14px 16px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 13, lineHeight: 1.7,
              color: 'var(--text)',
            }}
          >
            {transcript && (
              <span>{transcript}</span>
            )}
            {interimTranscript && (
              <span style={{ color: 'var(--text-3)', fontStyle: 'italic' }}>
                {interimTranscript}
              </span>
            )}
            {!transcript && !interimTranscript && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 8, padding: '40px 0',
              }}>
                <Mic style={{ width: 28, height: 28, color: 'var(--text-3)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  {isListening ? t.liveCall.listenMsg : t.liveCall.readyMsg}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {!isListening ? (
              <button
                onClick={startCall}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                  background: '#dc2626', border: 'none',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                }}
              >
                <Mic style={{ width: 14, height: 14 }} />
                {t.liveCall.startBtn}
              </button>
            ) : (
              <button
                onClick={stopCall}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 600,
                }}
              >
                <MicOff style={{ width: 14, height: 14 }} />
                {t.liveCall.stopBtn}
              </button>
            )}

            <button
              onClick={resetCall}
              title={t.liveCall.resetTitle}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                background: 'var(--card)', border: '1px solid var(--border)',
                color: 'var(--text-2)',
              }}
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
            </button>

            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: alerts.length > 0 ? '#ef4444' : 'var(--text-3)' }}>
                {alerts.length}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{t.liveCall.alertsCount}</div>
            </div>
          </div>
        </div>

        {/* Right: Alerts panel */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 14px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <AlertTriangle style={{ width: 13, height: 13, color: alerts.length > 0 ? '#ef4444' : 'var(--text-3)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              {t.liveCall.alertsLabel}
            </span>
          </div>

          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '12px',
            display: 'flex', flexDirection: 'column', gap: 8,
            minHeight: 260,
          }}>
            {alerts.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 8, padding: '40px 0',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>✓</div>
                <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
                  {t.liveCall.noAlerts}
                </span>
              </div>
            ) : (
              alerts.slice().reverse().map(a => <AlertBadge key={a.id} alert={a} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '12px 16px',
          fontSize: 13, color: '#f87171',
        }}>
          {error}
        </div>
      )}

      {/* ── Tips ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {[
          { icon: '📱', title: t.liveCall.tip1Title, body: t.liveCall.tip1Body },
          { icon: '⚡', title: t.liveCall.tip2Title, body: t.liveCall.tip2Body },
          { icon: '🔒', title: t.liveCall.tip3Title, body: t.liveCall.tip3Body },
        ].map(tip => (
          <div key={tip.title} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{tip.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{tip.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{tip.body}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ss-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${statusColor}66; }
          50%       { box-shadow: 0 0 0 6px ${statusColor}00; }
        }
        @keyframes ss-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
