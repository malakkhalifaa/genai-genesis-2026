'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { normalizePersona } from '@/lib/mockData'
import { getScans, type ScanRecord } from '@/lib/scanStorage'
import { getCallSessions, type CallSession } from '@/lib/callStorage'
import { useLanguage } from '@/hooks/useLanguage'

type Tab = 'scans' | 'calls'

function riskConfig(level: string) {
  if (level === 'critical' || level === 'high')
    return { bg: 'var(--risk-high-bg)', border: 'var(--risk-high-border)', text: 'var(--risk-high-text)', label: '⚠ HIGH' }
  if (level === 'medium')
    return { bg: 'var(--risk-med-bg)', border: 'var(--risk-med-border)', text: 'var(--risk-med-text)', label: '⚠ MEDIUM' }
  return { bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)', text: 'var(--risk-low-text)', label: '✓ SAFE' }
}

function callRiskConfig(level: string) {
  if (level === 'critical') return { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', text: '#f87171', label: '🚨 CRITICAL' }
  if (level === 'high')     return { bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.3)', text: '#fb923c', label: '⚠ HIGH' }
  if (level === 'medium')   return { bg: 'rgba(202,138,4,0.1)', border: 'rgba(202,138,4,0.3)', text: '#facc15', label: '⚠ MEDIUM' }
  return { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', text: '#4ade80', label: '✓ CLEAR' }
}

function formatTime(iso: string): { group: string; display: string } {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return { group: 'today',     display: timeStr }
  if (diffDays === 1) return { group: 'yesterday', display: timeStr }
  return { group: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), display: timeStr }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function statusLabel(scan: ScanRecord) {
  if (scan.userFeedback === 'legit') return 'Cleared'
  if (scan.riskLevel === 'low') return 'Cleared'
  if (scan.riskLevel === 'critical' || scan.riskLevel === 'high') return 'Blocked'
  return 'Flagged'
}

function HistoryContent() {
  const searchParams = useSearchParams()
  const persona = normalizePersona(searchParams.get('persona'))
  const { t } = useLanguage()

  const [tab,      setTab]      = useState<Tab>('scans')
  const [scans,    setScans]    = useState<ScanRecord[]>([])
  const [sessions, setSessions] = useState<CallSession[]>([])
  const [loaded,   setLoaded]   = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  useEffect(() => {
    // Load scan history
    const userId = (typeof window !== 'undefined' ? localStorage.getItem('ss-user-id') : null) ?? persona
    const local = getScans(userId)
    fetch(`/api/history?userId=${userId}&limit=100`)
      .then(r => r.json())
      .then(data => {
        if (data.source === 'db' && Array.isArray(data.scans) && data.scans.length > 0) {
          const localIds = new Set(local.map((s: ScanRecord) => s.id))
          const merged = [...local, ...data.scans.filter((s: ScanRecord) => !localIds.has(s.id))]
          merged.sort((a: ScanRecord, b: ScanRecord) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setScans(merged)
        } else {
          setScans(local)
        }
      })
      .catch(() => setScans(local))
      .finally(() => setLoaded(true))

    // Load call sessions
    const localSessions = getCallSessions(userId)
    fetch(`/api/call-sessions?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.source === 'db' && Array.isArray(data.sessions) && data.sessions.length > 0) {
          const localIds = new Set(localSessions.map(s => s.id))
          const merged = [...localSessions, ...data.sessions.filter((s: CallSession) => !localIds.has(s.id))]
          merged.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
          setSessions(merged)
        } else {
          setSessions(localSessions)
        }
      })
      .catch(() => setSessions(localSessions))
  }, [persona])

  // Group scans
  const grouped: Record<string, ScanRecord[]> = {}
  for (const scan of scans) {
    const { group } = formatTime(scan.createdAt)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(scan)
  }

  // Group sessions
  const groupedSessions: Record<string, CallSession[]> = {}
  for (const s of sessions) {
    const { group } = formatTime(s.startedAt)
    if (!groupedSessions[group]) groupedSessions[group] = []
    groupedSessions[group].push(s)
  }

  const totalScans = scans.length
  const blocked = scans.filter(s => (s.riskLevel === 'high' || s.riskLevel === 'critical') && s.userFeedback !== 'legit').length
  const safe    = scans.filter(s => s.riskLevel === 'low' || s.userFeedback === 'legit').length
  const totalAlerts = sessions.reduce((sum, s) => sum + s.alertCount, 0)

  const card: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{t.history.title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '4px 0 0' }}>{t.history.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderRadius: 10, background: 'var(--surface)',
        padding: 4, marginBottom: 20, border: '1px solid var(--border)',
        width: 'fit-content', gap: 2,
      }}>
        {(['scans', 'calls'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 18px', borderRadius: 7, border: 'none',
              background: tab === t ? 'var(--card)' : 'transparent',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              fontWeight: 600, fontSize: 13,
              color: tab === t ? 'var(--text)' : 'var(--text-2)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {t === 'scans' ? `Scans (${totalScans})` : `Call Sessions (${sessions.length})`}
          </button>
        ))}
      </div>

      {/* ── SCANS TAB ── */}
      {tab === 'scans' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Total Scans', value: String(totalScans), color: 'var(--text)' },
              { label: t.history.blocked,  value: String(blocked), color: 'var(--risk-high-text)' },
              { label: 'Safe',             value: String(safe),    color: 'var(--risk-low-text)'  },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...card, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {loaded && scans.length === 0 && (
            <div style={{ ...card, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 36 }}>🛡️</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>No scans yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 300 }}>Run your first analysis to see results here.</div>
              <Link href={`/dashboard/analysis?persona=${persona}`} style={{
                marginTop: 8, padding: '9px 18px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>Go to Analysis</Link>
            </div>
          )}

          {/* Grouped list */}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                {group === 'today' ? t.history.today : group === 'yesterday' ? t.history.yesterday : group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(scan => {
                  const rc = riskConfig(scan.riskLevel)
                  const { display } = formatTime(scan.createdAt)
                  const status = statusLabel(scan)
                  const snippet = scan.contentSnippet
                    ? (scan.contentSnippet.slice(0, 60) + (scan.contentSnippet.length > 60 ? '…' : ''))
                    : '[' + scan.contentType + ']'
                  return (
                    <div key={scan.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card)',
                    }}>
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 76, padding: '4px 8px', borderRadius: 6,
                        background: rc.bg, border: '1px solid ' + rc.border,
                        fontSize: 10, fontWeight: 700, color: rc.text, textAlign: 'center',
                      }}>{rc.label}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {snippet}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', flexWrap: 'wrap', gap: '0 8px' }}>
                          <span>{status} · {scan.riskScore ?? '—'}/100</span>
                          {scan.userFeedback === 'legit' && <span style={{ color: '#4ade80' }}>✓ Marked legitimate</span>}
                          {scan.ipAddress && <span style={{ color: 'var(--text-3)' }}>· {scan.ipAddress}</span>}
                          {scan.timezone  && <span style={{ color: 'var(--text-3)' }}>· {scan.timezone}</span>}
                        </div>
                      </div>
                      <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--text-3)' }}>{display}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── CALLS TAB ── */}
      {tab === 'calls' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { label: 'Call sessions', value: String(sessions.length),                     color: 'var(--text)' },
              { label: 'Total alerts',  value: String(totalAlerts),                          color: 'var(--risk-high-text)' },
              { label: 'Sessions clear', value: String(sessions.filter(s => s.alertCount === 0).length), color: 'var(--risk-low-text)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...card, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {sessions.length === 0 && (
            <div style={{ ...card, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 36 }}>📞</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>No call sessions yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 300 }}>
                Start a live call monitoring session — when you stop, it will be saved here with the full transcript and alerts.
              </div>
              <Link href="/dashboard/live-call" style={{
                marginTop: 8, padding: '9px 18px', borderRadius: 8,
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>Go to Live Call</Link>
            </div>
          )}

          {/* Grouped sessions */}
          {Object.entries(groupedSessions).map(([group, items]) => (
            <div key={group} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                {group === 'today' ? 'Today' : group === 'yesterday' ? 'Yesterday' : group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(session => {
                  const rc = callRiskConfig(session.highestRisk)
                  const { display } = formatTime(session.startedAt)
                  const isExpanded = expandedSession === session.id
                  return (
                    <div key={session.id} style={{
                      borderRadius: 12, border: '1px solid var(--border)',
                      background: 'var(--card)', overflow: 'hidden',
                    }}>
                      {/* Row header */}
                      <button
                        onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', background: 'transparent', border: 'none',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 80, padding: '4px 8px', borderRadius: 6,
                          background: rc.bg, border: `1px solid ${rc.border}`,
                          fontSize: 10, fontWeight: 700, color: rc.text, textAlign: 'center',
                        }}>{rc.label}</div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                            📞 {formatDuration(session.durationSeconds)} call
                            {session.alertCount > 0 && (
                              <span style={{ marginLeft: 8, fontSize: 12, color: '#f87171', fontWeight: 700 }}>
                                · {session.alertCount} alert{session.alertCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span>{new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {session.timezone && <span style={{ color: 'var(--text-3)' }}>· {session.timezone}</span>}
                          </div>
                          {session.transcript && (
                            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                              &ldquo;{session.transcript.slice(0, 80)}{session.transcript.length > 80 ? '…' : ''}&rdquo;
                            </div>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{display}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {/* Expanded transcript + alerts */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {/* Transcript */}
                          {session.transcript ? (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                Full Transcript
                              </div>
                              <div style={{
                                padding: '12px 14px', borderRadius: 8,
                                background: 'var(--bg)', border: '1px solid var(--border)',
                                fontSize: 13, lineHeight: 1.7, color: 'var(--text)',
                                fontFamily: 'ui-monospace, monospace',
                                maxHeight: 200, overflowY: 'auto',
                              }}>
                                {session.transcript}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>No transcript recorded.</div>
                          )}

                          {/* Alerts */}
                          {session.alerts.length > 0 && (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                                Alerts ({session.alerts.length})
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {session.alerts.map((alert, i) => {
                                  const am = callRiskConfig(alert.riskLevel)
                                  return (
                                    <div key={i} style={{
                                      padding: '10px 12px', borderRadius: 8,
                                      background: am.bg, border: `1px solid ${am.border}`,
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: am.text }}>{am.label}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{alert.reason}</div>
                                      {alert.snippet && (
                                        <div style={{ fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic' }}>
                                          &ldquo;{alert.snippet}&rdquo;
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-3)', fontSize: 13, padding: 24 }}>Loading history…</div>}>
      <HistoryContent />
    </Suspense>
  )
}
