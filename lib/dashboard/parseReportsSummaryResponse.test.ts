import { describe, expect, it } from 'vitest'
import { parseReportsSummaryResponse } from './parseReportsSummaryResponse'

function success(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    warnings: [],
    summary: {
      requestAnalytics: {
        totalRequests: 2,
        openRequests: 1,
        completedRequests: 1,
        byType: [{ typeLabel: 'Baptism', open: 1, complete: 1, total: 2 }],
      },
      parishInsights: {
        totalOpenRequests: 1,
        submittedThisWeek: 2,
        averageOpenAgeDays: 3.5,
        mostCommonRequestTypeLabel: 'Baptism',
        overdueFollowUps: 0,
        unassignedOpenRequests: 1,
      },
      staffWorkloadRows: [
        {
          staffDisplay: 'Parish Secretary',
          openRequests: 1,
          overdueFollowUps: 0,
          actionRequired: 1,
          blockedRequests: 0,
          agingRequests: 0,
          upcomingScheduled: 1,
        },
      ],
    },
    ...overrides,
  }
}

describe('parseReportsSummaryResponse', () => {
  it('accepts a complete safe reports summary', () => {
    expect(parseReportsSummaryResponse(success())).toEqual(success())
  })

  it('accepts the curated failure contract', () => {
    expect(
      parseReportsSummaryResponse({
        ok: false,
        fetchFailed: false,
        error: 'Selected parish context is unavailable.',
      }),
    ).toEqual({
      ok: false,
      fetchFailed: false,
      error: 'Selected parish context is unavailable.',
    })
  })

  it('rejects inconsistent request totals and breakdowns', () => {
    const badTotal = success()
    badTotal.summary.requestAnalytics.totalRequests = 3
    expect(parseReportsSummaryResponse(badTotal)).toBeNull()

    const badBreakdown = success()
    badBreakdown.summary.requestAnalytics.byType[0].total = 4
    expect(parseReportsSummaryResponse(badBreakdown)).toBeNull()
  })

  it('rejects malformed insight, workload, warning, and failure fields', () => {
    const badAge = success()
    badAge.summary.parishInsights.averageOpenAgeDays = -1
    expect(parseReportsSummaryResponse(badAge)).toBeNull()

    const badWorkload = success()
    badWorkload.summary.staffWorkloadRows[0].openRequests = -1
    expect(parseReportsSummaryResponse(badWorkload)).toBeNull()

    expect(parseReportsSummaryResponse(success({ warnings: [null] }))).toBeNull()
    expect(parseReportsSummaryResponse({ ok: false, error: 'No scope' })).toBeNull()
  })
})
