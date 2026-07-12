import { NextResponse, type NextRequest } from 'next/server'

import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type RouteParams = { params: Promise<{ id: string }> }

const CONTACT_METHOD = 'email'
const CONTACT_NOTES = 'Marked as contacted from Follow-Up Queue'

function selectedParishId(request: NextRequest): string | null {
  const cookieParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim()
  if (cookieParishId) return cookieParishId

  const requestedParishId = request.headers.get('x-vinea-active-parish-id')?.trim()
  return requestedParishId || null
}

async function auditMarkContacted(input: {
  parishId: string
  requestId: string
  actorEmail: string
  outcome: 'completed' | 'partial'
  requestSummaryUpdated: boolean
}) {
  await writeAuditEvent({
    parishId: input.parishId,
    actorEmail: input.actorEmail,
    action: 'request.communication.logged',
    targetType: 'request',
    targetId: input.requestId,
    metadata: {
      label: CONTACT_METHOD,
      source: 'daily_work_hub_mark_contacted',
      outcome: input.outcome,
      communicationLogged: true,
      requestSummaryUpdated: input.requestSummaryUpdated,
    },
  })
}

export async function POST(request: NextRequest, context: RouteParams) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const { id: requestId } = await context.params
  const activeParishId = selectedParishId(request)

  try {
    const admin = createSupabaseServiceRoleClient()
    const access = await loadStaffScopedRequestDetailAccess(admin, requestId, {
      staffSupabase: staff.supabase,
      activeParishId,
      allowPrimaryParishFallback: false,
    })

    if (!access) {
      return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 })
    }

    const contactedAt = new Date().toISOString()
    const insertRes = await admin.from('request_communications').insert({
      request_id: access.requestId,
      contacted_at: contactedAt,
      method: CONTACT_METHOD,
      notes: CONTACT_NOTES,
    })

    if (insertRes.error) throw insertRes.error

    const updateRes = await admin
      .from('requests')
      .update({
        last_contacted_at: contactedAt,
        last_contact_method: CONTACT_METHOD,
        communication_notes: CONTACT_NOTES,
      })
      .eq('id', access.requestId)
      .select('id')
      .maybeSingle()

    if (updateRes.error || !updateRes.data?.id) {
      logServerError('[request-mark-contacted] summary update failed after log', updateRes.error, {
        route: '/api/requests/[id]/mark-contacted',
        hasRequestId: Boolean(requestId),
        activeParishCookiePresent: Boolean(activeParishId),
      })
      await auditMarkContacted({
        parishId: access.parishId,
        requestId: access.requestId,
        actorEmail: staff.staff.email,
        outcome: 'partial',
        requestSummaryUpdated: false,
      })
      return NextResponse.json(
        {
          ok: false,
          partial: true,
          completed: {
            communicationLogged: true,
            requestSummaryUpdated: false,
          },
          error:
            'Communication was logged, but Vinea could not update the request summary. Please review the request.',
        },
        { status: 500 },
      )
    }

    await auditMarkContacted({
      parishId: access.parishId,
      requestId: access.requestId,
      actorEmail: staff.staff.email,
      outcome: 'completed',
      requestSummaryUpdated: true,
    })

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    logServerError('[request-mark-contacted] save failed', error, {
      route: '/api/requests/[id]/mark-contacted',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not mark this request as contacted.' },
      { status: 500 },
    )
  }
}
