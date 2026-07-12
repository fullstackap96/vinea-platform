import { NextResponse, type NextRequest } from 'next/server'

import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import {
  loadStaffScopedRequestDetailAccess,
  type StaffScopedRequestDetailAccessOptions,
} from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import {
  parseRequestDetailParishioner,
  parseRequestDetailRequest,
} from '@/lib/requestDetailDtos'

type RouteParams = { params: Promise<{ id: string }> }

function activeParishRequestDetailAccessOptions(
  request: NextRequest,
  staffSupabase: StaffScopedRequestDetailAccessOptions['staffSupabase']
): StaffScopedRequestDetailAccessOptions {
  const activeParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null

  return {
    staffSupabase,
    activeParishId,
    allowPrimaryParishFallback: !activeParishId,
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(
      admin,
      requestId,
      activeParishRequestDetailAccessOptions(request, staff.supabase)
    )

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select(
        [
          'id',
          'created_at',
          'updated_at',
          'request_type',
          'status',
          'notes',
          'child_name',
          'preferred_dates',
          'parishioner_id',
          'person_id',
          'ai_summary',
          'reply_draft',
          'staff_notes',
          'suggested_date_1',
          'suggested_date_2',
          'suggested_date_3',
          'confirmed_baptism_date',
          'assigned_staff_name',
          'assigned_priest_name',
          'assigned_deacon_name',
          'last_contacted_at',
          'last_contact_method',
          'communication_notes',
          'next_follow_up_date',
          'waiting_on',
          'waiting_on_changed_at',
          'google_calendar_event_id',
          'google_calendar_event_html_link',
        ].join(', ')
      )
      .eq('id', access.requestId)
      .maybeSingle()

    if (requestError) throw requestError

    const requestRowObject = requestRow as unknown as Record<string, unknown> | null
    const parishionerId = String(requestRowObject?.parishioner_id ?? '').trim()
    if (!requestRowObject?.id || !parishionerId) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: parishionerRow, error: parishionerError } = await admin
      .from('parishioners')
      .select('id, full_name, email, phone, parish_id')
      .eq('id', parishionerId)
      .eq('parish_id', access.parishId)
      .maybeSingle()

    if (parishionerError) throw parishionerError

    const requestDto = parseRequestDetailRequest({
      ...requestRowObject,
      parish_id: access.parishId,
    })
    const parishionerDto = parishionerRow
      ? parseRequestDetailParishioner(parishionerRow)
      : null
    if (!requestDto || (parishionerRow && !parishionerDto)) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      requestId: access.requestId,
      parishId: access.parishId,
      request: requestDto,
      parishioner: parishionerDto,
    })
  } catch (error: unknown) {
    logServerError('[request-detail-access] verification failed', error, {
      route: '/api/requests/[id]/detail-access',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value),
    })
    return NextResponse.json({ ok: false, error: 'Could not verify request access.' }, { status: 500 })
  }
}
