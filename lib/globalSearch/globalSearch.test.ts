import { describe, expect, it } from 'vitest'
import { formatGlobalSearchGroupedResults, formatGlobalSearchResponse } from './formatGlobalSearchResults'
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

  it('encodes result ids and falls back to safe dashboard queues when ids are blank', () => {
    const results = formatGlobalSearchGroupedResults({
      requests: [
        {
          id: 'request with/slash?query',
          request_type: 'funeral',
          status: 'new',
          child_name: null,
          created_at: '2026-06-01T10:00:00.000Z',
          parishioner: { full_name: 'Maria Santos', email: null },
        },
      ],
      people: [
        {
          id: 'person with/slash?query',
          first_name: 'Maria',
          middle_name: null,
          last_name: 'Santos',
          email: null,
          phone: null,
          primaryHouseholdName: null,
        },
      ],
      households: [
        {
          id: '   ',
          name: 'Santos Household',
          address: null,
          city: null,
          state: null,
          postal_code: null,
          memberCount: 2,
        },
      ],
      records: [
        {
          id: 'record with/slash?query',
          record_type: 'baptism',
          person_name: 'Lucia Santos',
          sacrament_date: null,
        },
      ],
    })

    expect(results.requests[0]?.href).toBe(
      '/dashboard/requests/request%20with%2Fslash%3Fquery'
    )
    expect(results.people[0]?.href).toBe('/dashboard/people/person%20with%2Fslash%3Fquery')
    expect(results.households[0]?.href).toBe('/dashboard/households')
    expect(results.records[0]?.href).toBe('/dashboard/records/record%20with%2Fslash%3Fquery')
  })

  it('preserves partial-results warnings separately from blocking errors', () => {
    const formatted = formatGlobalSearchResponse({
      query: 'maria',
      sanitizedQuery: 'maria',
      raw: { requests: [], people: [], households: [], records: [] },
      errorMessage: '',
      warningMessage:
        'Some search results may be missing. Please try again if you do not see what you expected.',
      totalCount: 0,
    })

    expect(formatted.errorMessage).toBe('')
    expect(formatted.warningMessage).toBe(
      'Some search results may be missing. Please try again if you do not see what you expected.'
    )
  })
})
