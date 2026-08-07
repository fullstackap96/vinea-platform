import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  resolveActiveStaffParishContext: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

type QueryResponse = {
  data: Record<string, unknown> | null
  error: { message: string; code?: string } | null
}

function queryBuilder(response: QueryResponse) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(response)),
  }

  return builder
}

function adminFor(input: {
  primaryParishId?: string | null
  requestParishionerId?: string | null
  parishionerParishId?: string | null
}) {
  const builders = {
    parishes: queryBuilder({
      data: input.primaryParishId ? { id: input.primaryParishId } : null,
      error: null,
    }),
    requests: queryBuilder({
      data: input.requestParishionerId
        ? { id: 'request-1', parishioner_id: input.requestParishionerId }
        : null,
      error: null,
    }),
    parishioners: queryBuilder({
      data: input.parishionerParishId ? { parish_id: input.parishionerParishId } : null,
      error: null,
    }),
  }

  const from = vi.fn((table: string) => {
    const builder = builders[table as keyof typeof builders]
    if (!builder) throw new Error(`Unexpected table: ${table}`)
    return builder
  })

  return { admin: { from }, builders, from }
}

describe('loadStaffScopedRequestDetailAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses an exact membership-validated active parish for request detail access', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, from } = adminFor({
      primaryParishId: 'parish-1',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'parish-2',
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      staffSupabase: staffSupabase as never,
      activeParishId: 'parish-2',
      allowPrimaryParishFallback: false,
    })

    expect(result).toEqual({ requestId: 'request-1', parishId: 'parish-2' })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
    })
    expect(from).not.toHaveBeenCalledWith('parishes')
  })

  it('does not silently fall back when an active parish cookie is unauthorized', async () => {
    const { admin, from } = adminFor({
      primaryParishId: 'parish-1',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'parish-1',
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      staffSupabase: { rpc: vi.fn(), from: vi.fn() } as never,
      activeParishId: 'parish-2',
      allowPrimaryParishFallback: true,
    })

    expect(result).toBeNull()
    expect(from).not.toHaveBeenCalledWith('parishes')
    expect(from).not.toHaveBeenCalledWith('requests')
  })

  it('does not use primary-parish fallback when an active parish cookie is present', async () => {
    const { admin, from } = adminFor({
      primaryParishId: 'parish-1',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'parish-1',
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      staffSupabase: { rpc: vi.fn(), from: vi.fn() } as never,
      activeParishId: 'parish-1',
      allowPrimaryParishFallback: true,
    })

    expect(result).toBeNull()
    expect(from).not.toHaveBeenCalledWith('parishes')
    expect(from).not.toHaveBeenCalledWith('requests')
  })

  it('preserves explicit primary parish fallback when no active parish cookie exists', async () => {
    const { admin } = adminFor({
      primaryParishId: 'parish-1',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'parish-1',
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      activeParishId: null,
      allowPrimaryParishFallback: true,
    })

    expect(result).toEqual({ requestId: 'request-1', parishId: 'parish-1' })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
  })

  it('uses the authenticated primary membership when the active parish cookie is absent', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, from } = adminFor({
      primaryParishId: 'global-primary-parish',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'staff-primary-parish',
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['staff-primary-parish'],
      primaryParishId: 'staff-primary-parish',
      activeParishId: 'staff-primary-parish',
      activeParish: { id: 'staff-primary-parish', name: 'Staff Parish' },
      parishes: [{ id: 'staff-primary-parish', name: 'Staff Parish' }],
      requestedParishId: null,
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      staffSupabase: staffSupabase as never,
      activeParishId: null,
      allowPrimaryParishFallback: true,
    })

    expect(result).toEqual({ requestId: 'request-1', parishId: 'staff-primary-parish' })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase)
    expect(from).not.toHaveBeenCalledWith('parishes')
  })

  it('fails closed when cookie-free membership resolution fails', async () => {
    const { admin, from } = adminFor({
      primaryParishId: 'global-primary-parish',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'global-primary-parish',
    })
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'membership',
      error: 'Unable to resolve parish access.',
      technicalDetail: null,
      requestedParishId: null,
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      staffSupabase: { rpc: vi.fn(), from: vi.fn() } as never,
      activeParishId: null,
      allowPrimaryParishFallback: true,
    })

    expect(result).toBeNull()
    expect(from).not.toHaveBeenCalled()
  })

  it('fails closed when neither active parish nor explicit fallback is available', async () => {
    const { admin, from } = adminFor({
      primaryParishId: 'parish-1',
      requestParishionerId: 'parishioner-1',
      parishionerParishId: 'parish-1',
    })

    const result = await loadStaffScopedRequestDetailAccess(admin as never, 'request-1', {
      activeParishId: null,
      allowPrimaryParishFallback: false,
    })

    expect(result).toBeNull()
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(from).not.toHaveBeenCalled()
  })
})
