import { NextResponse, type NextRequest } from 'next/server'

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { loadDailyOperatingSystemSignals } from '@/lib/server/loadDailyOperatingSystemSignals'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { logServerError } from '@/lib/server/safeErrorLogging'

export const runtime = 'nodejs'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

function selectedParishId(request: NextRequest): string | null {
  const cookieParishId = request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value?.trim()
  if (cookieParishId) return cookieParishId

  const hintedParishId = request.headers.get('x-vinea-active-parish-id')?.trim()
  return hintedParishId || null
}

async function resolveDailyOperatingSignalsParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null,
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (
    requestedParishId &&
    (context.activeParishId !== requestedParishId || context.source !== 'membership')
  ) {
    return {
      ok: false as const,
      source: context.source,
      error: 'Daily signals are unavailable for this parish.',
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
    const parishContext = await resolveDailyOperatingSignalsParishContext(
      staff.supabase,
      requestedParishId,
    )
    if (!parishContext.ok) {
      return NextResponse.json(
        { ok: false, error: 'Daily signals are unavailable for this parish.' },
        { status: 404 },
      )
    }

    const result = await loadDailyOperatingSystemSignals(
      staff.supabase,
      parishContext.activeParishId,
    )

    return NextResponse.json({ ok: true, ...result })
  } catch (error: unknown) {
    logServerError('[daily-operating-signals] load failed', error, {
      route: '/api/dashboard/daily-operating-signals',
      hasRequestedParish: Boolean(requestedParishId),
    })
    return NextResponse.json(
      { ok: false, error: 'Could not load parish-wide daily signals.' },
      { status: 500 },
    )
  }
}

export const dailyOperatingSignalsRouteTestInternals = {
  selectedParishId,
  resolveDailyOperatingSignalsParishContext,
}
