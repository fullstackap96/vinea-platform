import { NextResponse, type NextRequest } from 'next/server'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { resolveRequestAuditParishId } from '@/lib/server/requestAuditParish'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { staffIsAdminForParish } from '@/lib/server/staffParishRole'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

export const runtime = 'nodejs'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]
type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

const MAX_BODY_BYTES = 64 * 1024

function text(value: unknown, max = 500): string {
  return String(value ?? '').trim().slice(0, max)
}

function clampLimit(value: unknown): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return 50
  return Math.max(1, Math.min(100, Math.round(n)))
}

function isMissingAuditEventsTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false

  return (
    error.code === 'PGRST205' &&
    String(error.message ?? '').includes("public.audit_events")
  )
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

async function resolveAuditEventsReadParishId(
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
      error: 'You are not authorized to read audit events for this parish.',
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
      error: 'You are not authorized to read audit events for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

async function resolveAuditEventsWriteParishId(input: {
  admin: AdminClient
  supabase: StaffSupabaseClient
  requestedParishId: string | null
  targetType: string
  targetId: string
}): Promise<
  | { ok: true; parishId: string }
  | { ok: false; error: string; technicalDetail: string | null; requestedParishId: string | null }
> {
  const readContext = await resolveAuditEventsReadParishId(
    input.supabase,
    input.requestedParishId
  )

  if (!readContext.ok) {
    return {
      ok: false,
      error: readContext.error,
      technicalDetail: readContext.technicalDetail,
      requestedParishId: readContext.requestedParishId,
    }
  }

  if (input.targetType !== 'request') {
    return { ok: true, parishId: readContext.activeParishId }
  }

  const requestParish = await resolveRequestAuditParishId(input.admin, input.targetId)
  if (!requestParish.ok) {
    return {
      ok: false,
      error: requestParish.error,
      technicalDetail: requestParish.technicalDetail,
      requestedParishId: input.requestedParishId,
    }
  }

  if (requestParish.parishId !== readContext.activeParishId) {
    return {
      ok: false,
      error: 'You are not authorized to write audit events for this request.',
      technicalDetail: 'Request parish does not match the active staff parish context.',
      requestedParishId: input.requestedParishId,
    }
  }

  return { ok: true, parishId: requestParish.parishId }
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const url = new URL(request.url)
  const targetType = text(url.searchParams.get('targetType'), 80)
  const targetId = text(url.searchParams.get('targetId'), 120)
  const actionPrefix = text(url.searchParams.get('actionPrefix'), 120)
  const limit = clampLimit(url.searchParams.get('limit'))

  const admin = createSupabaseServiceRoleClient()
  const requestedParishId = activeParishCookie(request)
  const parishContext = await resolveAuditEventsReadParishId(staff.supabase, requestedParishId)
  if (!parishContext.ok) {
    return NextResponse.json(
      { ok: false, error: parishContext.error },
      { status: parishContext.error === 'Parish is not configured.' ? 404 : 403 }
    )
  }
  const parishId = parishContext.activeParishId

  let canViewAll = false
  try {
    canViewAll = await staffIsAdminForParish(admin, {
      parishId,
      email: staff.staff.email,
    })
  } catch (error: unknown) {
    logServerError('[audit-events] selected-parish admin lookup failed', error, {
      route: '/api/audit-events',
      hasActiveParishCookie: Boolean(requestedParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not verify audit log access.' },
      { status: 500 }
    )
  }

  if ((!targetType || !targetId) && !canViewAll) {
    return NextResponse.json(
      { ok: false, error: 'Only parish admins can view the full audit log.' },
      { status: 403 }
    )
  }

  let query = admin
    .from('audit_events')
    .select('id, parish_id, actor_email, action, target_type, target_id, metadata, created_at')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (targetType && targetId) {
    query = query.eq('target_type', targetType).eq('target_id', targetId)
  }
  if (actionPrefix) {
    query = query.like('action', `${actionPrefix}%`)
  }

  const { data, error } = await query
  if (error) {
    if (isMissingAuditEventsTable(error)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Request activity is not configured yet. Apply the audit-event migration to show activity history.',
        },
        { status: 503 }
      )
    }
    logServerError('[audit-events] read failed', error, {
      route: '/api/audit-events',
      targetType: targetType || null,
      hasTargetId: Boolean(targetId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load audit events.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    canViewAll,
    activeParishName: parishContext.activeParish.name ?? null,
    events: data ?? [],
  })
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsedBody.reason === 'too_large'
            ? 'Audit event is too large.'
            : 'Invalid request.',
      },
      { status: parsedBody.reason === 'too_large' ? 413 : 400 }
    )
  }

  const body = parsedBody.value as Record<string, unknown> | null
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const action = text(body.action, 120)
  const targetType = text(body.targetType, 80)
  const targetId = text(body.targetId, 120)
  const metadata =
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, unknown>)
      : {}

  if (!action || !targetType || !targetId) {
    return NextResponse.json(
      { ok: false, error: 'Missing action, target type, or target id.' },
      { status: 400 }
    )
  }

  if (targetType === 'request') {
    return NextResponse.json({ ok: false, error: 'Invalid audit event.' }, { status: 400 })
  }

  const admin = createSupabaseServiceRoleClient()
  const requestedParishId = activeParishCookie(request)
  const parishContext = await resolveAuditEventsWriteParishId({
    admin,
    supabase: staff.supabase,
    requestedParishId,
    targetType,
    targetId,
  })
  if (!parishContext.ok) {
    return NextResponse.json(
      { ok: false, error: parishContext.error },
      { status: parishContext.error === 'Parish is not configured.' ? 404 : 403 }
    )
  }

  if (targetType !== 'request') {
    let canWriteParishAuditEvent = false
    try {
      canWriteParishAuditEvent = await staffIsAdminForParish(admin, {
        parishId: parishContext.parishId,
        email: staff.staff.email,
      })
    } catch (error: unknown) {
      logServerError('[audit-events] selected-parish write access lookup failed', error, {
        route: '/api/audit-events',
        hasActiveParishCookie: Boolean(requestedParishId),
      })
      return NextResponse.json(
        { ok: false, error: 'Could not verify audit event access.' },
        { status: 500 }
      )
    }

    if (!canWriteParishAuditEvent) {
      return NextResponse.json(
        { ok: false, error: 'Only parish admins can write non-request audit events.' },
        { status: 403 }
      )
    }
  }

  try {
    await writeAuditEvent({
      parishId: parishContext.parishId,
      actorEmail: staff.staff.email,
      action,
      targetType,
      targetId,
      metadata,
    })
  } catch (error) {
    if (isMissingAuditEventsTable(error as { code?: string; message?: string } | null)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Request activity is not configured yet. Apply the audit-event migration to save activity history.',
        },
        { status: 503 }
      )
    }
    logServerError('[audit-events] write failed', error, {
      route: '/api/audit-events',
      targetType,
      hasTargetId: Boolean(targetId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not save audit event.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export const auditEventsRouteTestInternals = {
  activeParishCookie,
  resolveAuditEventsReadParishId,
  resolveAuditEventsWriteParishId,
}
