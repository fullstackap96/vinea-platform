import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  createSupabaseServiceRoleClientMock,
  isStaffEmailAllowlistedMock,
  staffAccessNotConfiguredAllowsDevMock,
} = vi.hoisted(() => ({
  createSupabaseServiceRoleClientMock: vi.fn(),
  isStaffEmailAllowlistedMock: vi.fn(),
  staffAccessNotConfiguredAllowsDevMock: vi.fn(),
}))

vi.mock('@/lib/supabase/routeHandlerClient', () => ({
  createSupabaseRouteHandlerReadOnlyClient: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

vi.mock('@/lib/staffAuthorization', () => ({
  isStaffEmailAllowlisted: isStaffEmailAllowlistedMock,
  normalizeStaffEmail: (value: unknown) => String(value ?? '').trim().toLowerCase(),
  staffAccessNotConfiguredAllowsDev: staffAccessNotConfiguredAllowsDevMock,
}))

import { authorizeStaffUser } from './requireStaff'

type StaffRow = {
  id: string
  email: string
  role: string | null
  parish_id: string
}

function staffUsersQuery(rows: StaffRow[] | null, error: { code?: string; message?: string } | null = null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: rows, error })),
  }
  return builder
}

function parishQuery(hasParish: boolean, error: { code?: string; message?: string } | null = null) {
  const builder = {
    select: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: hasParish ? { id: 'parish-a' } : null,
        error,
      })
    ),
  }
  return builder
}

function adminClient(input: {
  staffRows?: StaffRow[] | null
  staffError?: { code?: string; message?: string } | null
  hasParish?: boolean
  parishError?: { code?: string; message?: string } | null
}) {
  const staffBuilder = staffUsersQuery(input.staffRows ?? [], input.staffError ?? null)
  const parishBuilder = parishQuery(input.hasParish ?? true, input.parishError ?? null)
  const admin = {
    from: vi.fn((table: string) => {
      if (table === 'staff_users') return staffBuilder
      if (table === 'parishes') return parishBuilder
      throw new Error(`Unexpected table ${table}`)
    }),
  }
  return { admin, staffBuilder, parishBuilder }
}

describe('authorizeStaffUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isStaffEmailAllowlistedMock.mockReturnValue(false)
    staffAccessNotConfiguredAllowsDevMock.mockReturnValue(false)
  })

  it('authorizes an active database staff row outside the oldest parish', async () => {
    const { admin, staffBuilder } = adminClient({
      staffRows: [{ id: 'staff-b', email: 'Staff@Example.com', role: 'staff', parish_id: 'parish-b' }],
    })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const result = await authorizeStaffUser({ email: 'STAFF@Example.com' } as never)

    expect(result).toEqual({
      ok: true,
      email: 'staff@example.com',
      role: 'staff',
      source: 'database',
    })
    expect(admin.from).toHaveBeenCalledWith('staff_users')
    expect(admin.from).not.toHaveBeenCalledWith('parishes')
    expect(staffBuilder.eq).toHaveBeenCalledWith('active', true)
    expect(staffBuilder.ilike).toHaveBeenCalledWith('email', 'staff@example.com')
    expect(staffBuilder.limit).toHaveBeenCalledWith(50)
  })

  it('returns admin when any active staff row for the email is an admin row', async () => {
    const { admin } = adminClient({
      staffRows: [
        { id: 'staff-a', email: 'admin@example.com', role: 'staff', parish_id: 'parish-a' },
        { id: 'staff-b', email: 'admin@example.com', role: 'admin', parish_id: 'parish-b' },
      ],
    })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    await expect(authorizeStaffUser({ email: 'admin@example.com' } as never)).resolves.toEqual({
      ok: true,
      email: 'admin@example.com',
      role: 'admin',
      source: 'database',
    })
  })

  it.each(['%@example.com', '_dmin@example.com', '*@example.com'])(
    'rejects a wildcard candidate belonging to another email: %s', async (email) => {
      const { admin } = adminClient({ staffRows: [
        { id: 'admin', email: 'admin@example.com', role: 'admin', parish_id: 'parish-a' },
      ] })
      createSupabaseServiceRoleClientMock.mockReturnValue(admin)
      await expect(authorizeStaffUser({ email } as never)).resolves.toMatchObject({ ok: false })
    }
  )

  it('uses only exact email matches when deciding admin status', async () => {
    const email = 'a_min@example.com'
    const { admin } = adminClient({ staffRows: [
      { id: 'other', email: 'admin@example.com', role: 'admin', parish_id: 'parish-a' },
      { id: 'self', email: 'A_MIN@example.com', role: 'staff', parish_id: 'parish-a' },
    ] })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)
    await expect(authorizeStaffUser({ email } as never)).resolves.toMatchObject({ ok: true, role: 'staff' })
  })

  it('preserves the parish-not-configured message when no parish exists', async () => {
    const { admin } = adminClient({ staffRows: [], hasParish: false })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    await expect(authorizeStaffUser({ email: 'staff@example.com' } as never)).resolves.toEqual({
      ok: false,
      error: 'Parish is not configured.',
    })
    expect(admin.from).toHaveBeenCalledWith('staff_users')
    expect(admin.from).toHaveBeenCalledWith('parishes')
  })

  it('keeps the development fallback only after database staff access is unavailable', async () => {
    staffAccessNotConfiguredAllowsDevMock.mockReturnValue(true)
    const { admin } = adminClient({ staffRows: [], hasParish: true })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    await expect(authorizeStaffUser({ email: 'dev@example.com' } as never)).resolves.toEqual({
      ok: true,
      email: 'dev@example.com',
      role: 'admin',
      source: 'development',
    })
  })

  it('does not contain the old first-parish staff authorization pattern', () => {
    const source = readFileSync(join(process.cwd(), 'lib', 'server', 'requireStaff.ts'), 'utf8')

    expect(source).toContain(".from('staff_users')")
    expect(source).toContain(".select('id, role, parish_id, email')")
    expect(source).toContain(".eq('active', true)")
    expect(source).toContain(".ilike('email', email)")
    expect(source).not.toContain(".eq('parish_id', parishId)")
    expect(source).not.toContain("order('created_at', { ascending: true })")
    expect(source).not.toContain('loadPrimaryParishId')
  })
})
