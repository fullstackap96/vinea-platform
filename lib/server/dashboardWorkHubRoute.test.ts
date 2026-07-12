import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))
vi.mock('@/lib/server/loadDashboardWorkHub', () => ({
  loadDashboardWorkHub: vi.fn(),
}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: vi.fn() }))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { emptyDailyOperatingSystemSignals } from '@/lib/dailyOperatingSystemSignals'
import { loadDashboardWorkHub } from '@/lib/server/loadDashboardWorkHub'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  GET,
  dashboardWorkHubRouteTestInternals,
} from '@/app/api/dashboard/work-hub/route'

const resolveContextMock = vi.mocked(resolveActiveStaffParishContext)
const loadWorkHubMock = vi.mocked(loadDashboardWorkHub)
const requireStaffMock = vi.mocked(requireStaffFromRequest)

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

describe('dashboard work hub route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadWorkHubMock.mockResolvedValue({
      ok: true,
      requests: [],
      suggestedActions: [],
      signals: emptyDailyOperatingSystemSignals(),
      warnings: [],
    })
  })

  it('requires staff authentication before parish or work-hub reads', async () => {
    requireStaffMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    } as never)

    const response = await GET(new NextRequest('http://localhost/api/dashboard/work-hub'))

    expect(response.status).toBe(401)
    expect(resolveContextMock).not.toHaveBeenCalled()
    expect(loadWorkHubMock).not.toHaveBeenCalled()
  })

  it('loads the exact membership-validated selected parish with the staff read client', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    requireStaffMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveContextMock.mockResolvedValueOnce(memberContext('parish-b') as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/work-hub', {
        headers: { 'x-vinea-active-parish-id': 'parish-b' },
      }),
    )

    expect(response.status).toBe(200)
    expect(resolveContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-b',
    })
    expect(loadWorkHubMock).toHaveBeenCalledWith(staffSupabase, 'parish-b')
  })

  it('rejects forged parish hints generically before work-hub loading', async () => {
    requireStaffMock.mockResolvedValueOnce(staffSession({ from: vi.fn(), rpc: vi.fn() }))
    resolveContextMock.mockResolvedValueOnce({
      ...memberContext('parish-a'),
      requestedParishId: 'parish-forged',
      ignoredRequestedParishReason: 'Requested parish is not authorized.',
    } as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/work-hub', {
        headers: { 'x-vinea-active-parish-id': 'parish-forged' },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'The Daily Work Hub is unavailable for this parish.',
    })
    expect(loadWorkHubMock).not.toHaveBeenCalled()
  })

  it('lets the httpOnly active parish cookie override the browser hint', () => {
    const request = new NextRequest('http://localhost/api/dashboard/work-hub', {
      headers: {
        cookie: 'vinea_active_parish_id=parish-cookie',
        'x-vinea-active-parish-id': 'parish-header',
      },
    })

    expect(dashboardWorkHubRouteTestInternals.selectedParishId(request)).toBe(
      'parish-cookie',
    )
  })

  it('contains no service-role, mutation, or browser database path', () => {
    const route = readFileSync('app/api/dashboard/work-hub/route.ts', 'utf8')
    const loader = readFileSync('lib/server/loadDashboardWorkHub.ts', 'utf8')
    const client = readFileSync('app/dashboard/DashboardPageCore.tsx', 'utf8')

    expect(route).toContain('requireStaffFromRequest(request)')
    expect(route).not.toContain('createSupabaseServiceRoleClient')
    expect(route).not.toMatch(/export async function (?:POST|PATCH|PUT|DELETE)/)
    expect(loader).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.delete\(/)
    expect(client).toContain("fetch('/api/dashboard/work-hub'")
    expect(client).not.toContain("from('@/lib/supabase')")
    expect(client).not.toMatch(/\.from\(['\"](?:requests|parishioners|checklist_items|people|households|sacramental_records)/)
    expect(client).not.toContain('technicalDetail')
  })
})
