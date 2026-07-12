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
const MAX_BODY_BYTES = 128 * 1024

type FuneralDetailsPayload = {
  deceasedName?: unknown
  familyRelationship?: unknown
  dateOfDeath?: unknown
  funeralHomeOrLocation?: unknown
  funeralDirectorContact?: unknown
  serviceLocation?: unknown
  visitationDetails?: unknown
  cemeteryOrCommittal?: unknown
  readingsMusicNotes?: unknown
  obituaryProgramNotes?: unknown
  postFuneralFollowUpDate?: unknown
  preferredServiceNotes?: unknown
}

function requiredText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function optionalText(value: unknown): string | null | undefined {
  if (value == null || value === '') return null
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function optionalDate(value: unknown): string | null | undefined {
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
      return NextResponse.json({ ok: false, error: 'Funeral details are too large.' }, { status: 413 })
    }
    const body =
      parsedBody.ok && parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as FuneralDetailsPayload)
        : null
    const deceasedName = requiredText(body?.deceasedName)
    const familyRelationship = optionalText(body?.familyRelationship)
    const dateOfDeath = optionalDate(body?.dateOfDeath)
    const funeralHomeOrLocation = optionalText(body?.funeralHomeOrLocation)
    const funeralDirectorContact = optionalText(body?.funeralDirectorContact)
    const serviceLocation = optionalText(body?.serviceLocation)
    const visitationDetails = optionalText(body?.visitationDetails)
    const cemeteryOrCommittal = optionalText(body?.cemeteryOrCommittal)
    const readingsMusicNotes = optionalText(body?.readingsMusicNotes)
    const obituaryProgramNotes = optionalText(body?.obituaryProgramNotes)
    const postFuneralFollowUpDate = optionalDate(body?.postFuneralFollowUpDate)
    const preferredServiceNotes = optionalText(body?.preferredServiceNotes)

    if (
      !deceasedName ||
      familyRelationship === undefined ||
      dateOfDeath === undefined ||
      funeralHomeOrLocation === undefined ||
      funeralDirectorContact === undefined ||
      serviceLocation === undefined ||
      visitationDetails === undefined ||
      cemeteryOrCommittal === undefined ||
      readingsMusicNotes === undefined ||
      obituaryProgramNotes === undefined ||
      postFuneralFollowUpDate === undefined ||
      preferredServiceNotes === undefined
    ) {
      return NextResponse.json(
        { ok: false, error: 'Invalid funeral details update.' },
        { status: 400 }
      )
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

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select('id, request_type')
      .eq('id', access.requestId)
      .maybeSingle()

    if (requestError) throw requestError
    if (String(requestRow?.request_type ?? '') !== 'funeral') {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const { data: detailRow, error: detailError } = await admin
      .from('funeral_request_details')
      .select('confirmed_service_at')
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (detailError) throw detailError

    const { data: savedDetail, error } = await admin.from('funeral_request_details').upsert(
        {
          request_id: access.requestId,
          deceased_name: deceasedName,
          family_relationship: familyRelationship,
          date_of_death: dateOfDeath,
          funeral_home_or_location: funeralHomeOrLocation,
          funeral_director_contact: funeralDirectorContact,
          service_location: serviceLocation,
          visitation_details: visitationDetails,
          cemetery_or_committal: cemeteryOrCommittal,
          readings_music_notes: readingsMusicNotes,
          obituary_program_notes: obituaryProgramNotes,
          post_funeral_follow_up_date: postFuneralFollowUpDate,
          preferred_service_notes: preferredServiceNotes,
          confirmed_service_at: detailRow?.confirmed_service_at ?? null,
        },
        { onConflict: 'request_id' }
      )
      .select('request_id')
      .maybeSingle()

    if (error || !savedDetail?.request_id) {
      throw error ?? new Error('Funeral details were not saved.')
    }

    await writeAuditEvent({
      parishId: access.parishId,
      actorEmail: staff.staff.email,
      action: 'request.intake.updated',
      targetType: 'request',
      targetId: access.requestId,
      metadata: {
        source: 'staff_request_detail',
        requestType: 'funeral',
        staffReviewRequired: true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-funeral-details] update failed', error, {
      route: '/api/requests/[id]/funeral-details',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not save funeral details.' },
      { status: 500 }
    )
  }
}
