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
          parish_id: 'parish-1',
          requester_name: 'Ana Lopez',
          intention_text: 'For healing',
          requested_date: null,
          assigned_mass_date: '2026-06-21',
          assigned_priest_name: 'Fr. Thomas',
          stipend_received: true,
          is_fulfilled: false,
          notes: null,
          created_at: '2026-06-01T12:00:00.000Z',
          updated_at: '2026-06-01T12:00:00.000Z',
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
