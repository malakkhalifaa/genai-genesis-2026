/**
 * Supabase client — only initialised when credentials are present.
 * Falls back gracefully to null so localStorage is used instead.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
const key  = process.env.SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null

export const hasDB = () => !!supabase
