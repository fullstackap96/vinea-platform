import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { validateSacramentalRecordCreateRelationships } from '@/lib/server/sacramentalRecordCreateRelationships'

type RowResult = { data: Record<string, unknown> | null; error: Error | null }

function createAdminClient(results: Record<string, RowResult>) {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = []

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
      maybeSingle: vi.fn(() => Promise.resolve(results[table] ?? { data: null, error: null })),
    }
    return builder
  }

  return {
    admin: { from: vi.fn((table: string) => builderFor(table)) },
    calls,
  }
}

describe('validateSacramentalRecordCreateRelationships', () => {
  it('accepts same-parish request and person links when no record is already linked', async () => {
    const { admin, calls } = createAdminClient({
      requests: { data: { id: 'request-1', parishioner_id: 'parishioner-1' }, error: null },
      parishioners: { data: { parish_id: 'parish-2' }, error: null },
      sacramental_records: { data: null, error: null },
      people: { data: { id: 'person-1' }, error: null },
    })

    const result = await validateSacramentalRecordCreateRelationships(admin as never, {
      parishId: 'parish-2',
      requestId: 'request-1',
      personId: 'person-1',
    })

    expect(result).toEqual({ ok: true })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'requests', method: 'eq', args: ['id', 'request-1'] },
        { table: 'parishioners', method: 'eq', args: ['id', 'parishioner-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['request_id', 'request-1'] },
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('rejects a request owned by another parish before checking later links', async () => {
    const { admin } = createAdminClient({
      requests: { data: { id: 'request-1', parishioner_id: 'parishioner-1' }, error: null },
      parishioners: { data: { parish_id: 'parish-other' }, error: null },
    })

    const result = await validateSacramentalRecordCreateRelationships(admin as never, {
      parishId: 'parish-2',
      requestId: 'request-1',
      personId: 'person-1',
    })

    expect(result).toEqual({ ok: false, reason: 'request_not_found' })
    expect(admin.from).not.toHaveBeenCalledWith('people')
    expect(admin.from).not.toHaveBeenCalledWith('sacramental_records')
  })

  it('rejects a request that already produced a sacramental record', async () => {
    const { admin } = createAdminClient({
      requests: { data: { id: 'request-1', parishioner_id: 'parishioner-1' }, error: null },
      parishioners: { data: { parish_id: 'parish-2' }, error: null },
      sacramental_records: { data: { id: 'record-existing' }, error: null },
    })

    const result = await validateSacramentalRecordCreateRelationships(admin as never, {
      parishId: 'parish-2',
      requestId: 'request-1',
      personId: null,
    })

    expect(result).toEqual({ ok: false, reason: 'request_already_linked' })
  })

  it('rejects a person outside the selected parish', async () => {
    const { admin, calls } = createAdminClient({
      people: { data: null, error: null },
    })

    const result = await validateSacramentalRecordCreateRelationships(admin as never, {
      parishId: 'parish-2',
      requestId: null,
      personId: 'person-other',
    })

    expect(result).toEqual({ ok: false, reason: 'person_not_found' })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['id', 'person-other'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })
})
