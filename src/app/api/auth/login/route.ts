/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: full user profile (excluding password_hash) + id
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured — please add Supabase credentials.' }, { status: 503 })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || null

    // Update last seen + IP non-blocking — silently skip if columns don't exist
    void (async () => {
      try {
        const r = await supabase!.from('users')
          .update({ last_seen_at: new Date().toISOString(), ip_address: ip })
          .eq('id', user.id)
        if (r.error) {
          // If ip_address doesn't exist, retry with just last_seen_at
          if (r.error.message.includes('ip_address')) {
            const r2 = await supabase!.from('users')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', user.id)
            // If last_seen_at also missing, silently give up
            void r2
          }
        }
      } catch { /* ignore all errors — this is non-critical */ }
    })()

    // Never return the password hash to the client
    const { password_hash: _omit, ...profile } = user
    return NextResponse.json({ ...profile, ip_address: ip })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
