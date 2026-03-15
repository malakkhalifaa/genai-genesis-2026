export type PersonaId = 'margaret' | 'ahmed' | 'none'

export type PersonaTheme = 'warm' | 'cool' | 'gray'

export interface Persona {
  id: PersonaId
  name: string
  shortName: string
  ageLabel: string
  role: string
  quote: string
  email: string
  avatar: string
  theme: PersonaTheme
  memberSince: string
  profileHighlights: string[]
  communicationPatterns: string[]
}

export interface AnalysisResult {
  riskLabel: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK'
  riskScore: number
  reason: string
  tags: string[]
  action: string
}

export const personaOrder: PersonaId[] = ['margaret', 'ahmed', 'none']

export const personas: Record<PersonaId, Persona> = {
  margaret: {
    id: 'margaret',
    name: 'Margaret',
    shortName: 'Margaret, 72',
    ageLabel: '72',
    role: 'Retired Teacher',
    quote: 'I just want to feel safe online',
    email: 'margaret@demo.com',
    avatar: '👵',
    theme: 'warm',
    memberSince: '2024',
    profileHighlights: ['Family-first communication', 'Shops with known brands', 'Prefers clear instructions'],
    communicationPatterns: [
      'Typical contacts: Family (3), Church group, Amazon',
      'Never sends: Wire transfers, Cryptocurrency, Gift cards',
      'Usual spending: Under $200, Credit/debit only'
    ]
  },
  ahmed: {
    id: 'ahmed',
    name: 'Ahmed',
    shortName: 'Ahmed, 24',
    ageLabel: '24',
    role: 'International Student',
    quote: 'I need tools that help me spot fake opportunities quickly',
    email: 'ahmed@demo.com',
    avatar: '👨‍🎓',
    theme: 'cool',
    memberSince: '2025',
    profileHighlights: ['Job-seeking context', 'Budget conscious', 'High digital activity'],
    communicationPatterns: [
      'Typical contacts: University, landlord, classmates',
      'Never sends: Upfront hiring fees, crypto transfer',
      'Usual spending: Tuition, rent, groceries'
    ]
  },
  none: {
    id: 'none',
    name: 'No Profile',
    shortName: 'No Profile',
    ageLabel: '—',
    role: 'Anonymous Mode',
    quote: 'Show me what generic protection can do',
    email: 'anonymous@demo.com',
    avatar: '🧑',
    theme: 'gray',
    memberSince: '2026',
    profileHighlights: ['Minimal context', 'Generic alerts', 'No behavior history'],
    communicationPatterns: [
      'Typical contacts: Unknown',
      'Never sends: Unknown',
      'Usual spending: Unknown'
    ]
  }
}

export const quickTests = [
  {
    id: 'crypto',
    label: 'Crypto scam',
    content: 'URGENT: Your account is frozen. Send Bitcoin in 20 minutes to restore access.'
  },
  {
    id: 'job',
    label: 'Job offer',
    content: 'Congrats on the remote role. Pay a refundable onboarding fee of $80 today.'
  },
  {
    id: 'bank',
    label: 'Bank alert',
    content: 'Security alert: confirm your OTP code now or your card will be disabled.'
  },
  {
    id: 'safe',
    label: 'Safe message',
    content: 'Hi mom, dinner is at 7 PM on Sunday. Love you!'
  }
] as const

export const historyItems = {
  today: [
    { id: 'h1', level: 'High', time: '2:30 PM', title: 'Crypto request...', status: 'Blocked', sampleId: 'crypto' },
    { id: 'h2', level: 'Low', time: '10:15 AM', title: 'Amazon order...', status: 'Cleared', sampleId: 'safe' }
  ],
  yesterday: [
    { id: 'h3', level: 'Med', time: '4:45 PM', title: 'Job offer email...', status: 'Flagged', sampleId: 'job' }
  ]
} as const

export const demoComparisons = [
  {
    id: 'bitcoin',
    genericWarning: 'This might be spam.',
    personalizedWarning: "Margaret, you have never sent Bitcoin. This is likely a scam.",
    genericRisk: 'Unknown',
    personalizedRisk: '95/100',
    personalizedAction: 'Call bank'
  },
  {
    id: 'otp',
    genericWarning: 'Suspicious request detected.',
    personalizedWarning: 'Ahmed, no trusted sender has ever asked you for OTP codes. Do not share it.',
    genericRisk: 'Low confidence',
    personalizedRisk: '91/100',
    personalizedAction: 'Ignore and report'
  }
] as const

export const normalizePersona = (value: string | null | undefined): PersonaId => {
  if (!value) return 'margaret'
  if (value === 'margaret' || value === 'ahmed' || value === 'none') return value
  return 'margaret'
}

export const analyzeInput = (personaId: PersonaId, content: string): AnalysisResult => {
  const normalized = content.toLowerCase()

  if (normalized.includes('bitcoin') || normalized.includes('crypto')) {
    return {
      riskLabel: 'HIGH RISK',
      riskScore: personaId === 'none' ? 79 : 87,
      reason:
        personaId === 'margaret'
          ? "You've never used Bitcoin. This is unusual for you."
          : 'Crypto payment pressure is a high-risk scam marker.',
      tags: ['Never crypto', 'Urgency flags', 'New sender'],
      action: 'Do not pay. Call your bank from the number on your card.'
    }
  }

  if (normalized.includes('job') && normalized.includes('fee')) {
    return {
      riskLabel: 'MEDIUM RISK',
      riskScore: 72,
      reason: 'Legitimate employers do not require upfront fees.',
      tags: ['Job scam pattern', 'Upfront payment', 'Financial pressure'],
      action: 'Verify employer independently before responding.'
    }
  }

  if (normalized.includes('otp') || normalized.includes('code')) {
    return {
      riskLabel: 'HIGH RISK',
      riskScore: 84,
      reason: 'Requests for one-time codes are common account takeover attempts.',
      tags: ['Verification theft', 'Impersonation', 'Urgency'],
      action: 'Never share OTP codes. Contact institution directly.'
    }
  }

  return {
    riskLabel: 'LOW RISK',
    riskScore: 19,
    reason: 'No suspicious behavior pattern was detected.',
    tags: ['Normal language', 'Known pattern', 'No pressure cues'],
    action: 'No action needed. Continue normal communication.'
  }
}
