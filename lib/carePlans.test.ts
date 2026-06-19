import { describe, expect, it } from 'vitest'
import {
  buildCarePlanFollowUpRecommendations,
  buildCarePlans,
  buildFuneralBereavementCarePlan,
} from '@/lib/carePlans'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('buildFuneralBereavementCarePlan', () => {
  it('creates an urgent pre-service funeral care plan', () => {
    const plan = buildFuneralBereavementCarePlan(
      {
        id: 'funeral-1',
        status: 'in_progress',
        request_type: 'funeral',
        created_at: '2026-06-18T12:00:00.000Z',
        parishioner: { full_name: 'Maria Santos' },
        funeral_detail: {
          deceased_name: 'Jose Santos',
          confirmed_service_at: '2026-06-20T10:00:00.000Z',
        },
      },
      { now }
    )

    expect(plan).toMatchObject({
      planType: 'funeral_bereavement',
      stage: 'before_service',
      priority: 'urgent',
      familyLabel: 'Jose Santos',
    })
  })

  it('creates post-funeral bereavement care after the service', () => {
    const plan = buildFuneralBereavementCarePlan(
      {
        id: 'funeral-2',
        status: 'in_progress',
        request_type: 'funeral',
        last_contacted_at: '2026-06-01T12:00:00.000Z',
        next_follow_up_date: '2026-06-18',
        funeral_detail: {
          deceased_name: 'Lucia Gomez',
          confirmed_service_at: '2026-06-10T10:00:00.000Z',
        },
      },
      { now }
    )

    expect(plan?.stage).toBe('post_funeral')
    expect(plan?.priority).toBe('urgent')
    expect(plan?.dueLabel).toContain('Past due')
  })

  it('orders urgent care plans first', () => {
    const plans = buildCarePlans(
      [
        {
          id: 'steady',
          status: 'in_progress',
          request_type: 'funeral',
          last_contacted_at: '2026-06-18T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          funeral_detail: {
            deceased_name: 'Steady Family',
            confirmed_service_at: '2026-06-10T10:00:00.000Z',
          },
        },
        {
          id: 'urgent',
          status: 'in_progress',
          request_type: 'funeral',
          next_follow_up_date: '2026-06-15',
          funeral_detail: {
            deceased_name: 'Urgent Family',
            confirmed_service_at: '2026-06-10T10:00:00.000Z',
          },
        },
      ],
      { now }
    )

    expect(plans[0]?.requestId).toBe('urgent')
  })

  it('recommends simple next follow-up dates for staff', () => {
    const recommendations = buildCarePlanFollowUpRecommendations('post_funeral', now)

    expect(recommendations.map((recommendation) => recommendation.date)).toEqual([
      '2026-06-26',
      '2026-07-19',
      '2026-11-03',
    ])
  })
})
