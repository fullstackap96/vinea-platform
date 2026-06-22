import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { checkRateLimit, type RateLimitResult } from '@/lib/server/simpleRateLimit'

type SupabaseAdmin = ReturnType<typeof createSupabaseServiceRoleClient>

type DurableRateLimitRow = {
  ok?: boolean | null
  retry_after_seconds?: number | null
}

function isMissingRateLimitSchema(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    message.includes('schema cache') ||
    message.includes('could not find the function') ||
    message.includes('could not find the table')
  )
}

function normalizeRateLimitData(data: DurableRateLimitRow | DurableRateLimitRow[] | null) {
  if (Array.isArray(data)) return data[0] ?? null
  return data
}

export async function checkDurableRateLimit({
  admin,
  key,
  limit,
  windowMs,
}: {
  admin: SupabaseAdmin
  key: string
  limit: number
  windowMs: number
}): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  const { data, error } = await admin.rpc('check_public_intake_rate_limit', {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })

  if (isMissingRateLimitSchema(error)) {
    return checkRateLimit(key, { limit, windowMs })
  }

  if (error) {
    throw error
  }

  const row = normalizeRateLimitData(data as DurableRateLimitRow | DurableRateLimitRow[] | null)
  if (!row?.ok) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Number(row?.retry_after_seconds ?? windowSeconds)),
    }
  }

  return { ok: true }
}
