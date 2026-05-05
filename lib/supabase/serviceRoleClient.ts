import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client (service role). Requires:
 * - URL: `NEXT_PUBLIC_SUPABASE_URL`, or `SUPABASE_URL` if the former is unset
 * - Key: `SUPABASE_SERVICE_ROLE_KEY`
 */
export function createSupabaseServiceRoleClient() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  const missing: string[] = []
  if (!url) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL (or server fallback SUPABASE_URL)')
  }
  if (!key) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s) for the Supabase service client: ${missing.join('; ')}.`
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
