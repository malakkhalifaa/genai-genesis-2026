/**
 * Client-side scan history using localStorage.
 * Works as the primary store when Supabase is not configured.
 */

export interface ScanRecord {
  id: string
  userId: string               // personaId: 'margaret' | 'ahmed' | 'none'
  contentType: 'text' | 'url' | 'image' | 'document'
  contentSnippet: string       // first 120 chars of input
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  reasons: string[]
  explanation: string
  recommendedAction: string
  ipAddress?: string
  timezone?: string
  userFeedback?: 'legit' | 'not_sure'
  createdAt: string            // ISO timestamp
}

const KEY = 'ss-scans'
const MAX = 100               // keep last 100 scans in localStorage

function readAll(): ScanRecord[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch { return [] }
}

function writeAll(records: ScanRecord[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX)))
}

export function saveScan(record: Omit<ScanRecord, 'id' | 'createdAt'>): ScanRecord {
  const full: ScanRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const existing = readAll()
  writeAll([full, ...existing])
  return full
}

export function updateFeedback(id: string, feedback: 'legit' | 'not_sure') {
  const records = readAll()
  const idx = records.findIndex(r => r.id === id)
  if (idx !== -1) {
    records[idx] = { ...records[idx], userFeedback: feedback }
    writeAll(records)
  }
}

export function getScans(userId?: string): ScanRecord[] {
  const all = readAll()
  return userId ? all.filter(r => r.userId === userId) : all
}

export function clearScans() {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY)
}
