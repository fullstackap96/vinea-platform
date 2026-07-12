import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))
vi.mock('@/lib/dashboardParishRequestScope', () => ({
  fetchDashboardRequestParishionerScope: vi.fn(),
}))

import { fetchDashboardRequestParishionerScope } from '@/lib/dashboardParishRequestScope'
import {
  dashboardReportsSummaryLoaderTestInternals,
  loadDashboardReportsSummary,
} from '@/lib/server/loadDashboardReportsSummary'

const fetchScopeMock = vi.mocked(fetchDashboardRequestParishionerScope)

type QueryCall = { table: string; method: string; args: unknown[] }
type QueryResult = { data: unknown[] | null; error: unknown }

function createClient(results: Record<string, QueryResult>) {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
        return builder
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
        return builder
      }),
      then: (
        resolve: (value: QueryResult) => void,
        reject?: (reason?: unknown) => void,
      ) => Promise.resolve(results[table] ?? { data: [], error: null }).then(resolve, reject),
    }
    return builder
  }

  return {
    client: {
      from: vi.fn((table: string) => builderFor(table)),
      rpc: vi.fn(),
    },
    calls,
  }
}

const now = new Date('2026-07-10T15:00:00.000Z')
const requestRows = [
  {
    id: 'baptism-1',
    request_type: 'baptism',
    status: 'new',
    created_at: '2026-07-08T15:00:00.000Z',
    assigned_staff_name: 'Maria',
    next_follow_up_date: '2026-07-09',
    last_contacted_at: '2026-07-01T15:00:00.000Z',
    waiting_on: null,
    confirmed_baptism_date: '2026-07-20T15:00:00.000Z',
  },
  {
    id: 'funeral-1',
    request_type: 'funeral',
    status: 'new',
    created_at: '2026-07-09T15:00:00.000Z',
    assigned_staff_name: null,
    next_follow_up_date: null,
    last_contacted_at: null,
    waiting_on: 'family',
    confirmed_baptism_date: null,
  },
  {
    id: 'complete-1',
    request_type: 'wedding',
    status: 'complete',
    created_at: '2026-07-01T15:00:00.000Z',
    assigned_staff_name: 'Maria',
    next_follow_up_date: null,
    last_contacted_at: '2026-07-01T15:00:00.000Z',
    waiting_on: null,
    confirmed_baptism_date: null,
  },
]

describe('loadDashboardReportsSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchScopeMock.mockResolvedValue({ ok: true, parishionerIds: ['contact-1'] })
  })

  it('returns report DTOs from minimal parish-scoped request and schedule fields', async () => {
    const { client, calls } = createClient({
      requests: { data: requestRows, error: null },
      funeral_request_details: {
        data: [{ request_id: 'funeral-1', confirmed_service_at: '2026-07-21T15:00:00.000Z' }],
        error: null,
      },
      wedding_request_details: {
        data: [{ request_id: 'complete-1', confirmed_ceremony_at: '2026-07-22T15:00:00.000Z' }],
        error: null,
      },
    })

    const result = await loadDashboardReportsSummary(client as never, ' parish-a ', now)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.summary.requestAnalytics).toMatchObject({
      totalRequests: 3,
      openRequests: 2,
      completedRequests: 1,
    })
    expect(result.summary.parishInsights).toMatchObject({
      totalOpenRequests: 2,
      submittedThisWeek: 2,
      unassignedOpenRequests: 1,
    })
    expect(result.summary.staffWorkloadRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ staffDisplay: 'Maria', openRequests: 1 }),
        expect.objectContaining({ staffDisplay: 'Unassigned', openRequests: 1 }),
      ]),
    )
    expect(fetchScopeMock).toHaveBeenCalledWith(client, { activeParishId: 'parish-a' })

    const requestSelect = calls.find(
      (call) => call.table === 'requests' && call.method === 'select',
    )
    expect(requestSelect?.args).toEqual([
      dashboardReportsSummaryLoaderTestInternals.REPORT_REQUEST_FIELDS,
    ])
    expect(String(requestSelect?.args[0])).not.toMatch(
      /\bnotes\b|reply_draft|parishioner|email|phone|child_name|preferred_dates/,
    )
    expect(calls).toContainEqual({
      table: 'funeral_request_details',
      method: 'select',
      args: ['request_id, confirmed_service_at'],
    })
  })

  it('returns a generic partial warning when a confirmed schedule source is unavailable', async () => {
    const { client } = createClient({
      requests: { data: requestRows, error: null },
      funeral_request_details: { data: null, error: { message: 'unavailable' } },
      wedding_request_details: { data: [], error: null },
    })

    const result = await loadDashboardReportsSummary(client as never, 'parish-a', now)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.warnings).toEqual([
      'Some confirmed schedule totals are temporarily unavailable.',
    ])
  })

  it('does not query when active parish context is blank', async () => {
    const { client } = createClient({})

    const result = await loadDashboardReportsSummary(client as never, '   ', now)

    expect(result).toEqual({
      ok: false,
      fetchFailed: false,
      error: 'Selected parish context is unavailable.',
    })
    expect(fetchScopeMock).not.toHaveBeenCalled()
    expect(client.from).not.toHaveBeenCalled()
  })
})
