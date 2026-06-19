import { describe, expect, it } from 'vitest'
import { buildParishCommunicationCenter } from '@/lib/parishCommunicationCenter'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('buildParishCommunicationCenter', () => {
  it('prioritizes overdue follow-ups', () => {
    const rows = buildParishCommunicationCenter({
      now,
      requests: [
        {
          id: 'request-1',
          status: 'in_progress',
          request_type: 'funeral',
          next_follow_up_date: '2026-06-18',
          last_contacted_at: '2026-06-10T12:00:00.000Z',
          parishioner: { full_name: 'Garcia Family', email: 'garcia@example.com' },
          funeral_detail: { deceased_name: 'Jose Garcia' },
        },
      ],
    })

    expect(rows[0]).toMatchObject({
      priority: 'urgent',
      recommendedAction: 'Follow up with the family today.',
    })
    expect(rows[0]?.filters).toContain('overdue_follow_up')
  })

  it('flags requests with no first contact', () => {
    const rows = buildParishCommunicationCenter({
      now,
      requests: [
        {
          id: 'request-2',
          status: 'new',
          request_type: 'ocia',
          parishioner: { full_name: 'Lucas Cruz', phone: '555-1000' },
        },
      ],
    })

    expect(rows[0]).toMatchObject({
      priority: 'urgent',
      reason: 'No first contact has been logged yet.',
    })
    expect(rows[0]?.filters).toContain('no_first_contact')
  })

  it('includes recent communication context', () => {
    const rows = buildParishCommunicationCenter({
      now,
      requests: [
        {
          id: 'request-3',
          status: 'in_progress',
          request_type: 'baptism',
          child_name: 'Sofia',
          last_contacted_at: '2026-06-18T12:00:00.000Z',
          parishioner: { full_name: 'Ana Lopez' },
        },
      ],
      communications: [
        {
          request_id: 'request-3',
          contacted_at: '2026-06-18T12:00:00.000Z',
          method: 'phone',
          notes: 'Mother confirmed godparent paperwork is coming.',
        },
      ],
    })

    expect(rows[0]?.filters).toContain('recent_contact')
    expect(rows[0]?.latestNote).toBe('Mother confirmed godparent paperwork is coming.')
  })
})
