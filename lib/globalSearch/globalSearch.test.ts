import { describe, expect, it } from 'vitest'
import { formatGlobalSearchGroupedResults } from './formatGlobalSearchResults'
import { sanitizeGlobalSearchQuery, toIlikePattern } from './sanitizeGlobalSearchQuery'

describe('sanitizeGlobalSearchQuery', () => {
  it('requires at least 2 characters', () => {
    expect(sanitizeGlobalSearchQuery('')).toBeNull()
    expect(sanitizeGlobalSearchQuery('a')).toBeNull()
    expect(sanitizeGlobalSearchQuery('ab')).toBe('ab')
  })

  it('strips ilike wildcards', () => {
    expect(sanitizeGlobalSearchQuery('sm%ith_')).toBe('smith')
  })
})

describe('toIlikePattern', () => {
  it('wraps sanitized text', () => {
    expect(toIlikePattern('maria')).toBe('%maria%')
  })
})

describe('formatGlobalSearchGroupedResults', () => {
  it('formats request and person rows in plain language', () => {
    const results = formatGlobalSearchGroupedResults({
      requests: [
        {
          id: 'req-1',
          request_type: 'baptism',
          status: 'new',
          child_name: 'Lucia Smith',
          created_at: '2026-06-01T10:00:00.000Z',
          parishioner: { full_name: 'Maria Smith', email: 'maria@example.com' },
        },
      ],
      people: [
        {
          id: 'person-1',
          first_name: 'Maria',
          middle_name: null,
          last_name: 'Smith',
          email: 'maria@example.com',
          phone: null,
          primaryHouseholdName: 'Smith',
        },
      ],
      households: [],
      records: [],
    })

    expect(results.requests[0]?.title).toBe('Lucia Smith')
    expect(results.requests[0]?.typeLabel).toBe('Baptism request')
    expect(results.requests[0]?.context).toContain('New Request')
    expect(results.requests[0]?.href).toBe('/dashboard/requests/req-1')

    expect(results.people[0]?.title).toBe('Maria Smith')
    expect(results.people[0]?.typeLabel).toBe('Person')
    expect(results.people[0]?.href).toBe('/dashboard/people/person-1')
  })
})
