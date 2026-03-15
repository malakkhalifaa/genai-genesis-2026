/**
 * POST /api/auth/register
 * Creates a new user account and returns the full profile + id.
 * Body: { name, email, password, region?, never_used_crypto?, never_sent_giftcards?,
 *         known_domains?, trusted_contacts?, timezone? }
 *
 * Resilient insert: if Supabase reports an unknown column, that column is
 * stripped from the row and the insert is retried automatically. This lets
 * registration succeed even when the DB schema is older than the code.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// Columns that may not exist in older schema versions — stripped on error
const OPTIONAL_COLS = [
  'ip_address', 'timezone', 'known_domains', 'trusted_contacts',
  'never_used_crypto', 'never_sent_giftcards', 'region', 'face_descriptor',
]

// Minimal SELECT that every schema version should have
const SAFE_SELECT = 'id, name, email'

/**
 * Try an insert, automatically retrying with the offending column removed
 * each time Supabase reports "column not found in schema cache".
 */
async function resilientInsert(
  row: Record<string, unknown>,
): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> {
  let current = { ...row }

  for (let attempt = 0; attempt <= OPTIONAL_COLS.length; attempt++) {
    const { data, error } = await supabase!
      .from('users')
      .insert([current])
      .select(SAFE_SELECT)
      .single()

    if (!error) return { data, error: null }

    // Supabase schema-cache errors come in two formats:
    //   "Could not find the 'col' column of 'table' in the schema cache"
    //   "column 'col' of relation 'table' does not exist"
    const msg = error.message
    const badCols: string[] = []

    // Format 1: 'colname' column  (col name before the word "column")
    const fmt1 = msg.match(/['"]([\w]+)['"]\s+column/gi)
    if (fmt1) {
      for (const m of fmt1) {
        const name = m.match(/['"]([\w]+)['"]/)?.[1]
        if (name && name !== 'users') badCols.push(name)
      }
    }
    // Format 2: column 'colname'  (col name after the word "column")
    const fmt2 = msg.match(/column[s]?\s+['"]([\w,\s'"]+)['"]/gi)
    if (fmt2) {
      for (const m of fmt2) {
        const inner = m.match(/['"]([\w,\s'"]+)['"]/)?.[1] ?? ''
        inner.split(/[,\s'"]+/).filter(Boolean).forEach(c => badCols.push(c))
      }
    }
    // Fallback: scan the error message for any known optional column name
    if (badCols.length === 0) {
      for (const col of OPTIONAL_COLS) {
        if (msg.includes(col)) badCols.push(col)
      }
    }

    if (badCols.length === 0) return { data: null, error } // unrecognised error

    let stripped = false
    for (const col of badCols) {
      if (col in current) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [col]: _drop, ...rest } = current
        current = rest
        stripped = true
      }
    }
    if (!stripped) return { data: null, error } // can't fix — bail out
  }

  return { data: null, error: { message: 'Insert failed after stripping all optional columns.' } }
}

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
      return NextResponse.json({
        id: crypto.randomUUID(),
        name, email,
        region: region ?? null,
        never_used_crypto: never_used_crypto ?? false,
        never_sent_giftcards: never_sent_giftcards ?? false,
        known_domains: known_domains ?? [],
        trusted_contacts: trusted_contacts ?? [],
        ip_address: ip,
        timezone: timezone ?? null,
        stored: 'local',
      })
    }

    // Reject duplicate email
    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const { data, error } = await resilientInsert({
      name, email, password_hash,
      region:               region               ?? null,
      timezone:             timezone             ?? null,
      ip_address:           ip,
      never_used_crypto:    never_used_crypto    ?? false,
      never_sent_giftcards: never_sent_giftcards ?? false,
      known_domains:        known_domains        ?? [],
      trusted_contacts:     trusted_contacts     ?? [],
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return what we have from DB, filling in anything that was stripped
    return NextResponse.json({
      id:                   (data as Record<string, unknown>)?.id ?? crypto.randomUUID(),
      name,
      email,
      region:               region               ?? null,
      never_used_crypto:    never_used_crypto    ?? false,
      never_sent_giftcards: never_sent_giftcards ?? false,
      known_domains:        known_domains        ?? [],
      trusted_contacts:     trusted_contacts     ?? [],
      timezone:             timezone             ?? null,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
