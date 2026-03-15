/**
 * POST /api/live-alerts  — save a live call alert to DB
 * GET  /api/live-alerts  — get alerts for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, riskLevel, reason, snippet, ipAddress, timezone } = body

    if (!riskLevel) {
      return NextResponse.json({ error: 'riskLevel is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ id: crypto.randomUUID(), stored: 'local' })
    }

    const { data, error } = await supabase
      .from('live_call_alerts')
      .insert([{
        user_id:    userId    ?? null,
        risk_level: riskLevel,
        reason:     reason    ?? null,
        snippet:    snippet   ?? null,
        ip_address: ipAddress ?? null,
        timezone:   timezone  ?? null,
      }])
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ id: data.id })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!supabase || !userId) {
    return NextResponse.json({ alerts: [], source: 'local' })
  }

  const { data, error } = await supabase
    .from('live_call_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ alerts: data ?? [], source: 'db' })
}
