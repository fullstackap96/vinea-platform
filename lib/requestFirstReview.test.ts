import { describe, expect, it } from 'vitest'
import { buildRequestFirstReview } from '@/lib/requestFirstReview'

describe('buildRequestFirstReview', () => {
  it('summarizes an urgent funeral request in plain English', () => {
    const review = buildRequestFirstReview({
      request: {
        status: 'new',
        request_type: 'funeral',
        created_at: '2026-06-10T12:00:00.000Z',
        parishioner: { full_name: 'Maria Santos' },
      },
      scheduleRow: {
        request_type: 'funeral',
        funeral_detail: { confirmed_service_at: null },
      },
      checklistItems: [{ item_name: 'Coordinate with funeral home' }],
      checklistIncomplete: true,
      hasRecipientEmail: true,
      careCadence: {
        request: {},
        requestId: 'r1',
        requestType: 'funeral',
        personLabel: 'Jose Santos',
        level: 'urgent',
        label: 'Funeral family needs first contact',
        reason: 'No family contact has been logged within the 1-day care window.',
        recommendedAction: 'Log the first call.',
        suggestedFollowUpDate: '2026-06-19',
        suggestedFollowUpLabel: 'Jun 19, 2026',
        detailHref: '/dashboard/requests/r1#communication',
        sortScore: 0,
        daysSinceCreated: 2,
        daysSinceContact: null,
        waitingDays: null,
      },
      funeralDetail: { deceased_name: 'Jose Santos' },
    })

    expect(review.whatThisIs).toBe('Funeral request for Jose Santos from Maria Santos.')
    expect(review.whyNow).toContain('No family contact')
    expect(review.doFirst).toContain('Assign')
    expect(review.tone).toBe('urgent')
    expect(review.missingDetails).toContain('Staff assigned')
    expect(review.missingDetails.length).toBeLessThanOrEqual(4)
  })

  it('summarizes a steady owned request without making it noisy', () => {
    const review = buildRequestFirstReview({
      request: {
        status: 'in_progress',
        request_type: 'baptism',
        child_name: 'Lucia',
        assigned_staff_name: 'Jane',
        last_contacted_at: '2026-06-18T12:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        parishioner: { full_name: 'Ana Cruz' },
      },
      scheduleRow: {
        request_type: 'baptism',
        confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
      },
      checklistItems: [
        { item_name: 'Contact family and confirm baptism preparation steps' },
        { item_name: 'Collect child birth certificate' },
      ],
      checklistIncomplete: true,
      hasRecipientEmail: true,
    })

    expect(review.whatThisIs).toBe('Baptism request for Lucia from Ana Cruz.')
    expect(review.tone).toBe('steady')
    expect(review.actionHref).toMatch(/^#/)
    expect(review.missingDetails.length).toBeGreaterThan(0)
  })
})
