import { NextResponse, type NextRequest } from 'next/server'

import { dashboardQueueFailureMessage } from '@/lib/dashboardQueueClientMessages'
import { parseFollowUpCalendarDate } from '@/lib/nextFollowUpDate'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

type MassIntentionTriageBody = {
  assignedMassDate?: unknown
  assignedPriestName?: unknown
  stipendReceived?: unknown
  doneForNow?: unknown
}

const MAX_BODY_BYTES = 64 * 1024
const MAX_PRIEST_NAME_LENGTH = 200

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

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: intentionId } = await context.params
  const activeParishId =
    request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim() || null

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok && parsedBody.reason === 'too_large') {
      return NextResponse.json(
        { ok: false, error: 'Mass intention triage is too large.' },
        { status: 413 },
      )
    }

    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as MassIntentionTriageBody)
        : null
    const assignedMassDate = parseOptionalDate(body?.assignedMassDate)
    const assignedPriestName = parseNullableText(
      body?.assignedPriestName,
      MAX_PRIEST_NAME_LENGTH,
    )
    const stipendReceived = parseBoolean(body?.stipendReceived)
    const doneForNow = parseBoolean(body?.doneForNow)

    if (
      assignedMassDate === undefined ||
      assignedPriestName === undefined ||
      stipendReceived === undefined ||
      doneForNow === undefined
    ) {
      const error =
        assignedMassDate === undefined
          ? 'Invalid Mass date.'
          : dashboardQueueFailureMessage('intakeMassIntentionTriage')
      return NextResponse.json({ ok: false, error }, { status: 400 })
    }

    const parishContext = await resolveStaffWriteParishContext(staff.supabase, {
      requestedParishId: activeParishId,
      allowPrimaryParishFallback: !activeParishId,
      fallbackReason:
        'Mass Intention intake triage used legacy parish context because active parish selection was not available.',
    })
    if (!parishContext.ok) {
      return NextResponse.json(
        { ok: false, error: 'Mass intention not found.' },
        { status: 404 },
      )
    }

    const payload: Record<string, unknown> = {
      assigned_mass_date: assignedMassDate,
      assigned_priest_name: assignedPriestName,
      stipend_received: stipendReceived,
    }
    if (doneForNow && assignedMassDate) payload.is_fulfilled = true

    const admin = createSupabaseServiceRoleClient()
    const { data: updatedIntention, error: updateError } = await admin
      .from('mass_intentions')
      .update(payload)
      .eq('id', intentionId)
      .eq('parish_id', parishContext.parishId)
      .select('id')
      .maybeSingle()

    if (updateError) throw updateError
    if (!updatedIntention?.id) {
      return NextResponse.json(
        { ok: false, error: 'Mass intention not found.' },
        { status: 404 },
      )
    }

    await writeAuditEvent({
      parishId: parishContext.parishId,
      actorEmail: staff.staff.email,
      action: 'mass_intention.intake_triage.updated',
      targetType: 'mass_intention',
      targetId: String(updatedIntention.id),
      metadata: {
        source: 'intake_queue',
        massDateSet: Boolean(assignedMassDate),
        priestAssigned: Boolean(assignedPriestName),
        stipendReceived,
        markedFulfilled: Boolean(payload.is_fulfilled),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[mass-intention-intake-triage] save failed', error, {
      route: '/api/mass-intentions/[id]/intake-triage',
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: dashboardQueueFailureMessage('intakeMassIntentionTriage') },
      { status: 500 },
    )
  }
}

export const massIntentionIntakeTriageRouteTestInternals = {
  parseBoolean,
  parseNullableText,
  parseOptionalDate,
}
