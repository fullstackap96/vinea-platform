import { describe, expect, it } from 'vitest'
import {
  combinePersonNotes,
  findPersonDuplicateCandidates,
  scorePersonDuplicatePair,
} from '@/lib/personDuplicateReview'
import type { PersonRow } from '@/lib/types/people'

function person(overrides: Partial<PersonRow>): PersonRow {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    parish_id: 'parish-1',
    parishioner_id: null,
    first_name: 'Maria',
    middle_name: null,
    last_name: 'Santos',
    email: null,
    phone: null,
    date_of_birth: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('personDuplicateReview', () => {
  it('scores same email and name as high confidence', () => {
    const result = scorePersonDuplicatePair(
      person({ id: 'a', email: 'Maria@example.com' }),
      person({ id: 'b', email: 'maria@example.com' })
    )

    expect(result.score).toBe(100)
    expect(result.reasons).toContain('Same email')
    expect(result.reasons).toContain('Same first and last name')
  })

  it('finds and sorts likely duplicate candidates', () => {
    const candidates = findPersonDuplicateCandidates([
      person({ id: 'a', email: 'maria@example.com' }),
      person({ id: 'b', email: 'maria@example.com' }),
      person({ id: 'c', first_name: 'Joseph', last_name: 'Nguyen' }),
    ])

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      confidence: 'high',
      people: [{ id: 'a' }, { id: 'b' }],
    })
  })

  it('combines distinct notes without losing either value', () => {
    expect(combinePersonNotes('Prefers email', 'Former choir member')).toBe(
      'Prefers email\n\nMerged note:\nFormer choir member'
    )
    expect(combinePersonNotes('', 'Former choir member')).toBe('Former choir member')
  })
})
