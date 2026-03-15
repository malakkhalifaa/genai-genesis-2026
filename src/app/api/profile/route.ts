/**
 * GET  /api/profile?userId={id}  — fetch user profile
 * PUT  /api/profile              — update profile fields (name, region, prefs, face_descriptor…)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  // Use '*' so we get whatever columns exist without hardcoding the schema version
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...fields } = body

    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

    // Whitelist updatable fields
    const allowed = [
      'name', 'region', 'never_used_crypto', 'never_sent_giftcards',
      'known_domains', 'trusted_contacts', 'timezone', 'face_descriptor',
    ]
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in fields) update[key] = fields[key]
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Try update; if a column doesn't exist in the schema, strip it and retry
    let currentUpdate = { ...update }
    let data: Record<string, unknown> | null = null
    let error: { message: string } | null = null

    for (let attempt = 0; attempt <= Object.keys(update).length; attempt++) {
      const result = await supabase
        .from('users')
        .update(currentUpdate)
        .eq('id', userId)
        .select('*')
        .single()
      if (!result.error) { data = result.data; break }
      const msg = result.error.message
      const badCols: string[] = []
      // Format: 'colname' column  (Supabase schema-cache errors)
      const fmt1 = msg.match(/['"]([\w]+)['"]\s+column/gi)
      if (fmt1) fmt1.forEach(m => { const n = m.match(/['"]([\w]+)['"]/)?.[1]; if (n && n !== 'users') badCols.push(n) })
      // Format: column 'colname'
      const fmt2 = msg.match(/column[s]?\s+['"]([\w,\s'"]+)['"]/gi)
      if (fmt2) fmt2.forEach(m => { m.match(/['"]([\w,\s'"]+)['"]/)?.[1].split(/[,\s'"]+/).filter(Boolean).forEach(c => badCols.push(c)) })
      // Fallback: match any key in the current update object
      if (badCols.length === 0) Object.keys(currentUpdate).forEach(k => { if (msg.includes(k)) badCols.push(k) })
      if (badCols.length === 0) { error = result.error; break }
      let stripped = false
      for (const col of badCols) {
        if (col in currentUpdate) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [col]: _drop, ...rest } = currentUpdate
          currentUpdate = rest; stripped = true
        }
      }
      if (!stripped) { error = result.error; break }
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ...data, ...update })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
