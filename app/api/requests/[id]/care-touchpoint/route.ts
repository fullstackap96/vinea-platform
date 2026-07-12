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

type CareTouchpointBody = {
  method?: unknown
  notes?: unknown
  nextFollowUpDate?: unknown
  careCycleComplete?: unknown
}

type CareTouchpointAuditInput = {
  parishId: string
  requestId: string
  actorEmail: string
  method: string
  careCycleComplete: boolean
  nextFollowUpDate: string | null
  outcome: 'completed' | 'partial'
  completed: {
    communicationLogged: boolean
    funeralCareDateUpdated: boolean
    requestSummaryUpdated: boolean
  }
}

const MAX_BODY_BYTES = 64 * 1024
const MAX_NOTES_LENGTH = 12_000
const COMMUNICATION_METHODS = new Set([
  'email',
  'phone',
  'text',
  'in_person',
  'voicemail',
  'card',
  'other',
])

function selectedParishId(request: NextRequest): string | null {
  const cookieParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim()
  if (cookieParishId) return cookieParishId

  const requestedParishId = request.headers.get('x-vinea-active-parish-id')?.trim()
  return requestedParishId || null
}

function parseMethod(value: unknown): string | null {
  const method = typeof value === 'string' ? value.trim() : ''
  return COMMUNICATION_METHODS.has(method) ? method : null
}

function parseNotes(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const notes = value.trim()
  return notes && notes.length <= MAX_NOTES_LENGTH ? notes : null
}

async function auditCareTouchpoint(input: CareTouchpointAuditInput) {
  await writeAuditEvent({
    parishId: input.parishId,
    actorEmail: input.actorEmail,
    action: 'request.communication.logged',
    targetType: 'request',
    targetId: input.requestId,
    metadata: {
      label: input.method,
      source: 'daily_work_hub_care_touchpoint',
      outcome: input.outcome,
      careCycleComplete: input.careCycleComplete,
      nextFollowUpDate: input.nextFollowUpDate,
      ...input.completed,
    },
  })
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = selectedParishId(request)

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Care touchpoint is too large.' },
        { status: 413 },
      )
    }

    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as CareTouchpointBody)
        : null
    const method = parseMethod(body?.method)
    const notes = parseNotes(body?.notes)
    const careCycleComplete = body?.careCycleComplete
    const nextFollowUpDate = careCycleComplete
      ? null
      : parseFollowUpCalendarDate(body?.nextFollowUpDate)

    if (!method || !notes || typeof careCycleComplete !== 'boolean' || !careCycleComplete && !nextFollowUpDate) {
      return NextResponse.json(
        { ok: false, error: 'Invalid care touchpoint.' },
        { status: 400 },
      )
    }

    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: false,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select('id, request_type')
      .eq('id', access.requestId)
      .maybeSingle()

    if (requestError) throw requestError
    if (String(requestRow?.request_type ?? '') !== 'funeral') {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const contactedAt = new Date().toISOString()
    const insertRes = await admin.from('request_communications').insert({
      request_id: access.requestId,
      contacted_at: contactedAt,
      method,
      notes,
    })

    if (insertRes.error) throw insertRes.error

    const funeralUpdate = await admin
      .from('funeral_request_details')
      .update({ post_funeral_follow_up_date: nextFollowUpDate })
      .eq('request_id', access.requestId)
      .select('request_id')
      .maybeSingle()

    if (funeralUpdate.error || !funeralUpdate.data?.request_id) {
      logServerError('[request-care-touchpoint] funeral follow-up update failed after log', funeralUpdate.error, {
        route: '/api/requests/[id]/care-touchpoint',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(activeParishId),
      })
      const completed = {
        communicationLogged: true,
        funeralCareDateUpdated: false,
        requestSummaryUpdated: false,
      }
      await auditCareTouchpoint({
        parishId: access.parishId,
        requestId: access.requestId,
        actorEmail: staff.staff.email,
        method,
        careCycleComplete,
        nextFollowUpDate,
        outcome: 'partial',
        completed,
      })
      return NextResponse.json(
        {
          ok: false,
          partial: true,
          partialStep: 'funeral_care_date',
          completed,
          error:
            'Care touchpoint was logged, but Vinea could not update the funeral care date. Please review the request.',
        },
        { status: 500 },
      )
    }

    const requestUpdate: Record<string, unknown> = {
      last_contacted_at: contactedAt,
      last_contact_method: method,
      communication_notes: notes,
      next_follow_up_date: nextFollowUpDate,
    }
    if (careCycleComplete) requestUpdate.status = 'complete'

    const updateRes = await admin
      .from('requests')
      .update(requestUpdate)
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (updateRes.error || !updateRes.data?.id) {
      logServerError('[request-care-touchpoint] request update failed after prior writes', updateRes.error, {
        route: '/api/requests/[id]/care-touchpoint',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(activeParishId),
      })
      const completed = {
        communicationLogged: true,
        funeralCareDateUpdated: true,
        requestSummaryUpdated: false,
      }
      await auditCareTouchpoint({
        parishId: access.parishId,
        requestId: access.requestId,
        actorEmail: staff.staff.email,
        method,
        careCycleComplete,
        nextFollowUpDate,
        outcome: 'partial',
        completed,
      })
      return NextResponse.json(
        {
          ok: false,
          partial: true,
          partialStep: 'request_summary',
          completed,
          error:
            'Care touchpoint was logged, but Vinea could not update the request summary. Please review the request.',
        },
        { status: 500 },
      )
    }

    const completed = {
      communicationLogged: true,
      funeralCareDateUpdated: true,
      requestSummaryUpdated: true,
    }
    await auditCareTouchpoint({
      parishId: access.parishId,
      requestId: access.requestId,
      actorEmail: staff.staff.email,
      method,
      careCycleComplete,
      nextFollowUpDate,
      outcome: 'completed',
      completed,
    })

    return NextResponse.json({ ok: true, completed })
  } catch (error: unknown) {
    logServerError('[request-care-touchpoint] save failed', error, {
      route: '/api/requests/[id]/care-touchpoint',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not save the care touchpoint.' },
      { status: 500 },
    )
  }
}
