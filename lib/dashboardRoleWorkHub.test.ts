import { describe, expect, it } from 'vitest'
import { buildDashboardRoleWorkHub } from '@/lib/dashboardRoleWorkHub'
import { buildStaffCommandCenterRows } from '@/lib/staffCommandCenter'

const now = new Date('2026-06-18T12:00:00.000Z')

describe('buildDashboardRoleWorkHub', () => {
  it('builds role lenses from command-center urgency without changing source order', () => {
    const commandCenter = buildStaffCommandCenterRows(
      [
        {
          id: 'funeral-overdue',
          status: 'in_progress',
          request_type: 'funeral',
          created_at: '2026-06-10T12:00:00.000Z',
          last_contacted_at: '2026-06-11T12:00:00.000Z',
          next_follow_up_date: '2026-06-17',
          assigned_staff_name: 'Maria',
          assigned_priest_name: 'Fr. Thomas',
          parishioner: { full_name: 'Ana Lopez' },
          funeral_detail: { deceased_name: 'Carlos Lopez' },
        },
        {
          id: 'ocia-new',
          status: 'new',
          request_type: 'ocia',
          created_at: '2026-06-16T12:00:00.000Z',
          next_follow_up_date: '2026-06-20',
          parishioner: { full_name: 'Jordan Smith' },
          ocia_detail: {},
        },
        {
          id: 'baptism-docs',
          status: 'in_progress',
          request_type: 'baptism',
          created_at: '2026-06-15T12:00:00.000Z',
          last_contacted_at: '2026-06-17T12:00:00.000Z',
          next_follow_up_date: '2026-06-23',
          waiting_on: 'godparent_paperwork',
          assigned_staff_name: 'Elena',
          child_name: 'Mateo Garcia',
          checklist_incomplete: true,
          checklist_incomplete_count: 2,
        },
      ],
      { now }
    )

    const hub = buildDashboardRoleWorkHub(commandCenter)
    const byId = Object.fromEntries(hub.lenses.map((lens) => [lens.id, lens]))

    expect(hub.defaultLensId).toBe('administrator')
    expect(byId.administrator.totalCount).toBe(3)
    expect(byId.pastor.items.map((item) => item.requestId)).toContain('funeral-overdue')
    expect(byId.receptionist.items.map((item) => item.requestId)).toContain('ocia-new')
    expect(byId.ocia.items.map((item) => item.requestId)).toEqual(['ocia-new'])
    expect(byId.sacramental.items.map((item) => item.requestId)).toContain('baptism-docs')
  })

  it('keeps empty lenses present so the UI can show calm empty states', () => {
    const hub = buildDashboardRoleWorkHub(
      {
        rows: [],
        summary: { actNow: 0, blocked: 0, aging: 0, upcoming: 0 },
      },
      { limitPerLens: 2 }
    )

    expect(hub.defaultLensId).toBe('administrator')
    expect(hub.lenses).toHaveLength(5)
    expect(hub.lenses.every((lens) => lens.totalCount === 0)).toBe(true)
    expect(hub.lenses.every((lens) => lens.items.length === 0)).toBe(true)
  })

  it('limits each lens independently', () => {
    const commandCenter = buildStaffCommandCenterRows(
      [
        {
          id: 'ocia-1',
          status: 'new',
          request_type: 'ocia',
          created_at: '2026-06-16T12:00:00.000Z',
          parishioner: { full_name: 'First Inquirer' },
          ocia_detail: {},
        },
        {
          id: 'ocia-2',
          status: 'new',
          request_type: 'ocia',
          created_at: '2026-06-15T12:00:00.000Z',
          parishioner: { full_name: 'Second Inquirer' },
          ocia_detail: {},
        },
      ],
      { now }
    )

    const hub = buildDashboardRoleWorkHub(commandCenter, { limitPerLens: 1 })
    const ocia = hub.lenses.find((lens) => lens.id === 'ocia')

    expect(ocia?.totalCount).toBe(2)
    expect(ocia?.items).toHaveLength(1)
  })
})
