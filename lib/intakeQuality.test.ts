import { describe, expect, it } from 'vitest'
import { evaluateIntakeQuality } from '@/lib/intakeQuality'

const now = new Date(2026, 5, 18, 12, 0, 0, 0)

describe('evaluateIntakeQuality', () => {
  it('flags funeral details staff should confirm', () => {
    const result = evaluateIntakeQuality(
      {
        request_type: 'funeral',
        notes: 'call me',
        parishioner: { full_name: 'Maria Santos', email: '', phone: '' },
        funeral_detail: {
          deceased_name: 'Jose Santos',
          funeral_home_or_location: '',
          funeral_director_contact: '',
        },
      },
      { now }
    )

    expect(result.status).toBe('needs_confirmation')
    expect(result.headline).toContain('details to confirm')
    expect(result.issues.map((issue) => issue.key)).toContain('contact-method')
    expect(result.issues.map((issue) => issue.key)).toContain('funeral-home')
    expect(result.issues.map((issue) => issue.key)).toContain('vague-notes')
  })

  it('flags a wedding proposed date in the past', () => {
    const result = evaluateIntakeQuality(
      {
        request_type: 'wedding',
        parishioner: { full_name: 'Anna Lee', email: 'anna@example.com', phone: '555-0101' },
        wedding_detail: {
          partner_one_name: 'Anna Lee',
          partner_two_name: '',
          proposed_wedding_date: '2026-06-01',
        },
      },
      { now }
    )

    expect(result.issues.map((issue) => issue.key)).toContain('past-wedding-date')
    expect(result.issues.map((issue) => issue.key)).toContain('partner-two')
  })

  it('flags missing OCIA background fields', () => {
    const result = evaluateIntakeQuality(
      {
        request_type: 'ocia',
        parishioner: { full_name: 'Sam Rivera', email: 'sam@example.com' },
        ocia_detail: {
          sacramental_background: '',
          seeking: '',
          availability: '',
        },
      },
      { now }
    )

    expect(result.issues.map((issue) => issue.key)).toEqual([
      'phone',
      'ocia-age',
      'ocia-sacramental-background',
      'ocia-seeking',
    ])
  })

  it('returns a calm complete state when no obvious gaps are present', () => {
    const result = evaluateIntakeQuality(
      {
        request_type: 'baptism',
        child_name: 'Lucia',
        preferred_dates: 'Any Sunday in July',
        parishioner: { full_name: 'Ana Cruz', email: 'ana@example.com', phone: '555-0101' },
      },
      { now }
    )

    expect(result.status).toBe('complete')
    expect(result.issues).toEqual([])
    expect(result.headline).toContain('looks complete')
  })
})
