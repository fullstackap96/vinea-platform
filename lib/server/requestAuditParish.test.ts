import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { resolveRequestAuditParishId } from '@/lib/server/requestAuditParish'

function createAdminMock(options: {
  requestData?: unknown
  requestError?: { message: string } | null
  parishionerData?: unknown
  parishionerError?: { message: string } | null
}) {
  const tables: string[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() => {
        if (table === 'requests') {
          return Promise.resolve({
            data:
              options.requestData === undefined
                ? { id: 'request-1', parishioner_id: 'parishioner-1' }
                : options.requestData,
            error: options.requestError ?? null,
          })
        }
        if (table === 'parishioners') {
          return Promise.resolve({
            data:
              options.parishionerData === undefined
                ? { parish_id: 'parish-2' }
                : options.parishionerData,
            error: options.parishionerError ?? null,
          })
        }
        throw new Error(`Unexpected table ${table}`)
      }),
    }

    return builder
  }

  const admin = {
    from: vi.fn((table: string) => {
      tables.push(table)
      return builderFor(table)
    }),
  }

  return { admin, tables }
}

describe('resolveRequestAuditParishId', () => {
  it('uses the parish from the request parishioner relationship', async () => {
    const { admin, tables } = createAdminMock({
      requestData: { id: 'request-1', parishioner_id: 'parishioner-9' },
      parishionerData: { parish_id: 'parish-9' },
    })

    const result = await resolveRequestAuditParishId(admin as never, 'request-1')

    expect(result).toEqual({ ok: true, parishId: 'parish-9' })
    expect(tables).toEqual(['requests', 'parishioners'])
    expect(admin.from).not.toHaveBeenCalledWith('parishes')
  })

  it('returns a safe error instead of falling back when the request cannot be found', async () => {
    const { admin, tables } = createAdminMock({
      requestData: null,
    })

    const result = await resolveRequestAuditParishId(admin as never, 'request-missing')

    expect(result).toEqual({
      ok: false,
      error: 'Request not found for audit metadata.',
      technicalDetail: null,
    })
    expect(tables).toEqual(['requests'])
  })

  it('returns a safe error instead of falling back when the parishioner has no parish', async () => {
    const { admin, tables } = createAdminMock({
      requestData: { id: 'request-1', parishioner_id: 'parishioner-1' },
      parishionerData: { parish_id: null },
    })

    const result = await resolveRequestAuditParishId(admin as never, 'request-1')

    expect(result).toEqual({
      ok: false,
      error: 'Intake contact has no parish for audit metadata.',
      technicalDetail: null,
    })
    expect(tables).toEqual(['requests', 'parishioners'])
  })
})
