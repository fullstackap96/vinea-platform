import { NextResponse, type NextRequest } from 'next/server'

import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string; itemId: string }> }

const MAX_BODY_BYTES = 32 * 1024

export async function PATCH(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId, itemId } = await context.params
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  try {
    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            parsedBody.reason === 'too_large'
              ? 'Checklist update is too large.'
              : 'Invalid checklist update.',
        },
        { status: parsedBody.reason === 'too_large' ? 413 : 400 }
      )
    }

    const body = parsedBody.value
    const isComplete = (body as { isComplete?: unknown } | null)?.isComplete
    if (typeof isComplete !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'Invalid checklist update.' }, { status: 400 })
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

    const { data: itemRow, error: itemLookupError } = await admin
      .from('checklist_items')
      .select('id, request_id')
      .eq('id', itemId)
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (itemLookupError) throw itemLookupError
    if (!itemRow?.id) {
      return NextResponse.json({ ok: false, error: 'Checklist item not found.' }, { status: 404 })
    }

    const { data: updatedItem, error: updateError } = await admin
      .from('checklist_items')
      .update({ is_complete: isComplete })
      .eq('id', String(itemRow.id))
      .eq('request_id', access.requestId)
      .select('id, item_name, is_complete, created_at')
      .maybeSingle()

    if (updateError) throw updateError
    if (!updatedItem?.id) {
      return NextResponse.json({ ok: false, error: 'Checklist item not found.' }, { status: 404 })
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.checklist.updated',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_request_detail',
        itemId: String(itemRow.id),
        complete: isComplete,
      },
    })

    return NextResponse.json({ ok: true, item: updatedItem })
  } catch (error: unknown) {
    logServerError('[request-checklist-item] update failed', error, {
      route: '/api/requests/[id]/checklist-items/[itemId]',
      hasRequestId: Boolean(requestId),
      hasItemId: Boolean(itemId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not update checklist item.' },
      { status: 500 }
    )
  }
}
