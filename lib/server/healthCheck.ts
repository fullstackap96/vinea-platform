import 'server-only'

import {
  getMissingRequiredEnv,
  isEnvSet,
  type EnvRequirement,
} from '@/lib/server/requiredEnv'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

/** Minimum env for a running Vinea deployment (names only; never log values). */
export const HEALTH_CORE_REQUIRED_ENV: readonly EnvRequirement[] = [
  { oneOf: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'] },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export const HEALTH_RESEND_ENV: readonly EnvRequirement[] = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
]

export const HEALTH_GOOGLE_OAUTH_ENV: readonly EnvRequirement[] = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

export type HealthChecks = {
  env: boolean
  supabase: boolean
  parishes: boolean
  resend: boolean
  googleOAuth: boolean
}

export type HealthCheckResponse = {
  ok: boolean
  checks: HealthChecks
  error?: string
}

/** Email features are in use when any Resend variable is configured. */
export function isEmailSendingEnabled(): boolean {
  return isEnvSet('RESEND_API_KEY') || isEnvSet('RESEND_FROM_EMAIL')
}

/** Calendar OAuth is in use when Google client credentials are partially configured. */
export function isGoogleCalendarIntegrationEnabled(): boolean {
  return isEnvSet('GOOGLE_CLIENT_ID') || isEnvSet('GOOGLE_CLIENT_SECRET')
}

function checkResendEnv(): { ok: boolean; error?: string } {
  if (!isEmailSendingEnabled()) {
    return { ok: true }
  }
  const missing = getMissingRequiredEnv(HEALTH_RESEND_ENV)
  if (missing.length === 0) return { ok: true }
  return { ok: false, error: missing[0] }
}

function checkGoogleOAuthEnv(): { ok: boolean; error?: string } {
  if (!isGoogleCalendarIntegrationEnabled()) {
    return { ok: true }
  }
  const missing = getMissingRequiredEnv(HEALTH_GOOGLE_OAUTH_ENV)
  if (missing.length === 0) return { ok: true }
  return { ok: false, error: missing[0] }
}

async function checkSupabaseAndParishes(): Promise<{
  supabase: boolean
  parishes: boolean
  error?: string
}> {
  try {
    const admin = createSupabaseServiceRoleClient()
    const { error } = await admin.from('parishes').select('id').limit(1)

    if (error) {
      return { supabase: true, parishes: false, error: 'parishes' }
    }

    return { supabase: true, parishes: true }
  } catch {
    return { supabase: false, parishes: false, error: 'supabase' }
  }
}

/**
 * Runs deployment health checks. Never includes secret values in the response.
 */
export async function runHealthChecks(): Promise<HealthCheckResponse> {
  const checks: HealthChecks = {
    env: false,
    supabase: false,
    parishes: false,
    resend: false,
    googleOAuth: false,
  }

  const coreMissing = getMissingRequiredEnv(HEALTH_CORE_REQUIRED_ENV)
  if (coreMissing.length > 0) {
    const resend = checkResendEnv()
    const google = checkGoogleOAuthEnv()
    return {
      ok: false,
      checks: {
        ...checks,
        resend: resend.ok,
        googleOAuth: google.ok,
      },
      error: coreMissing[0],
    }
  }
  checks.env = true

  const resend = checkResendEnv()
  checks.resend = resend.ok
  if (!resend.ok) {
    return { ok: false, checks, error: resend.error }
  }

  const google = checkGoogleOAuthEnv()
  checks.googleOAuth = google.ok
  if (!google.ok) {
    return { ok: false, checks, error: google.error }
  }

  const db = await checkSupabaseAndParishes()
  checks.supabase = db.supabase
  checks.parishes = db.parishes
  if (!db.supabase || !db.parishes) {
    return { ok: false, checks, error: db.error }
  }

  return { ok: true, checks }
}
