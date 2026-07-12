import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/dashboard/loadDashboardRequests', () => ({
  loadDashboardRequests: vi.fn(),
}))
vi.mock('@/lib/relationshipIntelligence/loadDashboardIntelligence', () => ({
  loadDashboardSuggestedActions: vi.fn(),
}))
vi.mock('@/lib/server/loadDailyOperatingSystemSignals', () => ({
  loadDailyOperatingSystemSignals: vi.fn(),
}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))

import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import { emptyDailyOperatingSystemSignals } from '@/lib/dailyOperatingSystemSignals'
import {
  parseDashboardWorkHubRequest,
  type DashboardWorkHubRequest,
} from '@/lib/dashboardWorkHubDtos'
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'
import { loadDailyOperatingSystemSignals } from '@/lib/server/loadDailyOperatingSystemSignals'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { loadDashboardWorkHub } from '@/lib/server/loadDashboardWorkHub'

const loadRequestsMock = vi.mocked(loadDashboardRequests)
const loadSuggestionsMock = vi.mocked(loadDashboardSuggestedActions)
const loadSignalsMock = vi.mocked(loadDailyOperatingSystemSignals)
const logServerErrorMock = vi.mocked(logServerError)
const signals = emptyDailyOperatingSystemSignals()

function requestFixture(
  overrides: Partial<DashboardWorkHubRequest> = {},
): DashboardWorkHubRequest {
  const request = parseDashboardWorkHubRequest({
    id: 'request-a',
    request_type: 'baptism',
    parishioner_id: 'parishioner-a',
    ...overrides,
  })
  if (!request) throw new Error('Invalid Work Hub request fixture')
  return request
}

describe('loadDashboardWorkHub', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadSignalsMock.mockResolvedValue({ signals, warnings: [] })
    loadSuggestionsMock.mockResolvedValue([])
  })

  it('loads requests and suggestions through the exact active parish scope', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    const requests = [requestFixture()]
    const suggestedActions = [{ id: 'suggestion-a' }]
    loadRequestsMock.mockResolvedValueOnce({
      ok: true,
      requests,
      softWarnings: ['Checklist summary is temporarily unavailable.'],
    })
    loadSuggestionsMock.mockResolvedValueOnce(suggestedActions as never)
    loadSignalsMock.mockResolvedValueOnce({
      signals,
      warnings: ['Certificate event signals are temporarily unavailable.'],
    })

    const result = await loadDashboardWorkHub(supabase as never, ' parish-a ')

    expect(loadRequestsMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-a',
    })
    expect(loadSuggestionsMock).toHaveBeenCalledWith(
      supabase,
      requests,
      'parish-a',
    )
    expect(result).toEqual({
      ok: true,
      requests,
      suggestedActions,
      signals,
      warnings: [
        'Checklist summary is temporarily unavailable.',
        'Certificate event signals are temporarily unavailable.',
      ],
    })
    expect(loadSignalsMock).toHaveBeenCalledWith(supabase, 'parish-a')
  })

  it('fails closed without reading when active parish context is blank', async () => {
    const result = await loadDashboardWorkHub(
      { from: vi.fn(), rpc: vi.fn() } as never,
      '   ',
    )

    expect(result).toEqual({
      ok: false,
      fetchFailed: false,
      error: 'The Daily Work Hub is unavailable for this parish.',
    })
    expect(loadRequestsMock).not.toHaveBeenCalled()
    expect(loadSuggestionsMock).not.toHaveBeenCalled()
    expect(loadSignalsMock).not.toHaveBeenCalled()
  })

  it('keeps the request queue available with generic guidance when suggestions fail', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    const requests = [requestFixture({ parishioner_id: null })]
    loadRequestsMock.mockResolvedValueOnce({
      ok: true,
      requests,
      softWarnings: [],
    })
    loadSuggestionsMock.mockRejectedValueOnce(
      new Error('sensitive database detail'),
    )

    const result = await loadDashboardWorkHub(supabase as never, 'parish-a')

    expect(result).toEqual({
      ok: true,
      requests,
      suggestedActions: [],
      signals,
      warnings: ['Relationship suggestions are temporarily unavailable.'],
    })
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[dashboard-work-hub] suggested actions load failed',
      expect.any(Error),
      { route: '/api/dashboard/work-hub' },
    )
    expect(JSON.stringify(result)).not.toContain('sensitive database detail')
  })

  it('starts independent request and signal reads before waiting for either result', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    const deferredRequests: {
      resolve: ((value: Awaited<ReturnType<typeof loadDashboardRequests>>) => void) | null
    } = { resolve: null }
    loadRequestsMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          deferredRequests.resolve = resolve
        }),
    )

    const pending = loadDashboardWorkHub(supabase as never, 'parish-a')

    expect(loadSignalsMock).toHaveBeenCalledWith(supabase, 'parish-a')
    expect(deferredRequests.resolve).not.toBeNull()
    deferredRequests.resolve?.({ ok: true, requests: [], softWarnings: [] })

    await expect(pending).resolves.toMatchObject({ ok: true, signals })
  })
})
