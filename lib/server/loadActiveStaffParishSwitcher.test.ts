import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/server/activeStaffParishContext', async () => {
  const actual = await vi.importActual<typeof import('@/lib/server/activeStaffParishContext')>(
    '@/lib/server/activeStaffParishContext'
  )
  return {
    ...actual,
    resolveActiveStaffParishContext: vi.fn(),
  }
})

import { cookies } from 'next/headers'

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import {
  labelActiveStaffParishSwitcherParishes,
  loadActiveStaffParishSwitcherContext,
} from '@/lib/server/loadActiveStaffParishSwitcher'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const cookiesMock = vi.mocked(cookies)
const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('labelActiveStaffParishSwitcherParishes', () => {
  it('preserves real parish names', () => {
    expect(
      labelActiveStaffParishSwitcherParishes([
        { id: 'parish-1', name: ' Alpha Parish ' },
        { id: 'parish-2', name: 'Beta Parish' },
      ])
    ).toEqual([
      { id: 'parish-1', name: 'Alpha Parish' },
      { id: 'parish-2', name: 'Beta Parish' },
    ])
  })

  it('uses one simple fallback when a single parish is unnamed', () => {
    expect(labelActiveStaffParishSwitcherParishes([{ id: 'parish-1', name: null }])).toEqual([
      { id: 'parish-1', name: 'Unnamed parish' },
    ])
  })

  it('makes multiple unnamed parish labels distinct without changing ids', () => {
    expect(
      labelActiveStaffParishSwitcherParishes([
        { id: 'parish-a', name: null },
        { id: 'parish-b', name: '' },
        { id: 'parish-c', name: '   ' },
      ])
    ).toEqual([
      { id: 'parish-a', name: 'Unnamed parish 1' },
      { id: 'parish-b', name: 'Unnamed parish 2' },
      { id: 'parish-c', name: 'Unnamed parish 3' },
    ])
  })
})

describe('loadActiveStaffParishSwitcherContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads safe active parish switcher context from the active parish cookie', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore('parish-2') as never)
    createSupabaseServerClientMock.mockResolvedValue(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValue({
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

    const result = await loadActiveStaffParishSwitcherContext()

    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(result).toEqual({
      ok: true,
      activeParishId: 'parish-2',
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      warning: null,
    })
  })

  it('returns a warning when a stale cookie is ignored by the active context resolver', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore('parish-999') as never)
    createSupabaseServerClientMock.mockResolvedValue(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-999',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result = await loadActiveStaffParishSwitcherContext()

    expect(result).toEqual({
      ok: true,
      activeParishId: 'parish-1',
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      warning: 'Requested parish is not authorized for this staff session.',
    })
  })

  it('returns a safe empty context when parish context cannot be resolved', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
    createSupabaseServerClientMock.mockResolvedValue(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Parish is not configured.',
      technicalDetail: null,
      requestedParishId: null,
    })

    const result = await loadActiveStaffParishSwitcherContext()

    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
    expect(result).toEqual({
      ok: false,
      activeParishId: null,
      parishes: [],
      error: 'Parish is not configured.',
      technicalDetail: null,
    })
  })

  it('returns distinct labels for multiple unnamed parishes in the switcher context', async () => {
    const supabase = { from: vi.fn(), rpc: vi.fn() }
    cookiesMock.mockResolvedValue(cookieStore('parish-b') as never)
    createSupabaseServerClientMock.mockResolvedValue(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      parishIds: ['parish-a', 'parish-b'],
      primaryParishId: 'parish-a',
      activeParishId: 'parish-b',
      activeParish: { id: 'parish-b', name: null },
      parishes: [
        { id: 'parish-a', name: null },
        { id: 'parish-b', name: null },
      ],
      requestedParishId: 'parish-b',
    })

    const result = await loadActiveStaffParishSwitcherContext()

    expect(result).toEqual({
      ok: true,
      activeParishId: 'parish-b',
      parishes: [
        { id: 'parish-a', name: 'Unnamed parish 1' },
        { id: 'parish-b', name: 'Unnamed parish 2' },
      ],
      warning: null,
    })
  })
})
