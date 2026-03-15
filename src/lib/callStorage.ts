/**
 * Client-side call session storage using localStorage.
 * Saves full transcript + alerts from each live call session.
 */

export interface CallAlert {
  id: number
  timestamp: number
  snippet: string
  riskLevel: string
  reason: string
}

export interface CallSession {
  id: string
  userId?: string
  startedAt: string          // ISO timestamp
  endedAt: string            // ISO timestamp
  durationSeconds: number
  transcript: string
  alerts: CallAlert[]
  alertCount: number
  highestRisk: 'none' | 'medium' | 'high' | 'critical'
  ipAddress?: string
  timezone?: string
}

const KEY = 'ss-call-sessions'
const MAX = 50

function readAll(): CallSession[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function writeAll(sessions: CallSession[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, MAX)))
}

export function saveCallSession(session: Omit<CallSession, 'id'>): CallSession {
  const full: CallSession = { ...session, id: crypto.randomUUID() }
  writeAll([full, ...readAll()])
  return full
}

export function getCallSessions(userId?: string): CallSession[] {
  const all = readAll()
  return userId ? all.filter(s => s.userId === userId) : all
}

export function clearCallSessions() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY)
}
