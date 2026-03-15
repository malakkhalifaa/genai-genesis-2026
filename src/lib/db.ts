/**
 * Supabase admin client for server-side API routes.
 * Uses the service role key to bypass Row Level Security (RLS).
 * Never expose this client or key to the browser.
 *
 * Falls back gracefully to null so localStorage is used instead
 * when Supabase credentials are not configured.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url         = process.env.NEXT_PUBLIC_SUPABASE_URL
// Prefer service role key (bypasses RLS); fall back to anon key
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey     = process.env.SUPABASE_ANON_KEY
const key         = serviceKey || anonKey

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          // Disable auto-refresh and session persistence — this is a server-side client
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

export const hasDB = () => !!supabase
