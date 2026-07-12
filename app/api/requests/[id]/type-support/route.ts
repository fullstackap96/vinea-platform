import { NextResponse, type NextRequest } from 'next/server'

import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

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

    const { data: funeralDetail, error: funeralError } = await admin
      .from('funeral_request_details')
      .select(
        [
          'request_id',
          'deceased_name',
          'family_relationship',
          'date_of_death',
          'funeral_home_or_location',
          'funeral_director_contact',
          'service_location',
          'visitation_details',
          'cemetery_or_committal',
          'readings_music_notes',
          'obituary_program_notes',
          'post_funeral_follow_up_date',
          'preferred_service_notes',
          'confirmed_service_at',
        ].join(', ')
      )
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (funeralError) throw funeralError

    const { data: weddingDetail, error: weddingError } = await admin
      .from('wedding_request_details')
      .select(
        [
          'request_id',
          'partner_one_name',
          'partner_two_name',
          'proposed_wedding_date',
          'ceremony_notes',
          'confirmed_ceremony_at',
        ].join(', ')
      )
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (weddingError) throw weddingError

    const { data: ociaDetail, error: ociaError } = await admin
      .from('ocia_request_details')
      .select(
        [
          'request_id',
          'date_of_birth',
          'age_or_dob_note',
          'sacramental_background',
          'seeking',
          'parishioner_status',
          'preferred_contact_method',
          'availability',
          'confirmed_session_at',
        ].join(', ')
      )
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (ociaError) throw ociaError

    const { data: joinParishDetail, error: joinParishError } = await admin
      .from('join_parish_request_details')
      .select(
        [
          'request_id',
          'moving_into_parish',
          'address',
          'household_members',
          'baptized',
          'confirmed',
          'first_communion',
          'already_catholic',
          'interested_in_ocia',
          'reason',
          'notes',
        ].join(', ')
      )
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (joinParishError) throw joinParishError

    const { data: linkedSacramentalRecord, error: recordError } = await admin
      .from('sacramental_records')
      .select('id, person_name, created_at')
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (recordError) throw recordError

    return NextResponse.json({
      ok: true,
      funeralDetail: funeralDetail ?? null,
      weddingDetail: weddingDetail ?? null,
      ociaDetail: ociaDetail ?? null,
      joinParishDetail: joinParishDetail ?? null,
      linkedSacramentalRecord: linkedSacramentalRecord ?? null,
    })
  } catch (error: unknown) {
    logServerError('[request-type-support] load failed', error, {
      route: '/api/requests/[id]/type-support',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load request type support.' },
      { status: 500 }
    )
  }
}
