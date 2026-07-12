import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/loadActiveStaffParishSwitcher', () => ({
  loadActiveStaffParishSwitcherContext: vi.fn(),
}))

vi.mock('@/lib/server/staffParishRole', () => ({
  staffIsAdminForParish: vi.fn(),
}))

vi.mock('@/lib/server/safeErrorLogging', () => ({
  logServerError: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { loadActiveStaffParishSwitcherContext } from '@/lib/server/loadActiveStaffParishSwitcher'
import {
  dashboardShellContextTestInternals,
  loadDashboardShellContext,
} from '@/lib/server/loadDashboardShellContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { staffIsAdminForParish } from '@/lib/server/staffParishRole'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const loadParishSwitcherMock = vi.mocked(loadActiveStaffParishSwitcherContext)
const logServerErrorMock = vi.mocked(logServerError)
const staffIsAdminForParishMock = vi.mocked(staffIsAdminForParish)
const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)

const parishSwitcher = {
  ok: true as const,
  activeParishId: 'parish-b',
  parishes: [
    { id: 'parish-a', name: 'Alpha Parish' },
    { id: 'parish-b', name: 'Beta Parish' },
  ],
  warning: null,
}

describe('loadDashboardShellContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadParishSwitcherMock.mockResolvedValue(parishSwitcher)
    createSupabaseServiceRoleClientMock.mockReturnValue({ from: vi.fn() } as never)
  })

  it('server-renders normalized staff identity and exact-parish admin access', async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { email: ' ADMIN@Example.com ' } },
      error: null,
    })
    createSupabaseServerClientMock.mockResolvedValue({ auth: { getUser } } as never)
    staffIsAdminForParishMock.mockResolvedValue(true)

    await expect(loadDashboardShellContext()).resolves.toEqual({
      parishSwitcher,
      staffEmail: 'admin@example.com',
      canViewAuditLog: true,
    })
    expect(staffIsAdminForParishMock).toHaveBeenCalledWith(expect.anything(), {
      parishId: 'parish-b',
      email: 'admin@example.com',
    })
  })

  it('does not perform an admin lookup without an authenticated staff identity', async () => {
    createSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'No session' },
        }),
      },
    } as never)

    await expect(loadDashboardShellContext()).resolves.toEqual({
      parishSwitcher,
      staffEmail: '',
      canViewAuditLog: false,
    })
    expect(staffIsAdminForParishMock).not.toHaveBeenCalled()
  })

  it('keeps the shell usable and hides admin navigation when role lookup fails', async () => {
    createSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { email: 'staff@example.com' } },
          error: null,
        }),
      },
    } as never)
    staffIsAdminForParishMock.mockRejectedValue(new Error('database details'))

    await expect(loadDashboardShellContext()).resolves.toEqual({
      parishSwitcher,
      staffEmail: 'staff@example.com',
      canViewAuditLog: false,
    })
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[dashboard-shell] selected-parish admin lookup failed',
      expect.any(Error),
      {
        route: '/dashboard/layout',
        hasActiveParish: true,
      }
    )
  })

  it('normalizes the server-rendered identity label', () => {
    expect(dashboardShellContextTestInternals.normalizeEmail(' Staff@Example.com ')).toBe(
      'staff@example.com'
    )
  })
})
