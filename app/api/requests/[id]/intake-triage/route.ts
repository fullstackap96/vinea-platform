import { NextResponse, type NextRequest } from 'next/server'

import { dashboardQueueFailureMessage } from '@/lib/dashboardQueueClientMessages'
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

type IntakeTriageBody = {
  assignedStaffName?: unknown
  nextFollowUpDate?: unknown
  contactMethod?: unknown
  contactNotes?: unknown
  markFirstContact?: unknown
  doneForNow?: unknown
}

const MAX_BODY_BYTES = 64 * 1024
const MAX_STAFF_NAME_LENGTH = 200
const MAX_CONTACT_NOTES_LENGTH = 12_000
const CONTACT_METHODS = new Set([
  'email',
  'phone',
  'text',
  'in_person',
  'voicemail',
  'other',
])
const DEFAULT_CONTACT_NOTE = 'First contact completed from intake quick triage.'
const PARTIAL_SUCCESS_MESSAGE =
  'First contact was logged, but Vinea could not finish request triage. Please refresh and review the request before trying again.'

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function parseNullableText(value: unknown, maxLength: number): string | null | undefined {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  if (!normalized) return null
  return normalized.length <= maxLength ? normalized : undefined
}

function parseOptionalDate(value: unknown): string | null | undefined {
  if (value == null || value === '') return null
  return parseFollowUpCalendarDate(value) ?? undefined
}

function parseBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function parseContactMethod(value: unknown): string | null {
  const method = text(value) || 'phone'
  return CONTACT_METHODS.has(method) ? method : null
}

async function auditIntakeTriage(input: {
  parishId: string
  requestId: string
  actorEmail: string
  outcome: 'completed' | 'partial'
  ownerAssigned: boolean
  followUpDateSet: boolean
  firstContactLogged: boolean
  statusAdvanced: boolean
  requestUpdated: boolean
}) {
  await writeAuditEvent({
    parishId: input.parishId,
    actorEmail: input.actorEmail,
    action: 'request.intake_triage.updated',
    targetType: 'request',
    targetId: input.requestId,
    metadata: {
      source: 'intake_queue',
      outcome: input.outcome,
      ownerAssigned: input.ownerAssigned,
      followUpDateSet: input.followUpDateSet,
      firstContactLogged: input.firstContactLogged,
      statusAdvanced: input.statusAdvanced,
      requestUpdated: input.requestUpdated,
    },
  })
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId =
    request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim() || null

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Request triage is too large.' },
        { status: 413 },
      )
    }

    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as IntakeTriageBody)
        : null
    const assignedStaffName = parseNullableText(
      body?.assignedStaffName,
      MAX_STAFF_NAME_LENGTH,
    )
    const nextFollowUpDate = parseOptionalDate(body?.nextFollowUpDate)
    const markFirstContact = parseBoolean(body?.markFirstContact)
    const doneForNow = parseBoolean(body?.doneForNow)
    const contactMethod = parseContactMethod(body?.contactMethod)
    const parsedContactNotes = parseNullableText(
      body?.contactNotes,
      MAX_CONTACT_NOTES_LENGTH,
    )
    const contactNotes =
      parsedContactNotes === null ? DEFAULT_CONTACT_NOTE : parsedContactNotes

    if (
      assignedStaffName === undefined ||
      nextFollowUpDate === undefined ||
      markFirstContact === undefined ||
      doneForNow === undefined ||
      !contactMethod ||
      parsedContactNotes === undefined ||
      (markFirstContact && !contactNotes)
    ) {
      const error =
        nextFollowUpDate === undefined
          ? 'Invalid follow-up date.'
          : dashboardQueueFailureMessage('intakeRequestTriage')
      return NextResponse.json({ ok: false, error }, { status: 400 })
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

    const contactedAt = new Date().toISOString()
    if (markFirstContact) {
      const insertRes = await admin.from('request_communications').insert({
        request_id: access.requestId,
        contacted_at: contactedAt,
        method: contactMethod,
        notes: contactNotes,
      })

      if (insertRes.error) throw insertRes.error
    }

    const payload: Record<string, unknown> = {
      assigned_staff_name: assignedStaffName,
      next_follow_up_date: nextFollowUpDate,
    }
    if (markFirstContact) {
      payload.last_contacted_at = contactedAt
      payload.last_contact_method = contactMethod
      payload.communication_notes = contactNotes
    }
    if (doneForNow) payload.status = 'in_progress'

    const { data: updatedRequest, error: updateError } = await admin
      .from('requests')
      .update(payload)
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (updateError || !updatedRequest?.id) {
      if (markFirstContact) {
        logServerError('[request-intake-triage] request update failed after communication', updateError, {
          route: '/api/requests/[id]/intake-triage',
          activeParishCookiePresent: Boolean(activeParishId),
        })
        await auditIntakeTriage({
          parishId: access.parishId,
          requestId: access.requestId,
          actorEmail: staff.staff.email,
          outcome: 'partial',
          ownerAssigned: Boolean(assignedStaffName),
          followUpDateSet: Boolean(nextFollowUpDate),
          firstContactLogged: true,
          statusAdvanced: doneForNow,
          requestUpdated: false,
        })
        return NextResponse.json(
          {
            ok: false,
            partial: true,
            completed: { firstContactLogged: true, requestUpdated: false },
            error: PARTIAL_SUCCESS_MESSAGE,
          },
          { status: 500 },
        )
      }

      if (updateError) throw updateError
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    await auditIntakeTriage({
      parishId: access.parishId,
      requestId: access.requestId,
      actorEmail: staff.staff.email,
      outcome: 'completed',
      ownerAssigned: Boolean(assignedStaffName),
      followUpDateSet: Boolean(nextFollowUpDate),
      firstContactLogged: markFirstContact,
      statusAdvanced: doneForNow,
      requestUpdated: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-intake-triage] save failed', error, {
      route: '/api/requests/[id]/intake-triage',
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: dashboardQueueFailureMessage('intakeRequestTriage') },
      { status: 500 },
    )
  }
}

export const requestIntakeTriageRouteTestInternals = {
  parseBoolean,
  parseContactMethod,
  parseNullableText,
  parseOptionalDate,
}
