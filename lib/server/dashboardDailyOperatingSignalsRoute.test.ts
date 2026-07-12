import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))
vi.mock('@/lib/server/loadDailyOperatingSystemSignals', () => ({
  loadDailyOperatingSystemSignals: vi.fn(),
}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: vi.fn() }))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { loadDailyOperatingSystemSignals } from '@/lib/server/loadDailyOperatingSystemSignals'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  GET,
  dailyOperatingSignalsRouteTestInternals,
} from '@/app/api/dashboard/daily-operating-signals/route'
import { emptyDailyOperatingSystemSignals } from '@/lib/dailyOperatingSystemSignals'

const resolveContextMock = vi.mocked(resolveActiveStaffParishContext)
const loadSignalsMock = vi.mocked(loadDailyOperatingSystemSignals)
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

describe('daily operating signals route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadSignalsMock.mockResolvedValue({
      signals: emptyDailyOperatingSystemSignals(),
      warnings: [],
    })
  })

  it('requires staff authentication before resolving parish context or reading signals', async () => {
    requireStaffMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    } as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/daily-operating-signals'),
    )

    expect(response.status).toBe(401)
    expect(resolveContextMock).not.toHaveBeenCalled()
    expect(loadSignalsMock).not.toHaveBeenCalled()
  })

  it('loads only the exact membership-validated selected parish', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    requireStaffMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveContextMock.mockResolvedValueOnce(memberContext('parish-b') as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/daily-operating-signals', {
        headers: { 'x-vinea-active-parish-id': 'parish-b' },
      }),
    )

    expect(response.status).toBe(200)
    expect(resolveContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-b',
    })
    expect(loadSignalsMock).toHaveBeenCalledWith(staffSupabase, 'parish-b')
    expect(await response.json()).toMatchObject({ ok: true, warnings: [] })
  })

  it('rejects forged parish hints generically before the loader runs', async () => {
    requireStaffMock.mockResolvedValueOnce(staffSession({ from: vi.fn(), rpc: vi.fn() }))
    resolveContextMock.mockResolvedValueOnce({
      ...memberContext('parish-a'),
      requestedParishId: 'parish-forged',
      ignoredRequestedParishReason: 'Requested parish is not authorized.',
    } as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/daily-operating-signals', {
        headers: { 'x-vinea-active-parish-id': 'parish-forged' },
      }),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Daily signals are unavailable for this parish.',
    })
    expect(loadSignalsMock).not.toHaveBeenCalled()
  })

  it('lets the httpOnly active parish cookie override a browser parish hint', () => {
    const request = new NextRequest('http://localhost/api/dashboard/daily-operating-signals', {
      headers: {
        cookie: 'vinea_active_parish_id=parish-cookie',
        'x-vinea-active-parish-id': 'parish-header',
      },
    })

    expect(dailyOperatingSignalsRouteTestInternals.selectedParishId(request)).toBe(
      'parish-cookie',
    )
  })

  it('keeps primary-parish fallback only when no selected parish signal exists', async () => {
    const staffSupabase = { from: vi.fn(), rpc: vi.fn() }
    requireStaffMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveContextMock.mockResolvedValueOnce({
      ...memberContext('parish-a'),
      source: 'primary_parish_fallback',
      parishIds: ['parish-a'],
      parishes: [{ id: 'parish-a', name: 'Safe Parish A' }],
      requestedParishId: null,
    } as never)

    const response = await GET(
      new NextRequest('http://localhost/api/dashboard/daily-operating-signals'),
    )

    expect(response.status).toBe(200)
    expect(resolveContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: null,
    })
    expect(loadSignalsMock).toHaveBeenCalledWith(staffSupabase, 'parish-a')
  })

  it('uses the authenticated read client and exposes no service-role or mutation path', () => {
    const routeSource = readFileSync(
      'app/api/dashboard/daily-operating-signals/route.ts',
      'utf8',
    )
    const loaderSource = readFileSync(
      'lib/server/loadDailyOperatingSystemSignals.ts',
      'utf8',
    )

    expect(routeSource).toContain('requireStaffFromRequest(request)')
    expect(routeSource).toContain('resolveActiveStaffParishContext')
    expect(routeSource).toContain('staff.supabase')
    expect(routeSource).not.toContain('createSupabaseServiceRoleClient')
    expect(routeSource).not.toMatch(/export async function (?:POST|PATCH|PUT|DELETE)/)
    expect(loaderSource).not.toMatch(/\.insert\(|\.update\(|\.upsert\(|\.delete\(/)
  })
})
