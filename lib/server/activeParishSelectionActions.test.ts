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
  activeParishCookieOptions,
  normalizeRequestedParishId,
  shouldUseSecureActiveParishCookie,
} from '@/lib/server/activeParishSelection'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { setActiveStaffParish } from '../../app/dashboard/parish-context/actions'

const cookiesMock = vi.mocked(cookies)
const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

function cookieStore() {
  return {
    set: vi.fn(),
  }
}

function supabaseWithUser(user: unknown = { id: 'user-1' }) {
  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user },
          error: null,
        })
      ),
    },
  }
}

describe('setActiveStaffParish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(process.env, { NODE_ENV: 'test' })
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  it('sets an httpOnly active parish cookie after validating staff membership', async () => {
    const store = cookieStore()
    const supabase = supabaseWithUser()
    cookiesMock.mockResolvedValue(store as never)
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

    const result = await setActiveStaffParish(' parish-2 ')

    expect(result).toEqual({ ok: true, activeParishId: 'parish-2' })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(store.set).toHaveBeenCalledWith(
      ACTIVE_STAFF_PARISH_COOKIE,
      'parish-2',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 15552000,
      })
    )
  })

  it('clears the cookie without touching Supabase when no parish is requested', async () => {
    const store = cookieStore()
    cookiesMock.mockResolvedValue(store as never)

    const result = await setActiveStaffParish('   ')

    expect(result).toEqual({ ok: true, activeParishId: null, cleared: true })
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled()
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(store.set).toHaveBeenCalledWith(
      ACTIVE_STAFF_PARISH_COOKIE,
      '',
      expect.objectContaining({
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    )
  })

  it('clears the cookie and returns unauthorized when no staff session exists', async () => {
    const store = cookieStore()
    const supabase = supabaseWithUser(null)
    cookiesMock.mockResolvedValue(store as never)
    createSupabaseServerClientMock.mockResolvedValue(supabase as never)

    const result = await setActiveStaffParish('parish-1')

    expect(result).toEqual({
      ok: false,
      error: 'Unauthorized',
      activeParishId: null,
      cleared: true,
    })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(store.set).toHaveBeenCalledWith(
      ACTIVE_STAFF_PARISH_COOKIE,
      '',
      expect.objectContaining({ maxAge: 0 })
    )
  })

  it('does not persist unauthorized requested parishes', async () => {
    const store = cookieStore()
    const supabase = supabaseWithUser()
    cookiesMock.mockResolvedValue(store as never)
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

    const result = await setActiveStaffParish('parish-999')

    expect(result).toEqual({
      ok: false,
      error: 'Requested parish is not authorized for this staff session.',
      activeParishId: 'parish-1',
      cleared: true,
    })
    expect(store.set).toHaveBeenCalledWith(
      ACTIVE_STAFF_PARISH_COOKIE,
      '',
      expect.objectContaining({ maxAge: 0 })
    )
  })

  it('normalizes requested parish ids and uses secure cookies for HTTPS production origins', () => {
    expect(normalizeRequestedParishId(' parish-1 ')).toBe('parish-1')
    expect(normalizeRequestedParishId('   ')).toBeNull()

    Object.assign(process.env, { NODE_ENV: 'production' })
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.vinea.test'

    expect(shouldUseSecureActiveParishCookie()).toBe(true)
    expect(activeParishCookieOptions()).toMatchObject({
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  })

  it('allows the active parish cookie to round-trip on approved HTTP non-production browser QA origins', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    process.env.NEXT_PUBLIC_APP_URL = 'http://192.168.1.100:3000'

    expect(shouldUseSecureActiveParishCookie()).toBe(false)
    expect(activeParishCookieOptions()).toMatchObject({
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  })

  it('defaults to secure cookies in production when no app origin is configured', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    delete process.env.NEXT_PUBLIC_APP_URL

    expect(shouldUseSecureActiveParishCookie()).toBe(true)
  })

  it('defaults to secure cookies when the configured production origin is not exact', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    process.env.NEXT_PUBLIC_APP_URL = 'http://192.168.1.100:3000/dashboard'

    expect(shouldUseSecureActiveParishCookie()).toBe(true)
  })
})
