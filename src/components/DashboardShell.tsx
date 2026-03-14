'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  ShieldCheck, BarChart3, Clock3, UserRound,
  Settings, LogOut, Sun, Moon, Bell, HelpCircle,
} from 'lucide-react'
import { normalizePersona, personas } from '@/lib/mockData'

type Theme = 'dark' | 'light'

const navItems = [
  { href: '/dashboard/analysis', label: 'Analysis', Icon: BarChart3 },
  { href: '/dashboard/history',  label: 'History',  Icon: Clock3 },
  { href: '/dashboard/profile',  label: 'Profile',  Icon: UserRound },
]

// ── needs Suspense (uses useSearchParams) ────────────────────────────────────
function PersonaNavContent() {
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const personaId   = normalizePersona(searchParams.get('persona'))
  const persona     = personas[personaId]

  return (
    <>
      {/* Persona badge */}
      <Link
        href={`/login?persona=${personaId}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10,
          border: '1px solid var(--accent-border)',
          background: 'var(--accent-soft)',
          textDecoration: 'none', marginBottom: 16,
          transition: 'opacity 0.15s',
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>{persona.avatar}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
            {persona.shortName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>Switch persona →</div>
        </div>
      </Link>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={`${href}?persona=${personaId}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13, fontWeight: 500,
                background: isActive ? 'var(--active-bg)' : 'transparent',
                color: isActive ? 'var(--active-text)' : 'var(--text-2)',
                borderLeft: `3px solid ${isActive ? 'var(--active-border)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              {label}
              {label === 'History' && (
                <span style={{
                  marginLeft: 'auto',
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--accent)', flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function HeaderPersonaBadge() {
  const searchParams = useSearchParams()
  const personaId   = normalizePersona(searchParams.get('persona'))
  const persona     = personas[personaId]

  return (
    <Link
      href={`/login?persona=${personaId}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px', borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--card)',
        textDecoration: 'none', transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{persona.avatar}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{persona.name}</span>
      <span style={{ fontSize: 10, color: 'var(--text-2)' }}>▾</span>
    </Link>
  )
}

function SettingsLink() {
  const searchParams = useSearchParams()
  const personaId = normalizePersona(searchParams.get('persona'))
  const pathname = usePathname()
  const isActive = pathname === '/dashboard/settings'
  return (
    <Link
      href={`/dashboard/settings?persona=${personaId}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8,
        textDecoration: 'none',
        fontSize: 13, fontWeight: 500,
        background: isActive ? 'var(--active-bg)' : 'transparent',
        color: isActive ? 'var(--active-text)' : 'var(--text-2)',
        borderLeft: `3px solid ${isActive ? 'var(--active-border)' : 'transparent'}`,
      }}
    >
      <Settings style={{ width: 15, height: 15 }} />
      Settings
    </Link>
  )
}

// ── Main shell ───────────────────────────────────────────────────────────────
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('ss-theme') as Theme | null
    if (saved === 'dark' || saved === 'light') setTheme(saved)
  }, [])

  // Listen for theme changes from the settings page
  useEffect(() => {
    const handler = (e: CustomEvent<{ theme: Theme }>) => {
      setTheme(e.detail.theme)
    }
    window.addEventListener('ss-theme-change', handler as EventListener)
    return () => window.removeEventListener('ss-theme-change', handler as EventListener)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    window.localStorage.setItem('ss-theme', theme)
  }, [theme])

  const toggle = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  const iconBtn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--card)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)',
    flexShrink: 0,
  }

  return (
    <div
      className={`dash-${theme}`}
      style={{
        height: '100dvh', display: 'flex', flexDirection: 'column',
        background: 'var(--bg)', color: 'var(--text)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      }}
    >
      {/* ── HEADER ── */}
      <header style={{
        height: 58, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(220,38,38,0.14)',
            border: '1px solid rgba(220,38,38,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck style={{ width: 15, height: 15, color: '#ef4444' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>ScamShield</span>
          <span style={{
            marginLeft: 6, fontSize: 11, fontWeight: 600,
            color: 'var(--text-3)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 4, padding: '2px 6px',
          }}>Dashboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button onClick={toggle} style={iconBtn} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark'
              ? <Sun  style={{ width: 14, height: 14 }} />
              : <Moon style={{ width: 14, height: 14 }} />}
          </button>

          {/* Notification bell */}
          <button style={{ ...iconBtn, position: 'relative' }} title="Notifications">
            <Bell style={{ width: 14, height: 14 }} />
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444', border: '1.5px solid var(--surface)',
            }} />
          </button>

          {/* Persona badge */}
          <Suspense fallback={
            <div style={{ width: 110, height: 34, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)' }} />
          }>
            <HeaderPersonaBadge />
          </Suspense>

          {/* Logout */}
          <Link href="/" style={{ ...iconBtn, textDecoration: 'none' }} title="Logout">
            <LogOut style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: 216, flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '16px 10px',
          overflowY: 'auto',
        }}>
          <Suspense fallback={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: 34, borderRadius: 8, background: 'var(--border)' }} />
              ))}
            </div>
          }>
            <PersonaNavContent />
          </Suspense>

          <div style={{ flexGrow: 1 }} />
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 2px' }} />

          <Suspense fallback={
            <div style={{ height: 34, borderRadius: 8, background: 'var(--border)' }} />
          }>
            <SettingsLink />
          </Suspense>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 500, color: 'var(--text-2)',
              cursor: 'pointer', width: '100%', textAlign: 'left',
            }}
          >
            <HelpCircle style={{ width: 15, height: 15 }} />
            Help
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
