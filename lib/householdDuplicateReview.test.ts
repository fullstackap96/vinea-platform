import { describe, expect, it } from 'vitest'
import {
  combineHouseholdNotes,
  findHouseholdDuplicateCandidates,
  scoreHouseholdDuplicatePair,
} from '@/lib/householdDuplicateReview'
import type { HouseholdRow } from '@/lib/types/households'

function household(overrides: Partial<HouseholdRow>): HouseholdRow {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    parish_id: 'parish-1',
    name: 'Santos Household',
    address: null,
    city: null,
    state: null,
    postal_code: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('householdDuplicateReview', () => {
  it('scores matching household names and addresses as high confidence', () => {
    const result = scoreHouseholdDuplicatePair(
      household({ id: 'a', address: '123 Main St', city: 'Kansas City', postal_code: '64108' }),
      household({ id: 'b', name: 'Santos Family', address: '123 Main St.', city: 'Kansas City', postal_code: '64108' })
    )

    expect(result.score).toBe(100)
    expect(result.reasons).toContain('Same street address')
    expect(result.reasons).toContain('Same city')
    expect(result.reasons).toContain('Same postal code')
  })

  it('finds likely household duplicate candidates', () => {
    const candidates = findHouseholdDuplicateCandidates([
      household({ id: 'a', address: '123 Main St', postal_code: '64108' }),
      household({ id: 'b', address: '123 Main St.', postal_code: '64108' }),
      household({ id: 'c', name: 'Nguyen Household', address: '999 Oak Ave' }),
    ])

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      confidence: 'high',
      households: [{ id: 'a' }, { id: 'b' }],
    })
  })

  it('combines distinct household notes safely', () => {
    expect(combineHouseholdNotes('Prefers paper mail', 'Imported from Realm')).toBe(
      'Prefers paper mail\n\nMerged household note:\nImported from Realm'
    )
    expect(combineHouseholdNotes(null, 'Imported from Realm')).toBe('Imported from Realm')
  })
})
