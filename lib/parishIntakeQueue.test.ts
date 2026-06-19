import { describe, expect, it } from 'vitest'
import { buildParishIntakeQueue } from '@/lib/parishIntakeQueue'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('buildParishIntakeQueue', () => {
  it('prioritizes urgent funeral intake that has not been contacted', () => {
    const items = buildParishIntakeQueue({
      now,
      requests: [
        {
          id: 'funeral-1',
          request_type: 'funeral',
          status: 'new',
          created_at: '2026-06-17T12:00:00.000Z',
          parishioner: { full_name: 'Maria Garcia', phone: '555-1000' },
          funeral_detail: {
            deceased_name: 'Jose Garcia',
            funeral_home_or_location: 'Smith Funeral Home',
          },
        },
      ],
    })

    expect(items[0]).toMatchObject({
      id: 'request-funeral-1',
      priority: 'urgent',
      label: 'Urgent contact',
      recommendedAction: 'Contact the family first',
    })
  })

  it('marks unassigned requests as needing an owner', () => {
    const items = buildParishIntakeQueue({
      now,
      requests: [
        {
          id: 'baptism-1',
          request_type: 'baptism',
          status: 'new',
          child_name: 'Sofia',
          preferred_dates: 'July',
          created_at: '2026-06-19T12:00:00.000Z',
          parishioner: { full_name: 'Ana Lopez', email: 'ana@example.com', phone: '555-2000' },
          last_contacted_at: '2026-06-19T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
        },
      ],
    })

    expect(items[0]?.filters).toContain('needs_owner')
    expect(items[0]?.label).toBe('Needs owner')
  })

  it('includes Mass intentions that need scheduling', () => {
    const items = buildParishIntakeQueue({
      now,
      intentions: [
        {
          id: 'intention-1',
          parish_id: 'parish-1',
          requester_name: 'Carlos Ruiz',
          intention_text: 'For healing',
          requested_date: '2026-06-20',
          assigned_mass_date: null,
          assigned_priest_name: null,
          stipend_received: false,
          is_fulfilled: false,
          notes: null,
          created_at: '2026-06-19T10:00:00.000Z',
          updated_at: '2026-06-19T10:00:00.000Z',
        },
      ],
    })

    expect(items[0]).toMatchObject({
      kind: 'mass_intention',
      label: 'Ready to schedule',
      recommendedAction: 'Assign a Mass date',
    })
    expect(items[0]?.filters).toContain('ready_to_schedule')
  })

  it('omits requests that have minimum intake triage complete', () => {
    const items = buildParishIntakeQueue({
      now,
      requests: [
        {
          id: 'ready-1',
          request_type: 'baptism',
          status: 'in_progress',
          child_name: 'Sofia',
          preferred_dates: 'July',
          created_at: '2026-06-19T12:00:00.000Z',
          parishioner: { full_name: 'Ana Lopez', email: 'ana@example.com', phone: '555-2000' },
          assigned_staff_name: 'Maria',
          last_contacted_at: '2026-06-19T12:00:00.000Z',
          next_follow_up_date: '2026-06-25',
          person_id: 'person-1',
        },
      ],
    })

    expect(items).toEqual([])
  })
})
