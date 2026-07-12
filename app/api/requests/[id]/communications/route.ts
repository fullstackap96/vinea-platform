import { NextResponse, type NextRequest } from 'next/server'

import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

const COMMUNICATION_METHODS = new Set(['email', 'phone', 'text', 'in_person', 'voicemail', 'other'])
const COMMUNICATION_SOURCES = new Set([
  'request_detail',
  'request_detail_email',
  'daily_work_hub_email',
  'communications_center',
])
const MAX_BODY_BYTES = 64 * 1024

function parseCommunicationMethod(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return COMMUNICATION_METHODS.has(value) ? value : undefined
}

function parseContactedAt(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : value
}

function parseOptionalNotes(value: unknown): string | null | undefined {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function parseCommunicationSource(value: unknown): string {
  return typeof value === 'string' && COMMUNICATION_SOURCES.has(value)
    ? value
    : 'request_detail'
}

function parseOptionalFollowUpDate(
  body: Record<string, unknown> | null
): { present: false; value: undefined } | { present: true; value: string | null } | null {
  if (!body || !Object.prototype.hasOwnProperty.call(body, 'nextFollowUpDate')) {
    return { present: false, value: undefined }
  }

  if (body.nextFollowUpDate == null || body.nextFollowUpDate === '') {
    return { present: true, value: null }
  }

  const value = parseFollowUpCalendarDate(body.nextFollowUpDate)
  return value ? { present: true, value } : null
}

async function auditCommunicationMutation(input: {
  parishId: string
  requestId: string
  actorEmail: string
  action: 'request.communication.logged' | 'request.follow_up.updated'
  source: string
  method?: string
  outcome: 'completed' | 'partial'
  communicationLogged: boolean
  requestSummaryUpdated: boolean
  followUpDateChanged: boolean
  followUpDateSet: boolean
}) {
  await writeAuditEvent({
    parishId: input.parishId,
    actorEmail: input.actorEmail,
    action: input.action,
    targetType: 'request',
    targetId: input.requestId,
    metadata: {
      source: input.source,
      ...(input.method ? { label: input.method } : {}),
      outcome: input.outcome,
      communicationLogged: input.communicationLogged,
      requestSummaryUpdated: input.requestSummaryUpdated,
      followUpDateChanged: input.followUpDateChanged,
      followUpDateSet: input.followUpDateSet,
    },
  })
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('request_communications')
      .select('id, contacted_at, method, notes, created_at')
      .eq('request_id', access.requestId)
      .order('contacted_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ ok: true, communications: data ?? [] })
  } catch (error: unknown) {
    logServerError('[request-communications] load failed', error, {
      route: '/api/requests/[id]/communications',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load request communication history.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Communication log is too large.' },
        { status: 413 },
      )
    }
    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : null
    const contactedAt = body && Object.prototype.hasOwnProperty.call(body, 'contactedAt')
      ? parseContactedAt(body.contactedAt)
      : new Date().toISOString()
    const method = parseCommunicationMethod(body?.method)
    const notes = parseOptionalNotes(body?.notes)
    const source = parseCommunicationSource(body?.source)
    const followUpDate = parseOptionalFollowUpDate(body)

    if (!followUpDate) {
      return NextResponse.json(
        { ok: false, error: 'Invalid follow-up date.' },
        { status: 400 },
      )
    }
    if (source === 'communications_center' && !notes) {
      return NextResponse.json(
        { ok: false, error: 'Add a short communication note.' },
        { status: 400 },
      )
    }
    if (
      !contactedAt ||
      !method ||
      notes === undefined
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid communication log.' },
        { status: 400 }
      )
    }

    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const insertRes = await admin.from('request_communications').insert({
      request_id: access.requestId,
      contacted_at: contactedAt,
      method,
      notes,
    })

    if (insertRes.error) throw insertRes.error

    const requestSummaryUpdate: Record<string, unknown> = {
      last_contacted_at: contactedAt,
      last_contact_method: method,
      communication_notes: notes,
    }
    if (followUpDate.present) {
      requestSummaryUpdate.next_follow_up_date = followUpDate.value
    }

    const updateRes = await admin
      .from('requests')
      .update(requestSummaryUpdate)
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (updateRes.error || !updateRes.data?.id) {
      logServerError('[request-communications] summary update failed after log', updateRes.error, {
        route: '/api/requests/[id]/communications',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(activeParishId),
      })
      await auditCommunicationMutation({
        parishId: access.parishId,
        requestId: access.requestId,
        actorEmail: staff.staff.email,
        action: 'request.communication.logged',
        source,
        method,
        outcome: 'partial',
        communicationLogged: true,
        requestSummaryUpdated: false,
        followUpDateChanged: followUpDate.present,
        followUpDateSet: followUpDate.present && Boolean(followUpDate.value),
      })
      return NextResponse.json(
        {
          ok: false,
          partial: true,
          completed: { communicationLogged: true, requestSummaryUpdated: false },
          error:
            'Communication was logged, but Vinea could not update the request summary. Please refresh before closing this follow-up.',
        },
        { status: 500 }
      )
    }

    await auditCommunicationMutation({
      parishId: access.parishId,
      requestId: access.requestId,
      actorEmail: staff.staff.email,
      action: 'request.communication.logged',
      source,
      method,
      outcome: 'completed',
      communicationLogged: true,
      requestSummaryUpdated: true,
      followUpDateChanged: followUpDate.present,
      followUpDateSet: followUpDate.present && Boolean(followUpDate.value),
    })

    return NextResponse.json({
      ok: true,
      completed: { communicationLogged: true, requestSummaryUpdated: true },
    })
  } catch (error: unknown) {
    logServerError('[request-communications] log failed', error, {
      route: '/api/requests/[id]/communications',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not log communication.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Follow-up update is too large.' },
        { status: 413 },
      )
    }

    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : null
    const followUpDate = parseOptionalFollowUpDate(body)
    const source = parseCommunicationSource(body?.source)
    if (!followUpDate?.present) {
      return NextResponse.json(
        { ok: false, error: 'Invalid follow-up date.' },
        { status: 400 },
      )
    }

    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('requests')
      .update({ next_follow_up_date: followUpDate.value })
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!data?.id) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    await auditCommunicationMutation({
      parishId: access.parishId,
      requestId: access.requestId,
      actorEmail: staff.staff.email,
      action: 'request.follow_up.updated',
      source,
      outcome: 'completed',
      communicationLogged: false,
      requestSummaryUpdated: true,
      followUpDateChanged: true,
      followUpDateSet: Boolean(followUpDate.value),
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-communications] follow-up update failed', error, {
      route: '/api/requests/[id]/communications',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update the follow-up date.' },
      { status: 500 },
    )
  }
}

export const requestCommunicationsRouteTestInternals = {
  parseCommunicationMethod,
  parseCommunicationSource,
  parseContactedAt,
  parseOptionalFollowUpDate,
  parseOptionalNotes,
}
