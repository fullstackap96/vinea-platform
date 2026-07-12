import { NextResponse, type NextRequest } from 'next/server'

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { loadDashboardReportsSummary } from '@/lib/server/loadDashboardReportsSummary'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'

export const runtime = 'nodejs'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

function selectedParishId(request: NextRequest): string | null {
  const cookieParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim()
  if (cookieParishId) return cookieParishId
  return request.headers.get('x-vinea-active-parish-id')?.trim() || null
}

async function resolveReportsParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null,
) {
  const context = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!context.ok) return context

  if (
    requestedParishId &&
    (context.activeParishId !== requestedParishId || context.source !== 'membership')
  ) {
    return {
      ok: false as const,
      source: context.source,
      error: 'Reports are unavailable for this parish.',
      technicalDetail: 'Requested parish did not resolve through exact staff membership.',
      requestedParishId,
    }
  }

  return context
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) return staff.response

  const requestedParishId = selectedParishId(request)
  try {
    const parishContext = await resolveReportsParishContext(staff.supabase, requestedParishId)
    if (!parishContext.ok) {
      return NextResponse.json(
        { ok: false, error: 'Reports are unavailable for this parish.' },
        { status: 404 },
      )
    }

    const result = await loadDashboardReportsSummary(
      staff.supabase,
      parishContext.activeParishId,
    )
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, fetchFailed: result.fetchFailed, error: result.error },
        { status: result.fetchFailed ? 500 : 200 },
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    logServerError('[dashboard-reports] summary load failed', error, {
      route: '/api/dashboard/reports-summary',
      hasRequestedParish: Boolean(requestedParishId),
    })
    return NextResponse.json(
      { ok: false, fetchFailed: true, error: 'Reports could not be loaded.' },
      { status: 500 },
    )
  }
}

export const dashboardReportsSummaryRouteTestInternals = {
  selectedParishId,
  resolveReportsParishContext,
}
