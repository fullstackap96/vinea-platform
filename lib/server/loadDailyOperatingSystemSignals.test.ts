import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: vi.fn() }))

import {
  dailyOperatingSystemSignalLoaderTestInternals,
  loadDailyOperatingSystemSignals,
} from '@/lib/server/loadDailyOperatingSystemSignals'

type QueryCall = { table: string; method: string; args: unknown[] }
type QueryResult = { data: unknown[] | null; error: unknown }

function createClient(results: Record<string, QueryResult>) {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
        return builder
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
        return builder
      }),
      limit: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'limit', args })
        return builder
      }),
      then: (
        resolve: (value: QueryResult) => void,
        reject?: (reason?: unknown) => void,
      ) => Promise.resolve(results[table] ?? { data: [], error: null }).then(resolve, reject),
    }
    return builder
  }

  return {
    client: { from: vi.fn((table: string) => builderFor(table)) },
    calls,
  }
}

const peopleRows = [
  {
    id: 'person-1',
    parish_id: 'parish-a',
    first_name: 'Ana',
    middle_name: null,
    last_name: 'Lopez',
    email: 'ana@example.com',
    phone: '5551112222',
    date_of_birth: '1990-01-01',
  },
  {
    id: 'person-2',
    parish_id: 'parish-a',
    first_name: 'Ana',
    middle_name: null,
    last_name: 'Lopez',
    email: 'ana@example.com',
    phone: '5551112222',
    date_of_birth: '1990-01-01',
  },
]

const recordRows = [
  {
    id: 'record-ready',
    parish_id: 'parish-a',
    request_id: 'request-1',
    record_type: 'baptism',
    person_name: 'Ready Record',
    sacrament_date: '2026-06-01',
    book: 'B',
    page: '1',
    line: '2',
  },
  {
    id: 'record-issued',
    parish_id: 'parish-a',
    request_id: 'request-2',
    record_type: 'baptism',
    person_name: 'Issued Record',
    sacrament_date: '2026-05-01',
    book: 'B',
    page: '2',
    line: '3',
  },
]

describe('loadDailyOperatingSystemSignals', () => {
  beforeEach(() => vi.clearAllMocks())

  it('builds aggregate signals from parish-filtered minimal projections', async () => {
    const { client, calls } = createClient({
      people: { data: peopleRows, error: null },
      households: { data: [], error: null },
      sacramental_records: { data: recordRows, error: null },
      sacramental_record_events: {
        data: [{ sacramental_record_id: 'record-issued', action: 'certificate_generated' }],
        error: null,
      },
    })

    const result = await loadDailyOperatingSystemSignals(client as never, ' parish-a ')

    expect(result.warnings).toEqual([])
    expect(result.signals.duplicateReview?.peopleCandidateCount).toBe(1)
    expect(result.signals.certificateReady.map((item) => item.id)).toEqual(['record-ready'])
    expect(result.signals.healthSignals).toMatchObject({
      duplicateCandidateCount: 1,
      certificateReadyCount: 1,
      linkedSacramentalRecordCount: 2,
      certificateActivityCount: 1,
    })

    for (const table of [
      'people',
      'households',
      'sacramental_records',
      'sacramental_record_events',
    ]) {
      expect(calls).toContainEqual({
        table,
        method: 'eq',
        args: ['parish_id', 'parish-a'],
      })
    }

    const selects = calls.filter((call) => call.method === 'select')
    expect(selects).toContainEqual({
      table: 'people',
      method: 'select',
      args: [dailyOperatingSystemSignalLoaderTestInternals.PEOPLE_SIGNAL_FIELDS],
    })
    expect(selects).toContainEqual({
      table: 'households',
      method: 'select',
      args: [dailyOperatingSystemSignalLoaderTestInternals.HOUSEHOLD_SIGNAL_FIELDS],
    })
    expect(selects).toContainEqual({
      table: 'sacramental_records',
      method: 'select',
      args: [dailyOperatingSystemSignalLoaderTestInternals.RECORD_SIGNAL_FIELDS],
    })

    for (const projection of selects.map((call) => String(call.args[0] ?? ''))) {
      expect(projection).not.toMatch(/\bnotes\b|created_by|updated_by|created_at|updated_at/)
    }
  })

  it('suppresses certificate-ready output when certificate history cannot be verified', async () => {
    const { client } = createClient({
      people: { data: [], error: null },
      households: { data: [], error: null },
      sacramental_records: { data: recordRows, error: null },
      sacramental_record_events: { data: null, error: { message: 'unavailable' } },
    })

    const result = await loadDailyOperatingSystemSignals(client as never, 'parish-a')

    expect(result.signals.certificateReady).toEqual([])
    expect(result.signals.healthSignals.certificateReadyCount).toBe(0)
    expect(result.warnings).toContain('Certificate event signals are temporarily unavailable.')
  })

  it('returns empty signals without querying when parish context is blank', async () => {
    const { client } = createClient({})

    const result = await loadDailyOperatingSystemSignals(client as never, '   ')

    expect(client.from).not.toHaveBeenCalled()
    expect(result.signals.healthSignals.duplicateCandidateCount).toBe(0)
    expect(result.warnings).toEqual(['Selected parish context is unavailable.'])
  })
})
