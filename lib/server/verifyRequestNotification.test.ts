import { describe, expect, it, vi } from 'vitest'

const createSupabaseServiceRoleClientMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

vi.mock('server-only', () => ({}))

import { verifyRequestNotificationPayload } from '@/lib/server/verifyRequestNotification'

function queryBuilder(result: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  }
  return builder
}

describe('verifyRequestNotificationPayload', () => {
  it('returns the linked parish id after validating the request contact', async () => {
    const requestBuilder = queryBuilder({
      data: {
        id: 'request-1',
        request_type: 'baptism',
        parishioner_id: 'person-1',
      },
      error: null,
    })
    const parishionerBuilder = queryBuilder({
      data: {
        full_name: 'Safe Contact',
        email: 'safe@example.test',
        phone: '(555) 010-0001',
        parish_id: 'parish-b',
      },
      error: null,
    })
    const admin = {
      from: vi.fn((table: string) => {
        if (table === 'requests') return requestBuilder
        if (table === 'parishioners') return parishionerBuilder
        throw new Error(`Unexpected table ${table}`)
      }),
    }
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin)

    const result = await verifyRequestNotificationPayload({
      requestId: 'request-1',
      requestType: 'baptism',
      contactName: 'Safe Contact',
      contactEmail: 'safe@example.test',
      contactPhone: '5550100001',
    })

    expect(result).toEqual({ ok: true, parishId: 'parish-b' })
    expect(requestBuilder.select).toHaveBeenCalledWith('id, request_type, parishioner_id')
    expect(parishionerBuilder.select).toHaveBeenCalledWith('full_name, email, phone, parish_id')
  })

  it('fails closed when the linked contact has no parish id', async () => {
    const requestBuilder = queryBuilder({
      data: {
        id: 'request-1',
        request_type: 'baptism',
        parishioner_id: 'person-1',
      },
      error: null,
    })
    const parishionerBuilder = queryBuilder({
      data: {
        full_name: 'Safe Contact',
        email: 'safe@example.test',
        phone: '(555) 010-0001',
        parish_id: '',
      },
      error: null,
    })
    const admin = {
      from: vi.fn((table: string) => {
        if (table === 'requests') return requestBuilder
        if (table === 'parishioners') return parishionerBuilder
        throw new Error(`Unexpected table ${table}`)
      }),
    }
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin)

    const result = await verifyRequestNotificationPayload({
      requestId: 'request-1',
      requestType: 'baptism',
      contactName: 'Safe Contact',
      contactEmail: 'safe@example.test',
      contactPhone: '5550100001',
    })

    expect(result).toEqual({
      ok: false,
      error: 'Contact is not linked to a parish.',
      status: 403,
    })
  })
})
