import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  loadAuthenticatedStaffRoleForParish,
  staffIsAdminForParish,
  staffParishRoleTestInternals,
} from '@/lib/server/staffParishRole'

function adminBuilder(input: {
  id?: string | null
  error?: { message: string } | null
}) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: input.id ? { id: input.id } : null,
        error: input.error ?? null,
      })
    ),
  }

  return builder
}

function membershipRoleBuilder(input: {
  role?: string | null
  error?: { message: string } | null
}) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: input.role ? { role: input.role } : null,
        error: input.error ?? null,
      })
    ),
  }

  return builder
}

describe('staff parish role', () => {
  it('checks active admin access inside the exact selected parish', async () => {
    const builder = adminBuilder({ id: 'staff-admin' })
    const client = { from: vi.fn(() => builder) }

    const result = await staffIsAdminForParish(client as never, {
      parishId: ' parish-b ',
      email: ' ADMIN@Example.com ',
    })

    expect(result).toBe(true)
    expect(client.from).toHaveBeenCalledWith('staff_users')
    expect(builder.eq).toHaveBeenCalledWith('parish_id', 'parish-b')
    expect(builder.eq).toHaveBeenCalledWith('role', 'admin')
    expect(builder.eq).toHaveBeenCalledWith('active', true)
    expect(builder.ilike).toHaveBeenCalledWith('email', 'admin@example.com')
  })

  it('returns false for a selected parish without an active admin row', async () => {
    const builder = adminBuilder({ id: null })

    await expect(
      staffIsAdminForParish({ from: vi.fn(() => builder) } as never, {
        parishId: 'parish-b',
        email: 'staff@example.com',
      })
    ).resolves.toBe(false)
  })

  it('fails closed for missing scope and propagates database errors to safe callers', async () => {
    const from = vi.fn()
    await expect(
      staffIsAdminForParish({ from } as never, {
        parishId: '',
        email: 'staff@example.com',
      })
    ).resolves.toBe(false)
    expect(from).not.toHaveBeenCalled()

    const builder = adminBuilder({ error: { message: 'role lookup failed' } })
    await expect(
      staffIsAdminForParish({ from: vi.fn(() => builder) } as never, {
        parishId: 'parish-a',
        email: 'staff@example.com',
      })
    ).rejects.toEqual({ message: 'role lookup failed' })
  })

  it('normalizes staff email without retaining display whitespace', () => {
    expect(staffParishRoleTestInternals.normalizeEmail(' Staff@Example.com ')).toBe(
      'staff@example.com'
    )
  })

  it.each([
    ['admin', 'admin'],
    ['staff', 'staff'],
  ] as const)('loads the exact selected-parish %s membership role', async (role, expected) => {
    const builder = membershipRoleBuilder({ role })
    const client = { from: vi.fn(() => builder) }

    await expect(
      loadAuthenticatedStaffRoleForParish(client as never, {
        parishId: ' parish-b ',
        email: ' ADMIN@Example.com ',
      })
    ).resolves.toBe(expected)

    expect(client.from).toHaveBeenCalledWith('parish_memberships')
    expect(builder.eq).toHaveBeenCalledWith('parish_id', 'parish-b')
    expect(builder.eq).toHaveBeenCalledWith('active', true)
    expect(builder.ilike).toHaveBeenCalledWith('email', 'admin@example.com')
  })

  it('fails closed for absent or unsupported selected-parish roles', async () => {
    const absent = membershipRoleBuilder({ role: null })
    await expect(
      loadAuthenticatedStaffRoleForParish({ from: vi.fn(() => absent) } as never, {
        parishId: 'parish-b',
        email: 'staff@example.com',
      })
    ).resolves.toBeNull()

    const unsupported = membershipRoleBuilder({ role: 'viewer' })
    await expect(
      loadAuthenticatedStaffRoleForParish({ from: vi.fn(() => unsupported) } as never, {
        parishId: 'parish-b',
        email: 'staff@example.com',
      })
    ).resolves.toBeNull()

    const from = vi.fn()
    await expect(
      loadAuthenticatedStaffRoleForParish({ from } as never, {
        parishId: '',
        email: 'staff@example.com',
      })
    ).resolves.toBeNull()
    expect(from).not.toHaveBeenCalled()
  })

  it('propagates selected-parish membership lookup errors to fail-closed callers', async () => {
    const builder = membershipRoleBuilder({ error: { message: 'membership lookup failed' } })

    await expect(
      loadAuthenticatedStaffRoleForParish({ from: vi.fn(() => builder) } as never, {
        parishId: 'parish-b',
        email: 'staff@example.com',
      })
    ).rejects.toEqual({ message: 'membership lookup failed' })
  })
})
