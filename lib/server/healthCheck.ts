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
    kind: 'rpc',
    label: 'workflow template copy function',
    functionName: 'create_request_workflow_steps_from_active_template',
    args: { p_request_id: '00000000-0000-0000-0000-000000000000' },
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
  checks: readonly SchemaReadinessCheck[] = REQUIRED_SCHEMA_READINESS_CHECKS
): Promise<string[]> {
  const missing: string[] = []

  for (const check of checks) {
    if (check.kind === 'select') {
      const { error } = await admin.from(check.table).select(check.columns).limit(1)
      if (isSchemaMissingError(error)) {
        missing.push(check.label)
      } else if (error) {
        throw error
      }
      continue
    }

    const { error } = await admin.rpc(check.functionName, check.args)
    if (error && check.missingCodes.includes(error.code ?? '')) {
      missing.push(check.label)
    } else if (error && isSchemaMissingError(error)) {
      missing.push(check.label)
    }
  }

  return missing
}

/**
 * Runs deployment health checks. Never includes secret values in the response.
 */
export async function runHealthChecks(): Promise<HealthCheckResponse> {
  const checks: HealthChecks = {
    env: false,
    supabase: false,
    parishes: false,
    schema: false,
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

  try {
    const admin = createSupabaseServiceRoleClient()
    const missingSchema = await runSchemaReadinessChecks(admin)
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
