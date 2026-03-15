/**
 * POST /api/report   — save a new scan record
 * PATCH /api/report  — update user_feedback on an existing record
 *
 * When Supabase is configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_ANON_KEY),
 * records are persisted to the `scans` table. Otherwise the API returns
 * a success response and the client relies on its own localStorage copy.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId, contentType, contentSnippet,
      riskLevel, riskScore, reasons,
      explanation, recommendedAction,
      ipAddress, timezone,
    } = body

    if (!contentType || riskLevel === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('scans')
        .insert([{
          user_id: userId ?? null,
          content_type: contentType,
          content_snippet: contentSnippet ?? null,
          risk_level: riskLevel,
          risk_score: riskScore ?? null,
          reasons: reasons ?? [],
          explanation: explanation ?? null,
          recommended_action: recommendedAction ?? null,
          ip_address: ipAddress ?? null,
          timezone: timezone ?? null,
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single()

      if (error) {
        console.error('[/api/report POST]', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ id: data.id })
    }

    // No DB — client stores it locally; return a UUID for reference
    return NextResponse.json({ id: crypto.randomUUID(), stored: 'local' })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, userFeedback } = body

    if (!id || !userFeedback) {
      return NextResponse.json({ error: 'Missing id or userFeedback' }, { status: 400 })
    }
    if (!['legit', 'not_sure'].includes(userFeedback)) {
      return NextResponse.json({ error: 'Invalid userFeedback value' }, { status: 400 })
    }

    const correctedLabel = userFeedback === 'legit' ? 'not_scam' : null

    if (supabase) {
      const { error } = await supabase
        .from('scans')
        .update({ user_feedback: userFeedback, corrected_label: correctedLabel })
        .eq('id', id)

      if (error) {
        console.error('[/api/report PATCH]', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
