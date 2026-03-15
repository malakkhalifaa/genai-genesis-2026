/**
 * GET /api/history?userId={personaId}&limit={n}
 * Returns scan history from Supabase when configured,
 * otherwise returns an empty array (client reads from localStorage).
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200)

  if (!supabase) {
    // Client will use its own localStorage store
    return NextResponse.json({ scans: [], source: 'local' })
  }

  let query = supabase
    .from('scans')
    .select('id, user_id, content_type, content_snippet, risk_level, risk_score, reasons, explanation, recommended_action, ip_address, timezone, user_feedback, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) {
    console.error('[/api/history]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const scans = (data ?? []).map(row => ({
    id: row.id,
    userId: row.user_id,
    contentType: row.content_type,
    contentSnippet: row.content_snippet,
    riskLevel: row.risk_level,
    riskScore: row.risk_score,
    reasons: row.reasons ?? [],
    explanation: row.explanation,
    recommendedAction: row.recommended_action,
    ipAddress: row.ip_address,
    timezone: row.timezone,
    userFeedback: row.user_feedback,
    createdAt: row.created_at,
  }))

  return NextResponse.json({ scans, source: 'db' })
}
