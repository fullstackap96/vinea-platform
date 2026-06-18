import { describe, expect, it } from 'vitest'
import { buildCareCadenceQueue, evaluateCareCadence } from '@/lib/careCadence'

const now = new Date(2026, 5, 18, 12, 0, 0, 0)

describe('evaluateCareCadence', () => {
  it('treats funeral requests without first contact as urgent within 24 hours', () => {
    const row = evaluateCareCadence(
      {
        id: 'funeral-1',
        status: 'new',
        request_type: 'funeral',
        created_at: '2026-06-16T12:00:00.000Z',
        assigned_staff_name: '',
        parishioner: { full_name: 'Maria Santos' },
        funeral_detail: { deceased_name: 'Jose Santos' },
      },
      { now }
    )

    expect(row?.level).toBe('urgent')
    expect(row?.label).toMatch(/Funeral/)
    expect(row?.reason).toContain('No family contact')
    expect(row?.recommendedAction).toMatch(/Assign|Log/)
    expect(row?.suggestedFollowUpDate).toBe('2026-06-19')
  })

  it('surfaces stale blockers and suggests a near follow-up', () => {
    const row = evaluateCareCadence(
      {
        id: 'wedding-1',
        status: 'in_progress',
        request_type: 'wedding',
        created_at: '2026-06-01T12:00:00.000Z',
        last_contacted_at: '2026-06-16T12:00:00.000Z',
        next_follow_up_date: '2026-06-28',
        waiting_on: 'documents',
        waiting_on_changed_at: '2026-06-08T12:00:00.000Z',
        assigned_staff_name: 'Jane',
        parishioner: { full_name: 'Anna Lee' },
        wedding_detail: { partner_one_name: 'Anna Lee', partner_two_name: 'Mark Cruz' },
      },
      { now }
    )

    expect(row?.level).toBe('high')
    expect(row?.reason).toContain('Waiting on Documents for 10 days')
    expect(row?.suggestedFollowUpDate).toBe('2026-06-23')
  })

  it('ignores completed and non-sacramental requests', () => {
    expect(
      evaluateCareCadence(
        { id: 'complete', status: 'complete', request_type: 'baptism' },
        { now }
      )
    ).toBeNull()
    expect(
      evaluateCareCadence(
        { id: 'join', status: 'new', request_type: 'join_parish' },
        { now }
      )
    ).toBeNull()
  })
})

describe('buildCareCadenceQueue', () => {
  it('ranks urgent care ahead of blocked care', () => {
    const result = buildCareCadenceQueue(
      [
        {
          id: 'blocked',
          status: 'in_progress',
          request_type: 'wedding',
          created_at: '2026-06-01T12:00:00.000Z',
          last_contacted_at: '2026-06-16T12:00:00.000Z',
          next_follow_up_date: '2026-06-28',
          waiting_on: 'documents',
          waiting_on_changed_at: '2026-06-08T12:00:00.000Z',
          assigned_staff_name: 'Jane',
          parishioner: { full_name: 'Anna Lee' },
        },
        {
          id: 'urgent',
          status: 'new',
          request_type: 'funeral',
          created_at: '2026-06-16T12:00:00.000Z',
          assigned_staff_name: '',
          parishioner: { full_name: 'Maria Santos' },
        },
      ],
      { now }
    )

    expect(result.rows.map((row) => row.requestId)).toEqual(['urgent', 'blocked'])
    expect(result.summary.needsCareToday).toBe(2)
    expect(result.summary.missingFirstContact).toBe(1)
  })
})
