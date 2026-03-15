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

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, region, never_used_crypto, never_sent_giftcards, known_domains, trusted_contacts, timezone, ip_address, created_at, last_seen_at')
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

    const { data, error } = await supabase
      .from('users')
      .update(update)
      .eq('id', userId)
      .select('id, name, email, region, never_used_crypto, never_sent_giftcards, known_domains, trusted_contacts, timezone, face_descriptor')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
