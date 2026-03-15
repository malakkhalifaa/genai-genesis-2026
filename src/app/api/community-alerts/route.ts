/**
 * POST /api/community-alerts — save anonymized scam alert for community heatmap
 * GET  /api/community-alerts?region={region}&riskLevel={level} — get community stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { riskLevel, scamType, region, timezone } = body

    if (!riskLevel || !scamType) {
      return NextResponse.json({ error: 'riskLevel and scamType required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ id: crypto.randomUUID(), stored: 'local' }, { headers: CORS_HEADERS })
    }

    const { data, error } = await supabase
      .from('community_alerts')
      .insert([{
        risk_level: riskLevel,
        scam_type:  scamType,
        region:     region   ?? null,
        timezone:   timezone ?? null,
      }])
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
    return NextResponse.json({ id: data.id }, { headers: CORS_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: CORS_HEADERS })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const region    = searchParams.get('region')
  const scamType  = searchParams.get('scamType')

  if (!supabase) {
    return NextResponse.json({ total: 0, nearby: 0, topScamTypes: [], source: 'local' }, { headers: CORS_HEADERS })
  }

  // Total in last 30 days
  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  let query = supabase
    .from('community_alerts')
    .select('id, scam_type, region, created_at', { count: 'exact' })
    .gte('created_at', since)

  const { count: total } = await query

  // Nearby (same region) count
  let nearby = 0
  if (region) {
    const { count } = await supabase
      .from('community_alerts')
      .select('id', { count: 'exact' })
      .gte('created_at', since)
      .ilike('region', `%${region.split(',')[0].trim()}%`)
    nearby = count ?? 0
  }

  // Top scam types
  const { data: typeRows } = await supabase
    .from('community_alerts')
    .select('scam_type')
    .gte('created_at', since)
    .limit(200)

  const typeCounts: Record<string, number> = {}
  for (const row of typeRows ?? []) {
    typeCounts[row.scam_type] = (typeCounts[row.scam_type] ?? 0) + 1
  }
  const topScamTypes = Object.entries(typeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }))

  // Similar scam type count (if provided)
  let similarCount = 0
  if (scamType) {
    const { count } = await supabase
      .from('community_alerts')
      .select('id', { count: 'exact' })
      .gte('created_at', since)
      .eq('scam_type', scamType)
    similarCount = count ?? 0
  }

  return NextResponse.json({ total: total ?? 0, nearby, similarCount, topScamTypes, source: 'db' }, { headers: CORS_HEADERS })
}
