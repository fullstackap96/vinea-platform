import 'server-only'

import {
  getMissingRequiredEnv,
  isEnvSet,
  type EnvRequirement,
} from '@/lib/server/requiredEnv'
import { parseExactAppOrigin } from '@/lib/exactAppOrigin'
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
  schema: boolean
  resend: boolean
  googleOAuth: boolean
}

export type HealthCheckResponse = {
  ok: boolean
  checks: HealthChecks
  error?: string
  missingSchema?: string[]
}

export type PublicHealthCheckResponse = {
  ok: boolean
  checks: HealthChecks
  error?: 'unhealthy'
}

export const HEALTH_DATABASE_TIMEOUT_MS = 8_000

/**
 * Keeps the public production probe useful without exposing configuration names
 * or schema labels when a deployment is unhealthy.
 */
export function buildPublicHealthCheckResponse(
  result: HealthCheckResponse,
  options: { includeFailureDetails: boolean }
): HealthCheckResponse | PublicHealthCheckResponse {
  if (result.ok || options.includeFailureDetails) {
    return result
  }

  return {
    ok: false,
    checks: result.checks,
    error: 'unhealthy',
  }
}

type SupabaseAdmin = ReturnType<typeof createSupabaseServiceRoleClient>

export type SchemaReadinessCheck =
  | {
      kind: 'select'
      label: string
      table: string
      columns: string
    }
  | {
      kind: 'rpc'
      label: string
      functionName: string
      args: Record<string, unknown>
      missingCodes: readonly string[]
      expectedExistingErrorCodes?: readonly string[]
    }

export const REQUIRED_SCHEMA_READINESS_CHECKS: readonly SchemaReadinessCheck[] = [
  {
    kind: 'select',
    label: 'staff_users table',
    table: 'staff_users',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'parish_memberships table',
    table: 'parish_memberships',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'audit_events table',
    table: 'audit_events',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'workflow_templates table',
    table: 'workflow_templates',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'request_workflow_steps table',
    table: 'request_workflow_steps',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'request_documents table',
    table: 'request_documents',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'request_portal_tokens table',
    table: 'request_portal_tokens',
    columns: 'id',
  },
  {
    kind: 'select',
    label: 'rate_limit_buckets table',
    table: 'rate_limit_buckets',
    columns: 'key',
  },
  {
    kind: 'select',
    label: 'daily brief parish columns',
    table: 'parishes',
    columns: 'daily_ops_brief_enabled, daily_ops_brief_email',
  },
  {
    kind: 'select',
    label: 'request waiting-on changed timestamp',
    table: 'requests',
    columns: 'waiting_on_changed_at',
  },
  {
    kind: 'select',
    label: 'public intake parish routing columns',
    table: 'parishes',
    columns: 'public_slug, public_display_name, public_intake_enabled',
  },
  {
    kind: 'select',
    label: 'public intake domain routing table',
    table: 'parish_public_intake_domains',
    columns:
      'id, parish_id, hostname, verified_at, verification_dns_name, verification_dns_value, verification_checked_at, verification_error, active',
  },
  {
    kind: 'select',
    label: 'public intake token routing table',
    table: 'parish_public_intake_tokens',
    columns: 'id, parish_id, token_hash, request_type, expires_at, active',
  },
  {
    kind: 'rpc',
    label: 'workflow template copy function',
    functionName: 'create_request_workflow_steps_from_active_template',
    args: { p_request_id: '00000000-0000-0000-0000-000000000000' },
    missingCodes: ['PGRST202'],
  },
  {
    kind: 'rpc',
    label: 'public intake rate-limit function',
    functionName: 'check_public_intake_rate_limit',
    args: {
      // The function rejects this before its DELETE/INSERT/UPDATE block. That
      // proves the RPC signature is present without mutating a rate-limit row.
      p_key: '',
      p_limit: 1,
      p_window_seconds: 60,
    },
    missingCodes: ['PGRST202'],
    expectedExistingErrorCodes: ['P0001'],
  },
  {
    kind: 'rpc',
    label: 'current staff parish scope function',
    functionName: 'current_staff_parish_ids',
    args: {},
    missingCodes: ['PGRST202'],
  },
  {
    kind: 'rpc',
    label: 'parish authorization scope function',
    functionName: 'is_authorized_for_parish',
    args: {
      p_parish_id: '00000000-0000-0000-0000-000000000000',
    },
    missingCodes: ['PGRST202'],
  },
]

/** Email features are in use when any Resend variable is configured. */
export function isEmailSendingEnabled(): boolean {
  return isEnvSet('RESEND_API_KEY') || isEnvSet('RESEND_FROM_EMAIL')
}

/** Calendar OAuth is in use when Google client credentials are partially configured. */
export function isGoogleCalendarIntegrationEnabled(): boolean {
  return isEnvSet('GOOGLE_CLIENT_ID') || isEnvSet('GOOGLE_CLIENT_SECRET')
}

type AppOriginEnv = {
  NEXT_PUBLIC_APP_URL?: string
  VERCEL?: string
  VERCEL_URL?: string
  VERCEL_BRANCH_URL?: string
  VERCEL_PROJECT_PRODUCTION_URL?: string
}

export function isAppOriginReady(
  env: AppOriginEnv = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  },
): boolean {
  const isVercel = env.VERCEL === '1'
  if (
    parseExactAppOrigin(env.NEXT_PUBLIC_APP_URL, {
      requireHttps: isVercel,
    })
  ) {
    return true
  }

  if (!isVercel) return false

  return [env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].some(
    (hostname) =>
      Boolean(
        parseExactAppOrigin(hostname ? `https://${hostname}` : undefined, {
          requireHttps: true,
        }),
      ),
  )
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

async function checkSupabaseAndParishes(signal: AbortSignal): Promise<{
  supabase: boolean
  parishes: boolean
  error?: string
}> {
  try {
    const admin = createSupabaseServiceRoleClient()
    const { error } = await admin
      .from('parishes')
      .select('id')
      .limit(1)
      .abortSignal(signal)

    if (error) {
      if (signal.aborted) {
        return { supabase: false, parishes: false, error: 'supabase-timeout' }
      }
      return { supabase: true, parishes: false, error: 'parishes' }
    }

    return { supabase: true, parishes: true }
  } catch {
    return { supabase: false, parishes: false, error: 'supabase' }
  }
}

function isSchemaMissingError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    error.code === '42703' ||
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('could not find the function') ||
    (message.includes('column') && message.includes('does not exist'))
  )
}

export async function runSchemaReadinessChecks(
  admin: SupabaseAdmin,
  checks: readonly SchemaReadinessCheck[] = REQUIRED_SCHEMA_READINESS_CHECKS,
  signal?: AbortSignal,
): Promise<string[]> {
  const missing: string[] = []

  for (const check of checks) {
    if (check.kind === 'select') {
      const query = admin.from(check.table).select(check.columns).limit(1)
      const { error } = await (signal ? query.abortSignal(signal) : query)
      if (isSchemaMissingError(error)) {
        missing.push(check.label)
      } else if (error) {
        throw error
      }
      continue
    }

    const query = admin.rpc(check.functionName, check.args)
    const { error } = await (signal ? query.abortSignal(signal) : query)
    if (error) {
      const code = error.code ?? ''
      if (check.missingCodes.includes(code) || isSchemaMissingError(error)) {
        missing.push(check.label)
      } else if (!check.expectedExistingErrorCodes?.includes(code)) {
        throw error
      }
    }
  }

  return missing
}

/**
 * Runs deployment health checks. Never includes secret values in the response.
 */
export async function runHealthChecks(
  options: { databaseTimeoutMs?: number } = {},
): Promise<HealthCheckResponse> {
  const checks: HealthChecks = {
    env: false,
    supabase: false,
    parishes: false,
    schema: false,
    resend: false,
    googleOAuth: false,
  }

  const coreMissing = getMissingRequiredEnv(HEALTH_CORE_REQUIRED_ENV)
  const appOriginReady = isAppOriginReady()
  if (coreMissing.length > 0 || !appOriginReady) {
    const resend = checkResendEnv()
    const google = checkGoogleOAuthEnv()
    return {
      ok: false,
      checks: {
        ...checks,
        resend: resend.ok,
        googleOAuth: google.ok,
      },
      error: coreMissing[0] ?? 'app-origin',
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

  const databaseSignal = AbortSignal.timeout(
    options.databaseTimeoutMs ?? HEALTH_DATABASE_TIMEOUT_MS,
  )
  const db = await checkSupabaseAndParishes(databaseSignal)
  checks.supabase = db.supabase
  checks.parishes = db.parishes
  if (!db.supabase || !db.parishes) {
    return { ok: false, checks, error: db.error }
  }

  try {
    const admin = createSupabaseServiceRoleClient()
    const missingSchema = await runSchemaReadinessChecks(
      admin,
      REQUIRED_SCHEMA_READINESS_CHECKS,
      databaseSignal,
    )
    checks.schema = missingSchema.length === 0
    if (missingSchema.length > 0) {
      return {
        ok: false,
        checks,
        error: 'schema',
        missingSchema,
      }
    }
  } catch {
    return { ok: false, checks, error: 'schema' }
  }

  return { ok: true, checks }
}
