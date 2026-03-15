/**
 * POST /api/analyze-live
 * Body: { text: string, personaId: 'margaret' | 'ahmed' | 'none' }
 * Optimised for speed: 6-second LLM timeout with heuristic fallback.
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithLLM, UserContext } from '@/lib/ai'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

// Per-persona context mirrors what the analysis page sends
const PERSONA_CONTEXT: Record<string, UserContext> = {
  margaret: {
    neverUsedCrypto: true,
    neverSentGiftCards: true,
    typicalContacts: ['family', 'church group', 'Amazon'],
    knownDomains: ['amazon.com', 'gmail.com'],
    locale: 'en',
  },
  ahmed: {
    neverUsedCrypto: false,
    neverSentGiftCards: true,
    typicalContacts: ['university', 'landlord', 'classmates'],
    knownDomains: ['utoronto.ca', 'gmail.com'],
    locale: 'en',
  },
  none: {},
}

// Fast heuristic fallback — no LLM required
interface HeuristicResult {
  riskLevel: string
  riskScore: number
  reasons: string[]
  explanation: string
  recommendedAction: string
}

function quickHeuristic(text: string, personaId: string): HeuristicResult {
  const lower = text.toLowerCase()
  const hits: Array<{ risk: string; reason: string; score: number }> = []

  const patterns: Array<{ re: RegExp; risk: string; reason: string; score: number }> = [
    { re: /bitcoin|crypto|ethereum|gift card|itunes card|google play card/i, risk: 'critical', reason: 'Irreversible payment method requested', score: 95 },
    { re: /seed phrase|wallet recovery|private key|passphrase/i,              risk: 'critical', reason: 'Crypto wallet takeover attempt',       score: 96 },
    { re: /cra|irs|revenue canada|canada revenue|social security|sin number|ssn/i,  risk: 'high',     reason: 'Government agency impersonation',    score: 85 },
    { re: /bank|td bank|rbc|scotiabank|cibc|bmo|paypal|venmo|cash app|zelle/i,      risk: 'high',     reason: 'Financial account impersonation cues', score: 82 },
    { re: /arrest|warrant|jail|deportation|legal action|lawsuit/i,                  risk: 'high',     reason: 'Threats of legal consequences',      score: 82 },
    { re: /wire transfer|e-transfer|send money|send funds/i,                        risk: 'high',     reason: 'Urgent money transfer request',       score: 80 },
    { re: /verify your account|confirm your password|one.time code|otp|verification code|security code/i, risk: 'high', reason: 'Credential or OTP phishing attempt', score: 80 },
    { re: /remote access|teamviewer|anydesk|allow me to connect|screen share now/i, risk: 'high',     reason: 'Remote-access takeover tactic',       score: 83 },
    { re: /keep this secret|do not tell anyone|stay on the line/i,                  risk: 'high',     reason: 'Isolation/coercion social-engineering tactic', score: 81 },
    { re: /urgent|immediately|right now|within \d+ (minute|hour)|or else/i,         risk: 'medium',   reason: 'High-pressure urgency language',      score: 60 },
    { re: /you (have )?won|congratulations|prize|lottery|selected/i,                risk: 'medium',   reason: 'Prize or lottery claim',              score: 58 },
    { re: /limited time|act now|don.t miss|expires today/i,                         risk: 'medium',   reason: 'Artificial deadline pressure',        score: 55 },
    { re: /job offer|hiring|interview|recruiter|training fee|application fee/i,     risk: 'medium',   reason: 'Job-offer scam signal',               score: 62 },
  ]

  for (const p of patterns) {
    if (p.re.test(lower)) hits.push({ risk: p.risk, reason: p.reason, score: p.score })
  }

  if (hits.length === 0) {
    return {
      riskLevel: 'low', riskScore: 10,
      reasons: [],
      explanation: 'No immediate red flags detected in this segment.',
      recommendedAction: 'Continue monitoring.',
    }
  }

  const order = ['critical', 'high', 'medium', 'low']
  hits.sort((a, b) => order.indexOf(a.risk) - order.indexOf(b.risk))
  const top = hits[0]

  const name = personaId === 'margaret' ? 'Margaret'
    : personaId === 'ahmed' ? 'Ahmed'
    : 'you'
  const personalNote = personaId === 'margaret'
    ? ' Real government agencies never call to demand payment this way.'
    : personaId === 'ahmed'
    ? ' International students are frequently targeted by these tactics.'
    : ''

  if (personaId === 'margaret' && /bitcoin|crypto|gift card|wire transfer|e-transfer/i.test(lower)) {
    hits.unshift({ risk: 'critical', reason: 'Unusual payment request for this persona', score: 97 })
  }

  if (personaId === 'ahmed' && /job offer|application fee|visa|immigration fee/i.test(lower)) {
    hits.unshift({ risk: 'high', reason: 'Common student-targeted scam pattern', score: 86 })
  }

  return {
    riskLevel: top.risk,
    riskScore: top.score,
    reasons: hits.map(h => h.reason),
    explanation: `${name}, this contains ${hits.length} scam pattern${hits.length > 1 ? 's' : ''}: ${hits[0].reason.toLowerCase()}.${personalNote}`,
    recommendedAction: 'Do not comply. Hang up and verify through official channels.',
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, personaId } = await request.json() as { text?: string; personaId?: string }

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ riskLevel: 'low', riskScore: 0, reasons: [], explanation: '', recommendedAction: '' }, { headers: CORS })
    }

    const pid = (personaId && ['margaret', 'ahmed', 'none'].includes(personaId))
      ? personaId : 'none'

    const userContext = PERSONA_CONTEXT[pid]
    const heuristic = quickHeuristic(text.trim(), pid)

    // Live mode prioritizes immediate warnings for anything medium+ risk
    if (['medium', 'high', 'critical'].includes(heuristic.riskLevel)) {
      return NextResponse.json(heuristic, { headers: CORS })
    }

    // Race the LLM against a 6-second timeout; heuristic fallback on timeout/error
    try {
      const result = await Promise.race([
        analyzeWithLLM({ contentType: 'text', text: text.trim(), userContext }, []),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('live-timeout')), 2_500)
        ),
      ])
      return NextResponse.json(result, { headers: CORS })
    } catch {
      // Timeout or LLM error — return heuristic result instantly
      return NextResponse.json(heuristic, { headers: CORS })
    }
  } catch {
    return NextResponse.json(
      { riskLevel: 'low', riskScore: 0, reasons: [], explanation: 'Analysis failed.', recommendedAction: '' },
      { status: 200, headers: CORS }
    )
  }
}
