import { normalizePersona, personas } from '@/lib/mockData'

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
}

function InfoCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div style={{ ...card, padding: '16px 18px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(item => (
          <div key={item} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5,
          }}>
            <span style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }}>•</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>
}) {
  const params    = await searchParams
  const personaId = normalizePersona(params.persona)
  const persona   = personas[personaId]

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: '0 0 24px' }}>
        Guardian Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Left: Avatar card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            ...card,
            padding: '24px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--accent-soft)',
              border: '2px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, marginBottom: 14,
            }}>
              {persona.avatar}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{persona.shortName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>{persona.role}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Member since {persona.memberSince}</div>

            <div style={{ height: 1, background: 'var(--border)', width: '100%', margin: '14px 0' }} />

            <button style={{
              width: '100%', padding: '8px 0', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card)',
              fontSize: 12, fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer',
            }}>
              Edit Profile
            </button>
          </div>

          {/* Quick stats */}
          <div style={{ ...card, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Activity
            </div>
            {[
              { label: 'Scans run',       value: '12' },
              { label: 'Threats blocked', value: '3' },
              { label: 'Last scan',       value: '2h ago' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Profile details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Risk sensitivity */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Risk Sensitivity</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Low', 'Normal', 'High', 'Maximum'] as const).map(lvl => (
                <button
                  key={lvl}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    border: lvl === 'Normal' ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                    background: lvl === 'Normal' ? 'var(--accent-soft)' : 'transparent',
                    color: lvl === 'Normal' ? 'var(--active-text)' : 'var(--text-2)',
                    cursor: 'pointer',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* What ScamShield knows */}
          <InfoCard
            icon="💰"
            title="Financial Behavior"
            items={[
              'Never sends: Wire transfers, Cryptocurrency, Gift cards',
              'Typical spending: Under $200 per transaction',
              'Payment methods: Credit/Debit cards only',
            ]}
          />
          <InfoCard
            icon="👥"
            title="Communication Patterns"
            items={persona.communicationPatterns}
          />

          {/* Active protections */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Active Protections</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Text messages',    on: true  },
                { label: 'Email scanning',   on: true  },
                { label: 'Link checking',    on: true  },
                { label: 'Payment requests', on: true  },
                { label: 'Phone monitoring', on: false },
              ].map(({ label, on }) => (
                <label key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: on ? 'var(--text)' : 'var(--text-2)',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                    background: on ? 'var(--accent-soft)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 9,
                    color: on ? 'var(--accent)' : 'transparent',
                  }}>
                    {on ? '✓' : ''}
                  </div>
                  {label}
                  {!on && <span style={{ fontSize: 9, color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 4px' }}>Beta</span>}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{
          padding: '9px 18px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--card)',
          fontSize: 13, fontWeight: 500, color: 'var(--text-2)', cursor: 'pointer',
        }}>
          Export Data
        </button>
        <button style={{
          padding: '9px 18px', borderRadius: 8,
          border: '1px solid var(--risk-high-border)', background: 'var(--risk-high-bg)',
          fontSize: 13, fontWeight: 500, color: 'var(--risk-high-text)', cursor: 'pointer',
        }}>
          Delete Profile
        </button>
      </div>
    </div>
  )
}
