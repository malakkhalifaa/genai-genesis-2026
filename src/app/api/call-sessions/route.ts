/**
 * POST /api/call-sessions — save a completed call session
 * GET  /api/call-sessions?userId={id} — retrieve sessions for user
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, startedAt, endedAt, durationSeconds, transcript, alerts, alertCount, highestRisk, ipAddress, timezone } = body

    if (!supabase) {
      return NextResponse.json({ id: crypto.randomUUID(), stored: 'local' })
    }

    const { data, error } = await supabase
      .from('call_sessions')
      .insert([{
        user_id:          userId          ?? null,
        started_at:       startedAt       ?? new Date().toISOString(),
        ended_at:         endedAt         ?? new Date().toISOString(),
        duration_seconds: durationSeconds ?? 0,
        transcript:       transcript      ?? '',
        alerts:           alerts          ?? [],
        alert_count:      alertCount      ?? 0,
        highest_risk:     highestRisk     ?? 'none',
        ip_address:       ipAddress       ?? null,
        timezone:         timezone        ?? null,
      }])
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!supabase || !userId) {
    return NextResponse.json({ sessions: [], source: 'local' })
  }

  const { data, error } = await supabase
    .from('call_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ sessions: data ?? [], source: 'db' })
}
