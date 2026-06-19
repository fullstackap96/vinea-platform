import { describe, expect, it } from 'vitest'
import { evaluateIntakeTriage } from '@/lib/intakeTriage'

const now = new Date('2026-06-19T12:00:00.000Z')

describe('evaluateIntakeTriage', () => {
  it('prioritizes urgent funeral first contact', () => {
    const result = evaluateIntakeTriage(
      {
        request_type: 'funeral',
        created_at: '2026-06-17T12:00:00.000Z',
        parishioner: { full_name: 'Maria Santos', email: 'maria@example.com', phone: '555-0101' },
        assigned_staff_name: 'Anne',
        funeral_detail: {
          deceased_name: 'Jose Santos',
          funeral_home_or_location: 'Smith Funeral Home',
          preferred_service_notes: 'Morning preferred',
        },
      },
      { now }
    )

    expect(result.status).toBe('urgent_pastoral_contact')
    expect(result.actionSectionId).toBe('communication')
    expect(result.headline).toContain('Funeral family')
  })

  it('surfaces intake details that need review', () => {
    const result = evaluateIntakeTriage(
      {
        request_type: 'ocia',
        created_at: '2026-06-19T09:00:00.000Z',
        parishioner: { full_name: 'Sam Rivera', email: 'sam@example.com' },
        assigned_staff_name: 'OCIA Lead',
        ocia_detail: {
          sacramental_background: '',
          seeking: '',
          availability: '',
        },
      },
      { now }
    )

    expect(result.status).toBe('needs_review')
    expect(result.suggestedAction).toBe('Review intake details')
    expect(result.missingDetails.join(' ')).toContain('sacramental background')
  })

  it('suggests ownership when intake is usable but unassigned', () => {
    const result = evaluateIntakeTriage(
      {
        request_type: 'baptism',
        created_at: '2026-06-19T09:00:00.000Z',
        child_name: 'Lucia',
        preferred_dates: 'July Sundays',
        parishioner: { full_name: 'Ana Cruz', email: 'ana@example.com', phone: '555-0101' },
      },
      { now }
    )

    expect(result.status).toBe('needs_review')
    expect(result.label).toBe('Needs owner')
    expect(result.actionSectionId).toBe('assignment')
  })

  it('returns ready when intake, ownership, contact, and follow-up are set', () => {
    const result = evaluateIntakeTriage(
      {
        request_type: 'wedding',
        created_at: '2026-06-18T09:00:00.000Z',
        assigned_staff_name: 'Wedding Lead',
        last_contacted_at: '2026-06-18T15:00:00.000Z',
        next_follow_up_date: '2026-06-25',
        person_id: 'person-1',
        parishioner: { full_name: 'Anna Lee', email: 'anna@example.com', phone: '555-0101' },
        wedding_detail: {
          partner_one_name: 'Anna Lee',
          partner_two_name: 'Ben Cole',
          proposed_wedding_date: '2026-09-01',
        },
      },
      { now }
    )

    expect(result.status).toBe('ready_to_start')
    expect(result.label).toBe('Ready')
  })
})
