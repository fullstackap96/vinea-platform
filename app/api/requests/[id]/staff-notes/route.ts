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
const MAX_BODY_BYTES = 256 * 1024

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
      return NextResponse.json({ ok: false, error: 'Staff notes are too large.' }, { status: 413 })
    }
    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : null
    const staffNotes = body?.staffNotes
    if (typeof staffNotes !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid staff notes update.' }, { status: 400 })
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

    const { data: updatedRequest, error } = await admin
      .from('requests')
      .update({ staff_notes: staffNotes })
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
      action: 'request.staff_notes.updated',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_request_detail',
        notesLength: staffNotes.length,
        staffReviewRequired: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-staff-notes] update failed', error, {
      route: '/api/requests/[id]/staff-notes',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update staff notes.' },
      { status: 500 }
    )
  }
}
