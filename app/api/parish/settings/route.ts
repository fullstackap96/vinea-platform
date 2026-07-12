import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { assertParishSettingsEnv } from '@/lib/server/requiredEnv'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { directoryFromJsonColumn } from '@/lib/parishDirectory'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { logServerError } from '@/lib/server/safeErrorLogging'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

const REQUEST_TYPES = ['funeral', 'wedding', 'baptism', 'ocia'] as const
type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

const MAX_BODY_BYTES = 128 * 1024

const DEFAULT_SLA_RULES = {
  firstContactDays: {
    funeral: 1,
    wedding: 2,
    baptism: 3,
    ocia: 3,
  },
  ownerAssignmentDays: {
    funeral: 0,
    wedding: 1,
    baptism: 2,
    ocia: 2,
  },
}

function isValidEmail(value: string): boolean {
  const s = String(value || '').trim()
  if (!s) return false
  return s.includes('@') && !/\s/.test(s)
}

function parishSettingsErrorResponse(
  action: string,
  error: unknown,
  safeMessage: string,
  status = 500
) {
  logServerError(`[parish-settings] ${action} failed`, error)
  return NextResponse.json({ ok: false, error: safeMessage }, { status })
}

function boundedDays(value: unknown, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(30, Math.round(n)))
}

function normalizeSlaRules(value: unknown) {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const firstSource =
    source.firstContactDays && typeof source.firstContactDays === 'object'
      ? (source.firstContactDays as Record<string, unknown>)
      : {}
  const ownerSource =
    source.ownerAssignmentDays && typeof source.ownerAssignmentDays === 'object'
      ? (source.ownerAssignmentDays as Record<string, unknown>)
      : {}

  const firstContactDays: Record<string, number> = {}
  const ownerAssignmentDays: Record<string, number> = {}
  for (const type of REQUEST_TYPES) {
    firstContactDays[type] = boundedDays(
      firstSource[type],
      DEFAULT_SLA_RULES.firstContactDays[type]
    )
    ownerAssignmentDays[type] = boundedDays(
      ownerSource[type],
      DEFAULT_SLA_RULES.ownerAssignmentDays[type]
    )
  }

  return { firstContactDays, ownerAssignmentDays }
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

async function resolveParishSettingsReadParishId(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (requestedParishId && context.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read parish settings for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to read parish settings for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function loadParishSettingsWithGoogle(admin: AdminClient, parishId: string) {
  const { data: parish, error: parishErr } = await admin
    .from('parishes')
    .select(
      'id, name, default_notification_email, staff_directory, priest_directory, daily_ops_brief_enabled, daily_ops_brief_email, daily_ops_brief_last_sent_on, daily_ops_brief_last_error, onboarding_completed_at, workflow_sla_rules, created_at'
    )
    .eq('id', parishId)
    .maybeSingle()

  if (parishErr || !parish?.id) {
    if (parishErr) {
      logServerError('[parish-settings] load parish row failed', parishErr)
    }
    return { parish: null as null, google: null as null, error: 'Parish not found.' }
  }

  const { data: row, error: rowErr } = await admin
    .from('parish_google_integrations')
    .select('status, last_error, google_account_email')
    .eq('parish_id', parish.id)
    .maybeSingle()

  if (rowErr) {
    return {
      parish,
      google: null as {
        status: string | null
        last_error: string | null
        google_account_email: string | null
      } | null,
      error: null as string | null,
    }
  }

  return {
    parish,
    google: row
      ? {
          status: row.status,
          last_error: row.last_error,
          google_account_email: row.google_account_email,
        }
      : null,
    error: null as string | null,
  }
}

export async function GET(request: NextRequest) {
  try {
    assertParishSettingsEnv()

    const staffAuth = await requireStaffFromRequest(request)
    if (!staffAuth.ok) return staffAuth.response

    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveParishSettingsReadParishId(
      staffAuth.supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }

    const { parish, google, error } = await loadParishSettingsWithGoogle(
      admin,
      parishContext.activeParishId
    )

    if (!parish) {
      return NextResponse.json({ ok: false, error: error || 'Parish not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        ok: true,
        parish: {
          id: parish.id,
          name: parish.name,
          default_notification_email: String(parish.default_notification_email ?? '').trim(),
          daily_ops_brief_enabled: Boolean(parish.daily_ops_brief_enabled),
          daily_ops_brief_email: String(parish.daily_ops_brief_email ?? '').trim(),
          daily_ops_brief_last_sent_on: parish.daily_ops_brief_last_sent_on ?? null,
          daily_ops_brief_last_error: parish.daily_ops_brief_last_error ?? null,
          onboarding_completed_at: parish.onboarding_completed_at ?? null,
          workflow_sla_rules: normalizeSlaRules(parish.workflow_sla_rules),
          staff_names: directoryFromJsonColumn(parish.staff_directory),
          priest_names: directoryFromJsonColumn(parish.priest_directory),
        },
        staff: staffAuth.staff,
        googleCalendar: google,
      },
      { status: 200 }
    )
  } catch (e: unknown) {
    return parishSettingsErrorResponse('load settings', e, 'Could not load parish settings.')
  }
}

export async function PATCH(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  try {
    assertParishSettingsEnv()

    const staffAuth = await requireStaffFromRequest(request)
    if (!staffAuth.ok) return staffAuth.response

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsedBody.reason === 'too_large'
              ? 'Parish settings update is too large.'
              : 'Invalid JSON body',
        },
        { status: parsedBody.reason === 'too_large' ? 413 : 400 }
      )
    }

    const body = parsedBody.value as Record<string, unknown> | null
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const name = String(body.name ?? '').trim().slice(0, 200)
    if (!name) {
      return NextResponse.json({ ok: false, error: 'Parish name is required' }, { status: 400 })
    }

    const emailRaw = String(body.default_notification_email ?? '').trim()
    if (emailRaw && !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid notification email, or leave it blank.' },
        { status: 400 }
      )
    }

    const dailyBriefEnabled = Boolean(body.daily_ops_brief_enabled)
    const dailyBriefEmailRaw = String(body.daily_ops_brief_email ?? '').trim()
    if (dailyBriefEmailRaw && !isValidEmail(dailyBriefEmailRaw)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid daily brief email, or leave it blank.' },
        { status: 400 }
      )
    }
    if (dailyBriefEnabled && !dailyBriefEmailRaw && !emailRaw) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Daily brief delivery needs either a daily brief email or a default notification email.',
        },
        { status: 400 }
      )
    }

    const staffDirectory = directoryFromJsonColumn(
      Array.isArray(body.staff_names) ? body.staff_names : []
    )
    const priests = directoryFromJsonColumn(
      Array.isArray(body.priest_names) ? body.priest_names : []
    )
    const workflowSlaRules = normalizeSlaRules(body.workflow_sla_rules)
    const onboardingComplete = Boolean(body.onboarding_complete)

    const admin = createSupabaseServiceRoleClient()
    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveStaffWriteParishContext(staffAuth.supabase, {
      requestedParishId,
      allowPrimaryParishFallback: !requestedParishId,
      fallbackReason: 'Parish settings API legacy compatibility path.',
    })
    if (!parishContext.ok) {
      return NextResponse.json({ ok: false, error: parishContext.error }, { status: 403 })
    }
    const parishId = parishContext.parishId

    const { data: updatedParish, error: updateErr } = await admin
      .from('parishes')
      .update({
        name,
        default_notification_email: emailRaw || null,
        daily_ops_brief_enabled: dailyBriefEnabled,
        daily_ops_brief_email: dailyBriefEmailRaw || null,
        staff_directory: staffDirectory,
        priest_directory: priests,
        workflow_sla_rules: workflowSlaRules,
        onboarding_completed_at: onboardingComplete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parishId)
      .select('id')
      .maybeSingle()

    if (updateErr) {
      return parishSettingsErrorResponse(
        'update settings',
        updateErr,
        'Could not update parish settings.'
      )
    }
    if (!updatedParish?.id) {
      return NextResponse.json(
        { ok: false, error: 'Could not update parish settings.' },
        { status: 404 },
      )
    }

    await writeAuditEvent({
      parishId,
      actorEmail: staffAuth.staff.email,
      action: 'parish_settings.updated',
      targetType: 'parish',
      targetId: parishId,
      metadata: {
        dailyBriefEnabled,
        onboardingComplete,
        staffDirectoryCount: staffDirectory.length,
        priestDirectoryCount: priests.length,
      },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e: unknown) {
    return parishSettingsErrorResponse('update settings', e, 'Could not update parish settings.')
  }
}

export const parishSettingsRouteTestInternals = {
  activeParishCookie,
  loadParishSettingsWithGoogle,
  resolveParishSettingsReadParishId,
}
