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
    const confirmedBaptismDate = optionalDateTime(body?.confirmedBaptismDate)

    if (confirmedBaptismDate === undefined) {
      return NextResponse.json(
        { ok: false, error: 'Invalid confirmed baptism date update.' },
        { status: 400 }
      )
    }
    const auditOperation = confirmedBaptismDate ? 'set' : 'cleared'

    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
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
    if (String(requestRow?.request_type ?? 'baptism') !== 'baptism') {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: updatedRequest, error } = await admin
      .from('requests')
      .update({ confirmed_baptism_date: confirmedBaptismDate })
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
      action: 'request.schedule.updated',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_request_detail',
        scheduleKind: 'confirmed_baptism_date',
        operation: auditOperation,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-confirmed-baptism-date] update failed', error, {
      route: '/api/requests/[id]/confirmed-baptism-date',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update confirmed baptism date.' },
      { status: 500 }
    )
  }
}
