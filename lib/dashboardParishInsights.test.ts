import { describe, expect, it } from 'vitest'
import { buildParishInsights, startOfCalendarWeekMondayLocal } from './dashboardParishInsights'

describe('startOfCalendarWeekMondayLocal', () => {
  it('returns Monday for a Wednesday in June', () => {
    const wed = new Date(2026, 5, 17, 15, 0, 0)
    const start = startOfCalendarWeekMondayLocal(wed)
    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(15)
    expect(start.getHours()).toBe(0)
  })

  it('returns prior Monday when now is Sunday', () => {
    const sun = new Date(2026, 5, 21, 12, 0, 0)
    const start = startOfCalendarWeekMondayLocal(sun)
    expect(start.getDay()).toBe(1)
    expect(start.getDate()).toBe(15)
  })
})

describe('buildParishInsights', () => {
  const now = new Date(2026, 5, 18, 12, 0, 0)

  it('counts open, this week, types, overdue, and average age', () => {
    const weekMonday = startOfCalendarWeekMondayLocal(now)
    const inWeek = new Date(weekMonday.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
    const oldOpen = new Date(2026, 4, 1, 12, 0, 0).toISOString()

    const insights = buildParishInsights(
      [
        {
          status: 'new',
          request_type: 'baptism',
          created_at: inWeek,
          next_follow_up_date: '2026-08-01',
        },
        {
          status: 'new',
          request_type: 'baptism',
          created_at: inWeek,
          next_follow_up_date: '2026-08-01',
        },
        {
          status: 'new',
          request_type: 'funeral',
          created_at: oldOpen,
          next_follow_up_date: '2026-05-01',
        },
        { status: 'complete', request_type: 'wedding', created_at: inWeek },
      ],
      now
    )

    expect(insights.totalOpenRequests).toBe(3)
    expect(insights.submittedThisWeek).toBe(3)
    expect(insights.mostCommonRequestTypeLabel).toBe('Baptism')
    expect(insights.overdueFollowUps).toBe(1)
    expect(insights.averageOpenAgeDays).not.toBeNull()
    expect(insights.averageOpenAgeDays!).toBeGreaterThan(10)
  })

  it('returns null average and type when no open requests', () => {
    const insights = buildParishInsights(
      [{ status: 'complete', request_type: 'baptism', created_at: '2026-06-01T12:00:00.000Z' }],
      now
    )
    expect(insights.totalOpenRequests).toBe(0)
    expect(insights.averageOpenAgeDays).toBeNull()
    expect(insights.mostCommonRequestTypeLabel).toBeNull()
    expect(insights.overdueFollowUps).toBe(0)
  })
})
