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

import { dailyBriefRouteTestInternals } from '@/app/api/parish/daily-brief/route'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import {
  PARISH_DAILY_BRIEF_FUNERAL_SELECT,
  PARISH_DAILY_BRIEF_OCIA_SELECT,
  PARISH_DAILY_BRIEF_PARISHIONER_SELECT,
  PARISH_DAILY_BRIEF_REQUEST_SELECT,
  PARISH_DAILY_BRIEF_WEDDING_SELECT,
  loadParishDailyBriefByParishId,
} from '@/lib/server/loadParishDailyBrief'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const routePath = join(process.cwd(), 'app', 'api', 'parish', 'daily-brief', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'DAILY_BRIEF_SAFE_ERROR_LOGGING_20260706.md'
)

describe('daily brief route active parish context', () => {
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
      await dailyBriefRouteTestInternals.resolveDailyBriefManualSendParishContext(
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
      await dailyBriefRouteTestInternals.resolveDailyBriefManualSendParishContext(
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
      await dailyBriefRouteTestInternals.resolveDailyBriefManualSendParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to send the daily brief for this parish.',
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
      await dailyBriefRouteTestInternals.resolveDailyBriefManualSendParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-1'
      )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to send the daily brief for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('loads a manual daily brief by the selected parish id', async () => {
    const parishBuilder = {
      select: vi.fn(() => parishBuilder),
      eq: vi.fn(() => parishBuilder),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data: {
            id: 'parish-2',
            name: 'Beta Parish',
            default_notification_email: 'office@example.com',
            daily_ops_brief_enabled: true,
            daily_ops_brief_email: null,
            daily_ops_brief_last_sent_on: null,
          },
          error: null,
        })
      ),
    }
    const parishionersBuilder = {
      select: vi.fn(() => parishionersBuilder),
      eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
    }
    const supabase = {
      from: vi.fn((table: string) =>
        table === 'parishes' ? parishBuilder : parishionersBuilder
      ),
    }

    const result = await loadParishDailyBriefByParishId(
      supabase as never,
      'parish-2',
      { now: new Date('2026-06-27T12:00:00.000Z') }
    )

    expect(result?.parish.id).toBe('parish-2')
    expect(result?.toEmail).toBe('office@example.com')
    expect(supabase.from).toHaveBeenCalledWith('parishes')
    expect(parishBuilder.eq).toHaveBeenCalledWith('id', 'parish-2')
    expect(supabase.from).toHaveBeenCalledWith('parishioners')
    expect(parishionersBuilder.select).toHaveBeenCalledWith(
      PARISH_DAILY_BRIEF_PARISHIONER_SELECT
    )
    expect(parishionersBuilder.eq).toHaveBeenCalledWith('parish_id', 'parish-2')
  })

  it('confirms the parish delivery marker before treating Daily Brief state as recorded', async () => {
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'parish-2' }, error: null }),
    }
    builder.update.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    await expect(
      dailyBriefRouteTestInternals.recordDailyBriefState({
        admin: admin as never,
        parishId: 'parish-2',
        stateKind: 'sent',
        patch: {
          daily_ops_brief_last_sent_on: '2026-07-11',
          daily_ops_brief_last_error: null,
          updated_at: '2026-07-11T12:00:00.000Z',
        },
      }),
    ).resolves.toBe(true)
    expect(builder.select).toHaveBeenCalledWith('id')
    expect(builder.maybeSingle).toHaveBeenCalledTimes(1)
  })

  it('does not treat an accepted zero-row Daily Brief state update as recorded', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const builder = {
      update: vi.fn(),
      eq: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
    builder.update.mockReturnValue(builder)
    builder.eq.mockReturnValue(builder)
    builder.select.mockReturnValue(builder)
    const admin = { from: vi.fn(() => builder) }

    await expect(
      dailyBriefRouteTestInternals.recordDailyBriefState({
        admin: admin as never,
        parishId: 'parish-2',
        stateKind: 'sent',
        patch: {
          daily_ops_brief_last_sent_on: '2026-07-11',
          daily_ops_brief_last_error: null,
          updated_at: '2026-07-11T12:00:00.000Z',
        },
      }),
    ).resolves.toBe(false)
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('wires manual POST through active parish context while cron remains all-enabled-parish scoped', () => {
    const source = readFileSync(routePath, 'utf8')
    const loaderSource = readFileSync(
      join(process.cwd(), 'lib', 'server', 'loadParishDailyBrief.ts'),
      'utf8'
    )

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveDailyBriefManualSendParishContext')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('loadParishDailyBriefByParishId(admin, parishContext.activeParishId')
    expect(source).toContain('loadEnabledParishDailyBriefs(admin')
    expect(loaderSource).toContain('loadParishDailyBriefByParishId')
    expect(loaderSource).toContain('loadEnabledParishDailyBriefs')
    expect(loaderSource).toContain('.select(PARISH_DAILY_BRIEF_REQUEST_SELECT)')
    expect(loaderSource).toContain('.select(PARISH_DAILY_BRIEF_FUNERAL_SELECT)')
    expect(loaderSource).toContain('.select(PARISH_DAILY_BRIEF_WEDDING_SELECT)')
    expect(loaderSource).toContain('.select(PARISH_DAILY_BRIEF_OCIA_SELECT)')
    expect(loaderSource).not.toContain(".select('*')")
    expect(loaderSource).not.toContain('loadPrimaryParishDailyBrief')
    expect(PARISH_DAILY_BRIEF_REQUEST_SELECT).not.toContain('notes')
    expect(PARISH_DAILY_BRIEF_REQUEST_SELECT).not.toContain('reply_draft')
    expect(PARISH_DAILY_BRIEF_REQUEST_SELECT).not.toContain('preferred_dates')
    expect(PARISH_DAILY_BRIEF_REQUEST_SELECT).not.toContain('person_id')
    expect(PARISH_DAILY_BRIEF_PARISHIONER_SELECT).not.toContain('phone')
    expect(PARISH_DAILY_BRIEF_PARISHIONER_SELECT).not.toContain('parish_id')
    expect(PARISH_DAILY_BRIEF_FUNERAL_SELECT).toBe(
      'request_id, deceased_name, confirmed_service_at'
    )
    expect(PARISH_DAILY_BRIEF_WEDDING_SELECT).toBe(
      'request_id, partner_one_name, partner_two_name, confirmed_ceremony_at'
    )
    expect(PARISH_DAILY_BRIEF_OCIA_SELECT).toBe('request_id, confirmed_session_at')
  })

  it('guards only the staff manual-send method before authentication and leaves cron authorization intact', () => {
    const source = readFileSync(routePath, 'utf8')
    const postStart = source.indexOf('export async function POST(request: NextRequest)')
    const getStart = source.indexOf('export async function GET(request: NextRequest)')
    const postSource = source.slice(postStart, getStart)
    const getSource = source.slice(getStart)

    const originIndex = postSource.indexOf('rejectCrossOriginMutation(request)')
    const staffIndex = postSource.indexOf('requireStaffFromRequest(request)')
    const cronAuthorizationIndex = getSource.indexOf('cronAuthorized(request)')
    const serviceRoleIndex = getSource.indexOf('createSupabaseServiceRoleClient()')

    expect(originIndex).toBeGreaterThan(-1)
    expect(staffIndex).toBeGreaterThan(originIndex)
    expect(getSource).not.toContain('rejectCrossOriginMutation(request)')
    expect(cronAuthorizationIndex).toBeGreaterThan(-1)
    expect(serviceRoleIndex).toBeGreaterThan(cronAuthorizationIndex)
  })

  it('logs daily brief failures safely without returning or persisting raw provider messages', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('logServerError(`[daily-brief] ${action} failed`, error')
    expect(source).toContain("logDailyBriefError('email-provider', error")
    expect(source).toContain("logDailyBriefError('manual-send', error")
    expect(source).toContain("logDailyBriefError('cron-send', error")
    expect(source).toContain("logDailyBriefError('cron-list', error")
    expect(source).toContain("const DAILY_BRIEF_SEND_ERROR = 'Daily brief send failed.'")
    expect(source).toContain("error: 'Could not send daily brief.'")
    expect(source).toContain("error: 'Daily brief cron failed.'")
    expect(source).toContain('daily_ops_brief_last_error: DAILY_BRIEF_SEND_ERROR')

    expect(source).not.toContain('console.error')
    expect(source).not.toContain('errorMessage(error')
    expect(source).not.toContain('throw new Error(error.message)')
    expect(source).not.toMatch(/error:\s*error\.message/)
    expect(source).not.toMatch(/daily_ops_brief_last_error:\s*message/)
  })

  it('documents the daily brief safe error logging boundary', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('# Daily Brief Safe Error Logging - 2026-07-06')
    expect(evidence).toContain('Could not send daily brief.')
    expect(evidence).toContain('Daily brief cron failed.')
    expect(evidence).toContain('Daily brief send failed.')
    expect(evidence).toContain('No production access')
    expect(evidence).toContain('No operational RLS changes')
    expect(evidence).toContain('No raw Resend provider, configuration, or database error messages')
  })
})
