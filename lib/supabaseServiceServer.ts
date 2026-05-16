import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { assertSupabaseServiceRoleEnv } from '@/lib/server/requiredEnv'

/**
 * Server-only Supabase client (service role). Requires:
 * - URL: `NEXT_PUBLIC_SUPABASE_URL`, or `SUPABASE_URL` if the former is unset
 * - Key: `SUPABASE_SERVICE_ROLE_KEY`
 */
export function createSupabaseServiceRoleClient() {
  assertSupabaseServiceRoleEnv()

  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  ).trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
