import { describe, expect, it } from 'vitest'
import { buildStaffCommandCenterRows } from '@/lib/staffCommandCenter'

const now = new Date('2026-06-18T12:00:00.000Z')

describe('buildStaffCommandCenterRows', () => {
  it('puts urgent overdue work first and excludes completed requests', () => {
    const result = buildStaffCommandCenterRows(
      [
        {
          id: 'steady',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-15T12:00:00.000Z',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          assigned_staff_name: 'Jane',
          confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
        },
        {
          id: 'late',
          status: 'in_progress',
          request_type: 'funeral',
          created_at: '2026-06-10T12:00:00.000Z',
          last_contacted_at: '2026-06-12T12:00:00.000Z',
          next_follow_up_date: '2026-06-10',
          assigned_staff_name: 'Maria',
          funeral_detail: { confirmed_service_at: '2026-06-21T15:00:00.000Z' },
        },
        {
          id: 'done',
          status: 'complete',
          request_type: 'wedding',
          created_at: '2026-06-01T12:00:00.000Z',
          next_follow_up_date: '2026-06-01',
        },
      ],
      { now }
    )

    expect(result.rows.map((r) => r.requestId)).toEqual(['late', 'steady'])
    expect(result.rows[0].bucket).toBe('act_now')
    expect(result.summary.actNow).toBe(1)
  })

  it('surfaces blocked and aging requests as separate buckets', () => {
    const result = buildStaffCommandCenterRows(
      [
        {
          id: 'blocked',
          status: 'in_progress',
          request_type: 'wedding',
          created_at: '2026-06-16T12:00:00.000Z',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          waiting_on: 'documents',
          assigned_staff_name: 'Jane',
          wedding_detail: { confirmed_ceremony_at: '2026-08-01T17:00:00.000Z' },
        },
        {
          id: 'aging',
          status: 'in_progress',
          request_type: 'ocia',
          created_at: '2026-06-01T12:00:00.000Z',
          last_contacted_at: '2026-06-08T11:00:00.000Z',
          next_follow_up_date: '2026-06-30',
          assigned_staff_name: 'Sam',
          ocia_detail: { confirmed_session_at: '2026-07-03T19:00:00.000Z' },
        },
      ],
      { now }
    )

    const byId = Object.fromEntries(result.rows.map((r) => [r.requestId, r]))
    expect(byId.blocked.bucket).toBe('blocked')
    expect(byId.blocked.blockerLabel).toBe('Documents')
    expect(byId.aging.bucket).toBe('aging')
    expect(byId.aging.daysSinceContact).toBe(10)
    expect(result.summary.blocked).toBe(1)
    expect(result.summary.aging).toBe(1)
  })
})
