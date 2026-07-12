import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { googleCalendarCreateRouteTestInternals } from '@/app/api/google/calendar-event/create/route'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { loadParishGoogleCalendarIntegration } from '@/lib/parishGoogleCalendarServer'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const routePath = join(process.cwd(), 'app', 'api', 'google', 'calendar-event', 'create', 'route.ts')
const evidencePath = join(process.cwd(), 'docs', 'GOOGLE_CALENDAR_EVENT_SAFE_ERROR_LOGGING_20260706.md')

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)
  expect(earlierIndex).toBeGreaterThanOrEqual(0)
  expect(laterIndex).toBeGreaterThanOrEqual(0)
  expect(earlierIndex).toBeLessThan(laterIndex)
}

describe('Google Calendar create route parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses resolved primary parish context when no active parish cookie exists', async () => {
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: null,
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await googleCalendarCreateRouteTestInternals.resolveGoogleCalendarCreateParishContext(
        supabase as never,
        null
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      activeParishId: 'parish-1',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
  })

  it('honors an active parish cookie only when membership validates the exact parish', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })

    const result =
      await googleCalendarCreateRouteTestInternals.resolveGoogleCalendarCreateParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-2',
      requestedParishId: 'parish-2',
    })
  })

  it('fails closed when an active parish cookie is unauthorized', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result =
      await googleCalendarCreateRouteTestInternals.resolveGoogleCalendarCreateParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to create Google Calendar events for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('requires membership-backed authorization when an active parish cookie exists', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await googleCalendarCreateRouteTestInternals.resolveGoogleCalendarCreateParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-1'
      )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to create Google Calendar events for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('checks request parish ownership through the parishioner row', () => {
    expect(
      googleCalendarCreateRouteTestInternals.parishionerMatchesParish(
        { parish_id: 'parish-2' },
        'parish-2'
      )
    ).toBe(true)
    expect(
      googleCalendarCreateRouteTestInternals.parishionerMatchesParish(
        { parish_id: 'parish-1' },
        'parish-2'
      )
    ).toBe(false)
  })

  it('loads Google Calendar integration for the selected parish id', async () => {
    const integrationBuilder = {
      select: vi.fn(() => integrationBuilder),
      eq: vi.fn(() => integrationBuilder),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data: {
            parish_id: 'parish-2',
            refresh_token: 'refresh-token',
            calendar_id: 'calendar-id',
            status: 'connected',
          },
          error: null,
        })
      ),
    }
    const admin = {
      from: vi.fn(() => integrationBuilder),
    }
    createSupabaseServiceRoleClientMock.mockReturnValue(admin as never)

    const result = await loadParishGoogleCalendarIntegration('parish-2')

    expect(result).toMatchObject({
      parish_id: 'parish-2',
      refresh_token: 'refresh-token',
      calendar_id: 'calendar-id',
      status: 'connected',
    })
    expect(admin.from).toHaveBeenCalledWith('parish_google_integrations')
    expect(integrationBuilder.eq).toHaveBeenCalledWith('parish_id', 'parish-2')
    expect(admin.from).not.toHaveBeenCalledWith('parishes')
  })

  it('fails closed instead of falling back to the first parish when no parish id is provided', async () => {
    const admin = {
      from: vi.fn(),
    }
    createSupabaseServiceRoleClientMock.mockReturnValue(admin as never)

    await expect(loadParishGoogleCalendarIntegration()).resolves.toBeNull()
    await expect(loadParishGoogleCalendarIntegration('   ')).resolves.toBeNull()

    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('keeps Google insertion behind staff auth, active parish scope, request scope, and selected integration', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('requireStaffFromRequest')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('parishionerMatchesParish')
    expect(source).toContain('loadParishGoogleCalendarIntegration(')
    expect(source).toContain('parishContext.activeParishId')
    expect(source).toContain('buildDeterministicGoogleCalendarEventId')
    expect(source).toContain('createGoogleCalendarProviderOptions')
    expect(source).not.toContain('createSupabaseRouteHandlerClient')

    expectBefore(source, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(source, 'const parishContext = await resolveGoogleCalendarCreateParishContext', "const { data: reqRow")
    expectBefore(source, 'if (!parishionerMatchesParish', 'const integration = await loadParishGoogleCalendarIntegration')
    expectBefore(source, 'const integration = await loadParishGoogleCalendarIntegration', 'const calendar = getGoogleCalendarClient')
    expectBefore(source, 'const calendar = getGoogleCalendarClient', 'const insertRes = await calendar.events.insert')
    expectBefore(source, 'const deterministicEventId = buildDeterministicGoogleCalendarEventId', 'const insertRes = await calendar.events.insert')
    expectBefore(source, 'recoveredGoogleCalendarEventMatches(recovered.data', '.update({')
  })

  it('logs unexpected create failures through the shared safe logger', () => {
    const source = readFileSync(routePath, 'utf8')
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function logGoogleCalendarCreateEventError')
    expect(source).toContain("logServerError('[google-calendar-create-event] unexpected failure', error")
    expect(source).toContain("route: '/api/google/calendar-event/create'")
    expect(source).toContain('hasParishId: Boolean(parishId)')
    expect(source).not.toContain('console.error')
    expect(source).not.toContain('GOOGLE CALENDAR CREATE EVENT ERROR (technical):')
    expect(source).not.toContain('serializeGoogleCalendarErrorForLogs')

    expect(evidence).toContain('# Google Calendar Event Safe Error Logging - 2026-07-06')
    expect(evidence).toContain('/api/google/calendar-event/create')
    expect(evidence).toContain('No production access')
    expect(evidence).toContain('No Google Calendar event create/update/delete behavior changes')
  })
})
