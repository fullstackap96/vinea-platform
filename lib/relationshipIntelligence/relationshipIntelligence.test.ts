import { describe, expect, it } from 'vitest'
import { buildDashboardSuggestedActions } from './buildDashboardSuggestedActions'
import { matchPeopleForRequest } from './matchPeopleForRequest'
import { normalizeEmail, normalizePhone } from './normalizeContact'
import { prefillRecordFormFromRequest } from './prefillRecordFromRequest'
import { suggestRecordForRequest } from './suggestRecordForRequest'
import {
  recordDetailHrefForSuggestedAction,
  recordPrefillHrefForRequest,
  requestDetailHrefForSuggestedAction,
  suggestedActionHref,
} from './suggestedActionPresentation'
import type { ParishionerContact, PersonCandidate } from './types'

const people: PersonCandidate[] = [
  {
    id: 'p1',
    parishioner_id: 'par1',
    first_name: 'Margaret',
    middle_name: null,
    last_name: "O'Brien",
    email: 'margaret@example.com',
    phone: '5550102001',
  },
  {
    id: 'p2',
    parishioner_id: null,
    first_name: 'James',
    middle_name: null,
    last_name: 'Martinez',
    email: 'james@example.com',
    phone: '5550102002',
  },
]

const parishioner: ParishionerContact = {
  id: 'par1',
  full_name: "Margaret O'Brien",
  email: 'margaret@example.com',
  phone: '555-010-2001',
}

describe('normalizeContact', () => {
  it('normalizes email and phone', () => {
    expect(normalizeEmail('  Test@Example.COM ')).toBe('test@example.com')
    expect(normalizePhone('(555) 010-2001')).toBe('5550102001')
  })
})

describe('matchPeopleForRequest', () => {
  it('returns certain match by parishioner_id', () => {
    const matches = matchPeopleForRequest({
      requestId: 'req1',
      requestPersonId: null,
      parishioner,
      people,
    })
    expect(matches).toHaveLength(1)
    expect(matches[0].personId).toBe('p1')
    expect(matches[0].confidence).toBe('certain')
  })

  it('returns empty when request already has person_id', () => {
    const matches = matchPeopleForRequest({
      requestId: 'req1',
      requestPersonId: 'p1',
      parishioner,
      people,
    })
    expect(matches).toHaveLength(0)
  })

  it('matches email when parishioner_id differs', () => {
    const matches = matchPeopleForRequest({
      requestId: 'req1',
      requestPersonId: null,
      parishioner: { ...parishioner, id: 'par-other' },
      people,
    })
    expect(matches.some((m) => m.confidence === 'high')).toBe(true)
  })
})

describe('suggestRecordForRequest', () => {
  it('suggests record for complete baptism without record', () => {
    const suggestion = suggestRecordForRequest({
      requestId: 'req1',
      status: 'complete',
      request_type: 'baptism',
      requestIdsWithRecords: new Set(),
    })
    expect(suggestion?.recordType).toBe('baptism')
  })

  it('skips when record exists', () => {
    const suggestion = suggestRecordForRequest({
      requestId: 'req1',
      status: 'complete',
      request_type: 'baptism',
      requestIdsWithRecords: new Set(['req1']),
    })
    expect(suggestion).toBeNull()
  })
})

describe('prefillRecordFormFromRequest', () => {
  it('prefills baptism register name from child', () => {
    const values = prefillRecordFormFromRequest({
      id: 'req1',
      request_type: 'baptism',
      status: 'complete',
      child_name: 'Lucia Smith',
      confirmed_baptism_date: '2026-06-15T14:00:00.000Z',
      parishioner: { full_name: 'Parent Name' },
    })
    expect(values?.recordType).toBe('baptism')
    expect(values?.personName).toBe('Lucia Smith')
    expect(values?.sacramentDate).toBe('2026-06-15')
  })
})

describe('buildDashboardSuggestedActions', () => {
  it('caps suggestions', () => {
    const requests = Array.from({ length: 20 }, (_, i) => ({
      id: `req-${i}`,
      status: 'complete',
      request_type: 'baptism',
      parishioner_id: `par-${i}`,
    }))
    const parishioners = new Map(
      requests.map((r) => [
        String(r.parishioner_id),
        {
          id: String(r.parishioner_id),
          full_name: 'Test Person',
          email: `user${r.id}@example.com`,
          phone: null,
        },
      ])
    )
    const actions = buildDashboardSuggestedActions({
      requests,
      parishionersById: parishioners,
      people: [],
      householdNamesByPersonId: new Map(),
      requestIdsWithRecords: new Set(),
      records: [],
      recordIdsWithCertificate: new Set(),
    })
    expect(actions.length).toBeLessThanOrEqual(8)
  })
})

describe('suggestedActionHref', () => {
  it('builds safe record prefill links from request ids', () => {
    expect(recordPrefillHrefForRequest('req/unsafe?next=https://example.test')).toBe(
      '/dashboard/records/new?requestId=req%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(recordPrefillHrefForRequest('   ')).toBe('/dashboard/records')
    expect(recordPrefillHrefForRequest(null)).toBe('/dashboard/records')
  })

  it('builds safe suggested action detail links with list fallbacks for blank ids', () => {
    expect(recordDetailHrefForSuggestedAction('record/unsafe?next=https://example.test')).toBe(
      '/dashboard/records/record%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(recordDetailHrefForSuggestedAction('   ')).toBe('/dashboard/records')
    expect(recordDetailHrefForSuggestedAction(null)).toBe('/dashboard/records')

    expect(requestDetailHrefForSuggestedAction('req/unsafe?next=https://example.test')).toBe(
      '/dashboard/requests/req%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test'
    )
    expect(requestDetailHrefForSuggestedAction('   ')).toBe('/dashboard/requests')
    expect(requestDetailHrefForSuggestedAction(null)).toBe('/dashboard/requests')
  })

  it('keeps suggested action links dashboard-internal and encoded', () => {
    expect(
      suggestedActionHref({
        kind: 'record_creation',
        requestId: 'req/unsafe?next=https://example.test',
        requestType: 'baptism',
        recordType: 'baptism',
        label: 'Baptism request - create register entry',
      })
    ).toBe('/dashboard/records/new?requestId=req%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test')

    expect(
      suggestedActionHref({
        kind: 'certificate',
        recordId: 'record/unsafe?next=https://example.test',
        personName: 'Lucia Smith',
        label: 'Prepare baptism certificate',
      })
    ).toBe('/dashboard/records/record%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test')

    expect(
      suggestedActionHref({
        kind: 'person_match',
        personId: 'person-1',
        personDisplayName: 'Maria Smith',
        confidence: 'high',
        reason: 'exact email match',
        requestId: 'req/unsafe?next=https://example.test',
        householdNames: [],
      })
    ).toBe('/dashboard/requests/req%2Funsafe%3Fnext%3Dhttps%3A%2F%2Fexample.test')
  })
})
