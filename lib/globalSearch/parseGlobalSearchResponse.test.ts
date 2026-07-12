import { describe, expect, it } from 'vitest'
import { parseGlobalSearchResponse } from './parseGlobalSearchResponse'

function response(overrides: Record<string, unknown> = {}) {
  return {
    query: 'smith',
    totalCount: 1,
    errorMessage: '',
    warningMessage: '',
    results: {
      requests: [
        {
          title: 'Smith family',
          typeLabel: 'Baptism request',
          context: 'New request',
          href: '/dashboard/requests/request-a',
        },
      ],
      people: [],
      households: [],
      records: [],
    },
    ...overrides,
  }
}

describe('parseGlobalSearchResponse', () => {
  it('returns only the safe grouped response fields', () => {
    expect(parseGlobalSearchResponse(response())).toEqual(response())
  })

  it('rejects missing groups and malformed item fields', () => {
    expect(parseGlobalSearchResponse(null)).toBeNull()
    expect(parseGlobalSearchResponse(response({ results: { requests: [] } }))).toBeNull()
    expect(
      parseGlobalSearchResponse(
        response({
          results: {
            requests: [{ title: 'Unsafe', typeLabel: 'Request', context: 'Context' }],
            people: [],
            households: [],
            records: [],
          },
        }),
      ),
    ).toBeNull()
  })

  it('rejects external, traversal, and sensitive dashboard links', () => {
    for (const href of [
      'https://attacker.test',
      '/dashboard/../admin',
      '/dashboard/requests?token=secret-value',
    ]) {
      const unsafe = response()
      ;(unsafe.results.requests[0] as { href: string }).href = href
      expect(parseGlobalSearchResponse(unsafe)).toBeNull()
    }
  })

  it('rejects invalid counts or warning/error shapes', () => {
    expect(parseGlobalSearchResponse(response({ totalCount: -1 }))).toBeNull()
    expect(parseGlobalSearchResponse(response({ totalCount: 1.5 }))).toBeNull()
    expect(parseGlobalSearchResponse(response({ warningMessage: null }))).toBeNull()
    expect(parseGlobalSearchResponse(response({ errorMessage: [] }))).toBeNull()
  })
})
