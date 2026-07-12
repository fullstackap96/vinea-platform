import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createServerClientMock = vi.hoisted(() => vi.fn())

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

import { proxy } from '../../proxy'

type SupabaseUser = {
  readonly email?: string | null
}

type MockSupabaseOptions = {
  readonly user: SupabaseUser | null
  readonly parishIds?: unknown
  readonly rpcError?: { readonly message: string } | null
}

function request(path = '/dashboard') {
  return new NextRequest(`https://vinea.test${path}`)
}

function mockSupabase(options: MockSupabaseOptions) {
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: options.user },
        error: null,
      })),
    },
    rpc: vi.fn(async () => ({
      data: options.parishIds ?? [],
      error: options.rpcError ?? null,
    })),
    from: vi.fn(),
  }

  createServerClientMock.mockReturnValue(supabase)

  return { supabase }
}

function redirectLocation(response: Response) {
  const location = response.headers.get('location')
  if (!location) return null
  return new URL(location)
}

describe('Next proxy staff auth behavior', () => {
  beforeEach(() => {
    createServerClientMock.mockReset()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://vinea.test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-test-key')
    vi.stubEnv('STAFF_ALLOWLIST_EMAILS', 'allowlisted@vinea.test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('redirects signed-out dashboard visitors to login with the original next path', async () => {
    const { supabase } = mockSupabase({ user: null })

    const response = await proxy(request('/dashboard?tab=today'))
    const location = redirectLocation(response)

    expect(response.status).toBe(307)
    expect(location?.pathname).toBe('/login')
    expect(location?.searchParams.get('next')).toBe('/dashboard?tab=today')
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })

  it('allows configured allowlisted staff without calling the database staff fallback', async () => {
    const { supabase } = mockSupabase({
      user: { email: 'AllowListed@VINEA.test' },
    })

    const response = await proxy(request())

    expect(response.status).toBe(200)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('authorizes database-backed staff through active membership scope', async () => {
    const { supabase } = mockSupabase({
      user: { email: 'staff@vinea.test' },
      parishIds: ['parish-b'],
    })

    const response = await proxy(request())

    expect(response.status).toBe(200)
    expect(supabase.rpc).toHaveBeenCalledWith('current_staff_parish_ids')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('authorizes a multi-parish staff session without depending on parish creation order', async () => {
    const { supabase } = mockSupabase({
      user: { email: 'multi-parish@vinea.test' },
      parishIds: [
        { current_staff_parish_ids: 'parish-newer' },
        { current_staff_parish_ids: 'parish-older' },
      ],
    })

    const response = await proxy(request('/dashboard/settings'))

    expect(response.status).toBe(200)
    expect(supabase.rpc).toHaveBeenCalledWith('current_staff_parish_ids')
  })

  it('redirects authenticated but unauthorized users to the safe staff unauthorized login state', async () => {
    mockSupabase({
      user: { email: 'visitor@vinea.test' },
      parishIds: [],
    })

    const response = await proxy(request('/dashboard/requests'))
    const location = redirectLocation(response)

    expect(response.status).toBe(307)
    expect(location?.pathname).toBe('/login')
    expect(location?.searchParams.get('staff')).toBe('unauthorized')
  })

  it('preserves the non-production development fallback only when staff access is not configured', async () => {
    vi.stubEnv('STAFF_ALLOWLIST_EMAILS', '')
    const { supabase } = mockSupabase({
      user: { email: 'local-dev@vinea.test' },
      parishIds: [],
    })

    const response = await proxy(request())

    expect(response.status).toBe(200)
    expect(supabase.rpc).toHaveBeenCalledWith('current_staff_parish_ids')
  })

  it('fails closed on membership lookup errors in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    mockSupabase({
      user: { email: 'staff@vinea.test' },
      rpcError: { message: 'membership lookup failed' },
    })

    const response = await proxy(request('/dashboard'))
    const location = redirectLocation(response)

    expect(response.status).toBe(307)
    expect(location?.pathname).toBe('/login')
    expect(location?.searchParams.get('staff')).toBe('unauthorized')
  })

  it('denies authenticated users without an email before membership lookup', async () => {
    const { supabase } = mockSupabase({ user: { email: null } })

    const response = await proxy(request())

    expect(response.status).toBe(307)
    expect(supabase.rpc).not.toHaveBeenCalled()
  })
})
