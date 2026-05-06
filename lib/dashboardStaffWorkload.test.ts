import { describe, expect, it } from 'vitest'
import { getDashboardCommandSummaryCounts } from './dashboardSummaryCounts'
import {
  buildStaffWorkloadRows,
  type StaffWorkloadRow,
  STAFF_WORKLOAD_UNASSIGNED_LABEL,
} from './dashboardStaffWorkload'

const now = new Date(2026, 5, 20, 12, 0, 0, 0)

describe('buildStaffWorkloadRows', () => {
  it('groups open requests by staff and places Unassigned last', () => {
    const rows = buildStaffWorkloadRows(
      [
        {
          status: 'new',
          assigned_staff_name: 'Alice',
          next_follow_up_date: '2026-08-01',
          created_at: '2026-06-01T12:00:00.000Z',
          last_contacted_at: '2026-06-10T12:00:00.000Z',
          request_type: 'baptism',
          confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
        },
        {
          status: 'new',
          assigned_staff_name: 'Bob',
          next_follow_up_date: '2026-06-01',
          created_at: '2026-06-01T12:00:00.000Z',
          last_contacted_at: '2026-06-10T12:00:00.000Z',
          request_type: 'baptism',
          confirmed_baptism_date: null,
        },
        {
          status: 'new',
          assigned_staff_name: '',
          next_follow_up_date: '2026-08-01',
          created_at: '2026-06-15T12:00:00.000Z',
          last_contacted_at: '2026-06-16T12:00:00.000Z',
          request_type: 'baptism',
          confirmed_baptism_date: null,
        },
      ],
      now
    )
    expect(rows.map((r) => r.staffDisplay)).toEqual(['Alice', 'Bob', STAFF_WORKLOAD_UNASSIGNED_LABEL])
    const bob = rows.find((r) => r.staffDisplay === 'Bob')!
    expect(bob.openRequests).toBe(1)
    expect(bob.overdueFollowUps).toBe(1)
    expect(bob.actionRequired).toBe(1)
    const unassigned = rows.find((r) => r.staffDisplay === STAFF_WORKLOAD_UNASSIGNED_LABEL)!
    expect(unassigned.openRequests).toBe(1)
  })

  it('excludes complete requests', () => {
    const rows = buildStaffWorkloadRows(
      [
        { status: 'complete', assigned_staff_name: 'Alice' },
        { status: 'new', assigned_staff_name: 'Alice', next_follow_up_date: '2026-08-01' },
      ],
      now
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].openRequests).toBe(1)
  })

  it('sums each metric column to the same totals as At a glance summary cards', () => {
    const requests = [
      {
        status: 'new',
        assigned_staff_name: 'Alice',
        next_follow_up_date: '2026-06-01',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
      },
      {
        status: 'new',
        assigned_staff_name: '',
        next_follow_up_date: '2026-08-01',
        request_type: 'baptism',
        confirmed_baptism_date: null,
      },
      {
        status: 'new',
        assigned_staff_name: 'Bob',
        next_follow_up_date: '2026-08-01',
        request_type: 'baptism',
        confirmed_baptism_date: '2026-07-15T14:00:00.000Z',
      },
    ]
    const rows = buildStaffWorkloadRows(requests, now)
    const summary = getDashboardCommandSummaryCounts(requests, now)
    const sum = (
      key: keyof Pick<
        StaffWorkloadRow,
        'openRequests' | 'overdueFollowUps' | 'actionRequired' | 'upcomingScheduled'
      >
    ) => rows.reduce((acc, r) => acc + r[key], 0)

    expect(sum('openRequests')).toBe(3)
    expect(sum('overdueFollowUps')).toBe(summary.overdueFollowUps)
    expect(sum('actionRequired')).toBe(summary.actionRequired)
    expect(sum('upcomingScheduled')).toBe(summary.upcomingScheduled)
  })
})
