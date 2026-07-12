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

    const { data: checklistItems, error: checklistError } = await admin
      .from('checklist_items')
      .select('id, item_name, is_complete, created_at')
      .eq('request_id', access.requestId)
      .order('created_at', { ascending: true })

    if (checklistError) throw checklistError

    const { data: workflowSteps, error: workflowStepsError } = await admin
      .from('request_workflow_steps')
      .select(
        'id, phase, title, description, owner_type, required, status, due_date, sort_order, created_at'
      )
      .eq('request_id', access.requestId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (workflowStepsError) throw workflowStepsError

    return NextResponse.json({
      ok: true,
      checklistItems: checklistItems ?? [],
      workflowSteps: workflowSteps ?? [],
    })
  } catch (error: unknown) {
    logServerError('[request-workflow-support] load failed', error, {
      route: '/api/requests/[id]/workflow-support',
      hasRequestId: Boolean(requestId),
      activeParishCookiePresent: Boolean(activeParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load request workflow support.' },
      { status: 500 }
    )
  }
}
