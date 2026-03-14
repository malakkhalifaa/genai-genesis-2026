'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sun, Moon, Monitor, Type, Zap, Bell, Shield, Trash2, Download } from 'lucide-react'
import { normalizePersona, personas } from '@/lib/mockData'

type Theme = 'dark' | 'light'
type FontSize = 'normal' | 'large' | 'xl'

// ── Row primitives ───────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', gap: 24,
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: description ? 3 : 0 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{description}</div>
        )}
      </div>
      {children}
    </div>
  )
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: on ? 'var(--accent)' : 'var(--border)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, borderRadius: '50%',
        width: 18, height: 18, background: '#fff',
        left: on ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 4, marginTop: 8,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)',
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{title}</h2>
    </div>
  )
}

// ── Main settings content ────────────────────────────────────────────────────

function SettingsContent() {
  const searchParams = useSearchParams()
  const personaId = normalizePersona(searchParams.get('persona'))
  const persona = personas[personaId]

  const [theme,         setTheme]         = useState<Theme>('dark')
  const [fontSize,      setFontSize]      = useState<FontSize>('normal')
  const [reduceMotion,  setReduceMotion]  = useState(false)
  const [highContrast,  setHighContrast]  = useState(false)
  const [notifyScan,    setNotifyScan]    = useState(true)
  const [notifyHighRisk,setNotifyHighRisk]= useState(true)
  const [notifyWeekly,  setNotifyWeekly]  = useState(false)

  // Load saved preferences
  useEffect(() => {
    const t = localStorage.getItem('ss-theme') as Theme | null
    if (t === 'dark' || t === 'light') setTheme(t)
    const fs = localStorage.getItem('ss-font-size') as FontSize | null
    if (fs) setFontSize(fs)
    setReduceMotion(localStorage.getItem('ss-reduce-motion') === '1')
    setHighContrast(localStorage.getItem('ss-high-contrast') === '1')
  }, [])

  const applyTheme = (next: Theme) => {
    setTheme(next)
    localStorage.setItem('ss-theme', next)
    // Notify DashboardShell to update immediately
    window.dispatchEvent(new CustomEvent('ss-theme-change', { detail: { theme: next } }))
  }

  const applyFontSize = (next: FontSize) => {
    setFontSize(next)
    localStorage.setItem('ss-font-size', next)
  }

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
  }

  const fontSizeOptions: { value: FontSize; label: string; desc: string }[] = [
    { value: 'normal', label: 'Normal',     desc: '14px' },
    { value: 'large',  label: 'Large',      desc: '17px' },
    { value: 'xl',     label: 'Extra large',desc: '20px' },
  ]

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>
          Viewing as {persona.shortName} · {persona.role}
        </p>
      </div>

      {/* ── APPEARANCE ── */}
      <div style={card}>
        <SectionHeader icon={<Monitor style={{ width: 14, height: 14 }} />} title="Appearance" />

        <div style={{ marginTop: 4 }}>
          <SettingRow label="Theme" description="Choose how the dashboard looks">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['dark', 'light'] as Theme[]).map(t => (
                <button
                  key={t}
                  onClick={() => applyTheme(t)}
                  aria-pressed={theme === t}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    border: theme === t ? '1.5px solid var(--accent-border)' : '1px solid var(--border)',
                    background: theme === t ? 'var(--accent-soft)' : 'transparent',
                    color: theme === t ? 'var(--active-text)' : 'var(--text-2)',
                    fontSize: 13, fontWeight: 500,
                  }}
                >
                  {t === 'dark'
                    ? <Moon  style={{ width: 13, height: 13 }} aria-hidden="true" />
                    : <Sun   style={{ width: 13, height: 13 }} aria-hidden="true" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>

      {/* ── ACCESSIBILITY ── */}
      <div style={card}>
        <SectionHeader icon={<Type style={{ width: 14, height: 14 }} />} title="Accessibility" />

        <div style={{ marginTop: 4 }}>
          <SettingRow
            label="Text size"
            description="Larger text makes the dashboard easier to read"
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {fontSizeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => applyFontSize(opt.value)}
                  aria-pressed={fontSize === opt.value}
                  title={opt.desc}
                  style={{
                    padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                    border: fontSize === opt.value ? '1.5px solid var(--accent-border)' : '1px solid var(--border)',
                    background: fontSize === opt.value ? 'var(--accent-soft)' : 'transparent',
                    color: fontSize === opt.value ? 'var(--active-text)' : 'var(--text-2)',
                    fontSize: 12, fontWeight: 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow
            label="Reduce motion"
            description="Turns off animations — helpful for motion sensitivity"
          >
            <Toggle
              on={reduceMotion}
              onChange={v => { setReduceMotion(v); localStorage.setItem('ss-reduce-motion', v ? '1' : '0') }}
              label="Reduce motion"
            />
          </SettingRow>

          <SettingRow
            label="High contrast"
            description="Increases border and text contrast for better visibility"
          >
            <Toggle
              on={highContrast}
              onChange={v => { setHighContrast(v); localStorage.setItem('ss-high-contrast', v ? '1' : '0') }}
              label="High contrast mode"
            />
          </SettingRow>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div style={card}>
        <SectionHeader icon={<Bell style={{ width: 14, height: 14 }} />} title="Notifications" />

        <div style={{ marginTop: 4 }}>
          <SettingRow label="Scan complete" description="Alert when an analysis finishes">
            <Toggle on={notifyScan} onChange={setNotifyScan} label="Scan complete notifications" />
          </SettingRow>
          <SettingRow label="High risk detected" description="Immediate alert for 75+ risk scores">
            <Toggle on={notifyHighRisk} onChange={setNotifyHighRisk} label="High risk notifications" />
          </SettingRow>
          <SettingRow
            label="Weekly digest"
            description="Summary of scans and blocked threats each week"
          >
            <Toggle on={notifyWeekly} onChange={setNotifyWeekly} label="Weekly digest email" />
          </SettingRow>
        </div>
      </div>

      {/* ── ACTIVE PROTECTION ── */}
      <div style={card}>
        <SectionHeader icon={<Shield style={{ width: 14, height: 14 }} />} title={`Protection for ${persona.name}`} />
        <div style={{ marginTop: 4 }}>
          {[
            { label: 'Text message scanning', on: true },
            { label: 'Email analysis',        on: true },
            { label: 'Link checking',         on: true },
            { label: 'Payment request alerts',on: true },
            { label: 'Phone call monitoring', on: false, badge: 'Beta' },
          ].map(({ label, on, badge }) => (
            <SettingRow key={label} label={label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
                    border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px',
                  }}>{badge}</span>
                )}
                <Toggle on={on} onChange={() => {}} label={label} />
              </div>
            </SettingRow>
          ))}
        </div>
      </div>

      {/* ── DATA & PRIVACY ── */}
      <div style={card}>
        <SectionHeader icon={<Zap style={{ width: 14, height: 14 }} />} title="Data & Privacy" />
        <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
            border: '1px solid var(--border)', background: 'transparent',
            fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
          }}>
            <Download style={{ width: 13, height: 13 }} aria-hidden="true" /> Export data
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
            border: '1px solid var(--risk-high-border)',
            background: 'var(--risk-high-bg)',
            fontSize: 13, fontWeight: 500, color: 'var(--risk-high-text)',
          }}>
            <Trash2 style={{ width: 13, height: 13 }} aria-hidden="true" /> Clear scan history
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 14, lineHeight: 1.6 }}>
          ScamShield stores your behavioral profile and scan history locally in your browser session.
          No data is sent to external servers without your consent.
        </p>
      </div>

      {/* Version */}
      <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 8 }}>
        ScamShield · GenAI Genesis 2026 · Demo build
      </p>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 24, color: 'var(--text-2)', fontSize: 14 }}>Loading settings…</div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
