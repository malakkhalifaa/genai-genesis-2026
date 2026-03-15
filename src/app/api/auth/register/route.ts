/**
 * POST /api/auth/register
 * Creates a new user account and returns the full profile + id.
 * Body: { name, email, password, region?, never_used_crypto?, never_sent_giftcards?,
 *         known_domains?, trusted_contacts?, timezone? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, password, region,
      never_used_crypto, never_sent_giftcards,
      known_domains, trusted_contacts, timezone,
    } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const password_hash = await hashPassword(password)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || null

    if (!supabase) {
      // No DB — return a local-only user ID so the app still works
      return NextResponse.json({
        id: crypto.randomUUID(),
        name, email, region: region ?? null,
        never_used_crypto: never_used_crypto ?? false,
        never_sent_giftcards: never_sent_giftcards ?? false,
        known_domains: known_domains ?? [],
        trusted_contacts: trusted_contacts ?? [],
        ip_address: ip, timezone: timezone ?? null,
        stored: 'local',
      })
    }

    // Reject duplicate email
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name, email, password_hash,
        region: region ?? null,
        timezone: timezone ?? null,
        ip_address: ip,
        never_used_crypto: never_used_crypto ?? false,
        never_sent_giftcards: never_sent_giftcards ?? false,
        known_domains: known_domains ?? [],
        trusted_contacts: trusted_contacts ?? [],
      }])
      .select('id, name, email, region, never_used_crypto, never_sent_giftcards, known_domains, trusted_contacts, timezone, ip_address, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
