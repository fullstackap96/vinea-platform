import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))
vi.mock('@/lib/server/loadDashboardReportsSummary', () => ({
  loadDashboardReportsSummary: vi.fn(),
}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: vi.fn() }))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { loadDashboardReportsSummary } from '@/lib/server/loadDashboardReportsSummary'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  GET,
  dashboardReportsSummaryRouteTestInternals,
} from '@/app/api/dashboard/reports-summary/route'

const resolveContextMock = vi.mocked(resolveActiveStaffParishContext)
const loadSummaryMock = vi.mocked(loadDashboardReportsSummary)
const requireStaffMock = vi.mocked(requireStaffFromRequest)

const emptySummary = {
  requestAnalytics: {
    totalRequests: 0,
    openRequests: 0,
    completedRequests: 0,
    byType: [],
  },
  parishInsights: {
    totalOpenRequests: 0,
    submittedThisWeek: 0,
    averageOpenAgeDays: null,
    mostCommonRequestTypeLabel: null,
    overdueFollowUps: 0,
    unassignedOpenRequests: 0,
  },
  staffWorkloadRows: [],
}

function staffSession(supabase: unknown) {
  return {
    ok: true,
    supabase,
    user: { id: 'staff-user', email: 'staff@example.com' },
    staff: { email: 'staff@example.com', role: 'staff', source: 'database' },
  } as never
}

function memberContext(activeParishId = 'parish-a') {
  return {
    ok: true,
    source: 'membership',
    parishIds: ['parish-a', 'parish-b'],
    primaryParishId: 'parish-a',
    activeParishId,
    activeParish: { id: activeParishId, name: 'Safe Parish' },
    parishes: [
      { id: 'parish-a', name: 'Safe Parish A' },
      { id: 'parish-b', name: 'Safe Parish B' },
    ],
    requestedParishId: activeParishId,
  } as const
}

describe('dashboard reports summary route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadSummaryMock.mockResolvedValue({ ok: true, summary: emptySummary, warnings: [] })
  })

  it('requires staff authentication before parish or report reads', async () => {
    requireStaffMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    } as never)

    const response = await GET(new NextRequest('http://localhost/api/dashboard/reports-summary'))

    expect(response.status).toBe(401)
    expect(resolveContextMock).not.toHaveBeenCalled()
    expect(loadSummaryMock).not.toHaveBeenCalled()
  })

  it('loads the exact membership-validated selected parish with the staff read client', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    requireStaffMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveContextMock.mockResolvedValueOnce(memberContext('parish-b') as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/reports-summary', {
        headers: { 'x-vinea-active-parish-id': 'parish-b' },
      }),
    )

    expect(response.status).toBe(200)
    expect(resolveContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-b',
    })
    expect(loadSummaryMock).toHaveBeenCalledWith(staffSupabase, 'parish-b')
    expect(await response.json()).toMatchObject({ ok: true, summary: emptySummary })
  })

  it('rejects forged parish hints generically before report loading', async () => {
    requireStaffMock.mockResolvedValueOnce(staffSession({ from: vi.fn(), rpc: vi.fn() }))
    resolveContextMock.mockResolvedValueOnce({
      ...memberContext('parish-a'),
      requestedParishId: 'parish-forged',
      ignoredRequestedParishReason: 'Requested parish is not authorized.',
    } as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/reports-summary', {
        headers: { 'x-vinea-active-parish-id': 'parish-forged' },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Reports are unavailable for this parish.',
    })
    expect(loadSummaryMock).not.toHaveBeenCalled()
  })

  it('lets the httpOnly active parish cookie override the browser hint', () => {
    const request = new NextRequest('http://localhost/api/dashboard/reports-summary', {
      headers: {
        cookie: 'vinea_active_parish_id=parish-cookie',
        'x-vinea-active-parish-id': 'parish-header',
      },
    })

    expect(dashboardReportsSummaryRouteTestInternals.selectedParishId(request)).toBe(
      'parish-cookie',
    )
  })

  it('contains no service-role, mutation, or raw browser request loader path', () => {
    const route = readFileSync('app/api/dashboard/reports-summary/route.ts', 'utf8')
    const loader = readFileSync('lib/server/loadDashboardReportsSummary.ts', 'utf8')
    const client = readFileSync('app/dashboard/reports/DashboardReportsPage.tsx', 'utf8')

    expect(route).toContain('requireStaffFromRequest(request)')
    expect(route).not.toContain('createSupabaseServiceRoleClient')
    expect(route).not.toMatch(/export async function (?:POST|PATCH|PUT|DELETE)/)
    expect(loader).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.delete\(/)
    expect(client).not.toContain('loadDashboardRequests')
    expect(client).not.toContain("from('requests')")
    expect(client).not.toContain('technicalDetail')
  })
})
