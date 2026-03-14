import Link from 'next/link'
import { historyItems, normalizePersona } from '@/lib/mockData'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>
}) {
  const params  = await searchParams
  const persona = normalizePersona(params.persona)

  const levelConfig = {
    High: { bg: 'var(--risk-high-bg)',  border: 'var(--risk-high-border)', text: 'var(--risk-high-text)',  label: '⚠ HIGH',   score: '87/100' },
    Med:  { bg: 'var(--risk-med-bg)',   border: 'var(--risk-med-border)',  text: 'var(--risk-med-text)',   label: '⚠ MEDIUM', score: '72/100' },
    Low:  { bg: 'var(--risk-low-bg)',   border: 'var(--risk-low-border)',  text: 'var(--risk-low-text)',   label: '✓ SAFE',   score: '19/100' },
  }

  const card: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
  }

  type HistoryItem = { id: string; level: string; time: string; title: string; status: string; sampleId: string }
  const TimeGroup = ({ title, items }: { title: string; items: readonly HistoryItem[] }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => {
          const lvl = levelConfig[item.level as keyof typeof levelConfig]
          return (
            <Link
              key={item.id}
              href={`/dashboard/analysis?persona=${persona}&sample=${item.sampleId}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              {/* Risk badge */}
              <div style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 76, padding: '4px 8px', borderRadius: 6,
                background: lvl.bg, border: `1px solid ${lvl.border}`,
                fontSize: 10, fontWeight: 700, color: lvl.text,
                textAlign: 'center',
              }}>
                {lvl.label}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  {item.status} · Risk score {lvl.score}
                </div>
              </div>

              {/* Time */}
              <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--text-3)' }}>{item.time}</div>

              {/* Arrow */}
              <div style={{ flexShrink: 0, fontSize: 14, color: 'var(--text-3)' }}>→</div>
            </Link>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>History</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '4px 0 0' }}>Your recent scan activity</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--card)',
          fontSize: 13, color: 'var(--text-2)', cursor: 'pointer',
        }}>
          Filter ▾
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Total Scans', value: '12', color: 'var(--text)' },
          { label: 'Blocked',     value: '3',  color: 'var(--risk-high-text)' },
          { label: 'Safe',        value: '9',  color: 'var(--risk-low-text)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            ...card, padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <TimeGroup title="Today"     items={[...historyItems.today]}     />
      <TimeGroup title="Yesterday" items={[...historyItems.yesterday]} />

      <button style={{
        width: '100%', padding: '12px 0', borderRadius: 8,
        border: '1px solid var(--border)', background: 'transparent',
        fontSize: 13, color: 'var(--text-2)', cursor: 'pointer',
      }}>
        Load more…
      </button>
    </div>
  )
}
