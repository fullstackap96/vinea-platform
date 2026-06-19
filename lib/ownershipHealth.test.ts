import { describe, expect, it } from 'vitest'
import { buildOwnershipHealth } from '@/lib/ownershipHealth'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('buildOwnershipHealth', () => {
  it('prioritizes urgent unassigned requests', () => {
    const health = buildOwnershipHealth(
      [
        {
          id: 'funeral-1',
          status: 'new',
          request_type: 'funeral',
          created_at: '2026-06-15T12:00:00.000Z',
          next_follow_up_date: '2026-06-15',
          assigned_staff_name: '',
          funeral_detail: { deceased_name: 'Jose Santos' },
        },
      ],
      { now }
    )

    expect(health.unassignedUrgent).toBe(1)
    expect(health.headline).toContain('urgent request')
    expect(health.actions[0]).toMatchObject({
      key: 'unassigned-urgent',
      tone: 'urgent',
      actionLabel: 'Assign owner',
    })
  })

  it('surfaces overloaded owners', () => {
    const requests = Array.from({ length: 5 }, (_, index) => ({
      id: `baptism-${index}`,
      status: 'in_progress',
      request_type: 'baptism',
      created_at: '2026-06-01T12:00:00.000Z',
      last_contacted_at: '2026-06-01T12:00:00.000Z',
      next_follow_up_date: index < 3 ? '2026-06-18' : '2026-06-25',
      assigned_staff_name: 'Jane',
      confirmed_baptism_date: '2026-07-01T10:00:00.000Z',
    }))

    const health = buildOwnershipHealth(requests, { now })

    expect(health.overloadedOwners).toBe(1)
    expect(health.headline).toContain('owner')
    expect(health.actions.some((action) => action.key === 'owner-Jane')).toBe(true)
  })

  it('returns a balanced state when ownership is clear', () => {
    const health = buildOwnershipHealth(
      [
        {
          id: 'wedding-1',
          status: 'in_progress',
          request_type: 'wedding',
          created_at: '2026-06-18T12:00:00.000Z',
          last_contacted_at: '2026-06-18T13:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          assigned_staff_name: 'Anna',
          wedding_detail: {
            partner_one_name: 'Ava',
            partner_two_name: 'Ben',
            confirmed_ceremony_at: '2026-09-01T18:00:00.000Z',
          },
        },
      ],
      { now }
    )

    expect(health.headline).toBe('Ownership looks balanced')
    expect(health.actions).toEqual([])
  })
})
