import { describe, expect, it } from 'vitest'
import { buildDailyOperatingSystemSignals, emptyDailyOperatingSystemSignals } from '@/lib/dailyOperatingSystemSignals'
import type { HouseholdRow } from '@/lib/types/households'
import type { PersonRow } from '@/lib/types/people'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

const basePerson = {
  parish_id: 'parish-1',
  parishioner_id: null,
  middle_name: null,
  notes: null,
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z',
} satisfies Omit<PersonRow, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'date_of_birth'>

const baseHousehold = {
  parish_id: 'parish-1',
  city: 'Kansas City',
  state: 'MO',
  postal_code: '64101',
  notes: null,
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z',
} satisfies Omit<HouseholdRow, 'id' | 'name' | 'address'>

const baseRecord = {
  parish_id: 'parish-1',
  request_id: null,
  person_id: null,
  place: 'St. Mark',
  minister: 'Fr. Thomas',
  notes: null,
  created_by: null,
  updated_by: null,
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z',
} satisfies Omit<
  SacramentalRecordRow,
  'id' | 'record_type' | 'person_name' | 'sacrament_date' | 'book' | 'page' | 'line'
>

describe('buildDailyOperatingSystemSignals', () => {
  it('builds read-only duplicate, incomplete record, and certificate-ready signals', () => {
    const signals = buildDailyOperatingSystemSignals({
      people: [
        {
          ...basePerson,
          id: 'person-1',
          first_name: 'Ana',
          last_name: 'Lopez',
          email: 'ana@example.com',
          phone: '555-111-2222',
          date_of_birth: '1990-01-01',
        },
        {
          ...basePerson,
          id: 'person-2',
          first_name: 'Ana',
          last_name: 'Lopez',
          email: 'ana@example.com',
          phone: '555-111-2222',
          date_of_birth: '1990-01-01',
        },
      ],
      households: [
        {
          ...baseHousehold,
          id: 'household-1',
          name: 'Lopez Family',
          address: '123 Main St',
        },
        {
          ...baseHousehold,
          id: 'household-2',
          name: 'Lopez Household',
          address: '123 Main St',
        },
      ],
      sacramentalRecords: [
        {
          ...baseRecord,
          id: 'complete-baptism',
          request_id: 'request-linked-baptism',
          record_type: 'baptism',
          person_name: 'Mateo Garcia',
          sacrament_date: '2026-06-01',
          book: 'B',
          page: '12',
          line: '4',
        },
        {
          ...baseRecord,
          id: 'incomplete-baptism',
          record_type: 'baptism',
          person_name: 'Missing Register',
          sacrament_date: null,
          book: null,
          page: null,
          line: null,
        },
        {
          ...baseRecord,
          id: 'already-issued',
          request_id: 'request-issued-baptism',
          record_type: 'baptism',
          person_name: 'Issued Child',
          sacrament_date: '2026-05-01',
          book: 'B',
          page: '11',
          line: '3',
        },
      ],
      sacramentalRecordEvents: [
        { sacramental_record_id: 'already-issued', action: 'certificate_generated' },
      ],
    })

    expect(signals.duplicateReview).toMatchObject({
      peopleCandidateCount: 1,
      householdCandidateCount: 1,
      href: '/dashboard/people/duplicates',
    })
    expect(signals.healthSignals).toEqual({
      duplicateCandidateCount: 2,
      incompleteSacramentalRecordCount: 1,
      certificateReadyCount: 1,
      linkedSacramentalRecordCount: 2,
      unlinkedSacramentalRecordCount: 1,
      certificateActivityCount: 1,
    })
    expect(signals.certificateReady).toEqual([
      expect.objectContaining({
        id: 'complete-baptism',
        label: 'Mateo Garcia',
        href: '/dashboard/records/complete-baptism',
        certificateType: 'Baptism',
      }),
    ])
  })

  it('returns empty safe defaults when no signal rows are present', () => {
    expect(emptyDailyOperatingSystemSignals()).toEqual({
      duplicateReview: null,
      certificateReady: [],
      healthSignals: {
        duplicateCandidateCount: 0,
        incompleteSacramentalRecordCount: 0,
        certificateReadyCount: 0,
        linkedSacramentalRecordCount: 0,
        unlinkedSacramentalRecordCount: 0,
        certificateActivityCount: 0,
      },
    })

    expect(
      buildDailyOperatingSystemSignals({
        people: [],
        households: [],
        sacramentalRecords: [],
        sacramentalRecordEvents: [],
      })
    ).toEqual(emptyDailyOperatingSystemSignals())
  })

  it('keeps signal hrefs dashboard-internal and encoded for staff review queues', () => {
    const signals = buildDailyOperatingSystemSignals({
      people: [],
      households: [
        {
          ...baseHousehold,
          id: 'household-1',
          name: 'Garcia Family',
          address: '123 Main St',
        },
        {
          ...baseHousehold,
          id: 'household-2',
          name: 'Garcia Household',
          address: '123 Main St',
        },
      ],
      sacramentalRecords: [
        {
          ...baseRecord,
          id: 'record with spaces/?and-symbols',
          request_id: 'request-linked-baptism',
          record_type: 'baptism',
          person_name: 'Mateo Garcia',
          sacrament_date: '2026-06-01',
          book: 'B',
          page: '12',
          line: '4',
        },
      ],
      sacramentalRecordEvents: [],
    })

    expect(signals.duplicateReview?.href).toBe('/dashboard/households/duplicates')
    expect(signals.certificateReady[0]?.href).toBe(
      '/dashboard/records/record%20with%20spaces%2F%3Fand-symbols'
    )

    for (const href of [
      signals.duplicateReview?.href,
      ...signals.certificateReady.map((record) => record.href),
    ]) {
      expect(href).toBeTruthy()
      expect(href).toMatch(/^\/dashboard(?:$|[/?#])/)
      expect(href).not.toContain('://')
      expect(href).not.toContain('//')
      expect(href).not.toContain('javascript:')
      expect(href).not.toContain('/api')
    }
  })
})
