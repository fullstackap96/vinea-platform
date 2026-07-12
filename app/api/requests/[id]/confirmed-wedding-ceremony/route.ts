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
    const confirmedCeremonyAt = optionalDateTime(body?.confirmedCeremonyAt)

    if (confirmedCeremonyAt === undefined) {
      return NextResponse.json(
        { ok: false, error: 'Invalid confirmed wedding ceremony update.' },
        { status: 400 }
      )
    }
    const auditOperation = confirmedCeremonyAt ? 'set' : 'cleared'

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
    if (String(requestRow?.request_type ?? '') !== 'wedding') {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: detailRow, error: detailError } = await admin
      .from('wedding_request_details')
      .select('request_id')
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (detailError) throw detailError
    if (!detailRow?.request_id) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: updatedDetail, error } = await admin
      .from('wedding_request_details')
      .update({ confirmed_ceremony_at: confirmedCeremonyAt })
      .eq('request_id', access.requestId)
      .select('request_id')
      .maybeSingle()

    if (error) throw error
    if (!updatedDetail?.request_id) {
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
        scheduleKind: 'confirmed_wedding_ceremony',
        operation: auditOperation,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-confirmed-wedding-ceremony] update failed', error, {
      route: '/api/requests/[id]/confirmed-wedding-ceremony',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update confirmed wedding ceremony.' },
      { status: 500 }
    )
  }
}
