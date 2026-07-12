import { NextResponse, type NextRequest } from 'next/server'

import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }
const MAX_BODY_BYTES = 32 * 1024

function optionalDateTime(value: unknown): string | null | undefined {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return undefined
  return value
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
      return NextResponse.json({ ok: false, error: 'Schedule update is too large.' }, { status: 413 })
    }
    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : null

    const suggestedDate1 = optionalDateTime(body?.suggestedDate1)
    const suggestedDate2 = optionalDateTime(body?.suggestedDate2)
    const suggestedDate3 = optionalDateTime(body?.suggestedDate3)

    if (
      suggestedDate1 === undefined ||
      suggestedDate2 === undefined ||
      suggestedDate3 === undefined
    ) {
      return NextResponse.json({ ok: false, error: 'Invalid suggested dates update.' }, { status: 400 })
    }
    const populatedDateCount = [suggestedDate1, suggestedDate2, suggestedDate3].filter(Boolean).length

    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: updatedRequest, error } = await admin
      .from('requests')
      .update({
        suggested_date_1: suggestedDate1,
        suggested_date_2: suggestedDate2,
        suggested_date_3: suggestedDate3,
      })
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!updatedRequest?.id) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.suggested_dates.updated',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_request_detail',
        populatedDateCount,
        staffReviewRequired: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-suggested-dates] update failed', error, {
      route: '/api/requests/[id]/suggested-dates',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update suggested dates.' },
      { status: 500 }
    )
  }
}
