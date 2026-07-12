import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/dashboardParishRequestScope', () => ({
  fetchDashboardRequestParishionerScope: vi.fn(),
}))

import { fetchDashboardRequestParishionerScope } from '@/lib/dashboardParishRequestScope'
import { loadDashboardRequests } from './loadDashboardRequests'

const fetchDashboardRequestParishionerScopeMock = vi.mocked(
  fetchDashboardRequestParishionerScope
)

describe('loadDashboardRequests parish scope', () => {
  it('passes the active parish id to the dashboard request parishioner scope helper', async () => {
    const supabase = {
      from: vi.fn(),
    }
    fetchDashboardRequestParishionerScopeMock.mockResolvedValueOnce({
      ok: false,
      userMessage: 'No parish members are linked to your parish yet.',
      technicalDetail: null,
    })

    const result = await loadDashboardRequests(supabase as never, {
      activeParishId: 'parish-2',
    })

    expect(result).toEqual({
      ok: false,
      fetchFailed: false,
      userMessage: 'No parish members are linked to your parish yet.',
      technicalDetail: null,
    })
    expect(fetchDashboardRequestParishionerScopeMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-2',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
