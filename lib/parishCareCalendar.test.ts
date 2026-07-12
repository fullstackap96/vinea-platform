import { describe, expect, it } from 'vitest'
import {
  buildParishCareCalendarItems,
  buildTodaysCareBrief,
} from '@/lib/parishCareCalendar'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('buildParishCareCalendarItems', () => {
  it('combines follow-ups, scheduled requests, and Mass intentions', () => {
    const items = buildParishCareCalendarItems({
      now,
      requests: [
        {
          id: 'request-1',
          request_type: 'funeral',
          status: 'in_progress',
          next_follow_up_date: '2026-06-18',
          assigned_staff_name: 'Maria',
          parishioner: { full_name: 'Garcia Family' },
          funeral_detail: {
            deceased_name: 'Jose Garcia',
            confirmed_service_at: '2026-06-20T10:00:00.000Z',
          },
        },
      ],
      intentions: [
        {
          id: 'intention-1',
          requester_name: 'Ana Lopez',
          intention_text: 'For healing',
          requested_date: null,
          assigned_mass_date: '2026-06-21',
          assigned_priest_name: 'Fr. Thomas',
          is_fulfilled: false,
        },
      ],
    })

    expect(items.map((item) => item.kind)).toEqual([
      'follow_up',
      'funeral',
      'mass_intention',
    ])
    expect(items[0]).toMatchObject({
      priority: 'urgent',
      actionLabel: 'Call today',
      ownerLabel: 'Maria',
    })
  })

  it('keeps care calendar links dashboard-internal and encoded', () => {
    const items = buildParishCareCalendarItems({
      now,
      requests: [
        {
          id: 'request/unsafe?next=https://example.test',
          request_type: 'funeral',
          status: 'in_progress',
          next_follow_up_date: '2026-06-18',
          parishioner: { full_name: 'Garcia Family' },
        },
      ],
      intentions: [
        {
          id: 'intention/unsafe?next=https://example.test',
          requester_name: 'Ana Lopez',
          intention_text: 'For healing',
          requested_date: '2026-06-21',
          assigned_mass_date: null,
          assigned_priest_name: 'Fr. Thomas',
          is_fulfilled: false,
        },
      ],
    })

    expect(items.map((item) => item.href)).toEqual([
      '/dashboard/requests/request%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test#next-follow-up',
      '/dashboard/intentions/intention%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test',
    ])
    expect(items.every((item) => item.href.startsWith('/dashboard'))).toBe(true)
    expect(items.some((item) => item.href.includes('://example.test'))).toBe(false)
  })
})

describe('buildTodaysCareBrief', () => {
  it('summarizes today, overdue, blocked, and care plan counts', () => {
    const brief = buildTodaysCareBrief({
      now,
      requests: [
        {
          id: 'overdue',
          request_type: 'baptism',
          status: 'in_progress',
          child_name: 'Sofia',
          next_follow_up_date: '2026-06-18',
          waiting_on: 'family',
        },
        {
          id: 'today',
          request_type: 'ocia',
          status: 'new',
          parishioner: { full_name: 'Lucas Cruz' },
          next_follow_up_date: '2026-06-19',
        },
      ],
      carePlans: [
        {
          requestId: 'care-1',
          planType: 'funeral_bereavement',
          familyLabel: 'Garcia Family',
          stage: 'post_funeral',
          priority: 'urgent',
          headline: 'Post-funeral bereavement care',
          summary: '',
          nextTouchpoint: '',
          dueLabel: '',
          detailHref: '/dashboard/requests/care-1',
          nextFollowUpRecommendations: [],
          canCompleteCareCycle: true,
          sortScore: 0,
        },
      ],
    })

    expect(brief.counts).toEqual({
      dueToday: 1,
      overdue: 1,
      blocked: 1,
      carePlans: 1,
    })
    expect(brief.actions).toHaveLength(2)
  })
})
