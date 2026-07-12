import 'server-only'

import {
  loadActiveStaffParishSwitcherContext,
  type ActiveStaffParishSwitcherContext,
} from '@/lib/server/loadActiveStaffParishSwitcher'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { staffIsAdminForParish } from '@/lib/server/staffParishRole'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export type DashboardShellContext = {
  parishSwitcher: ActiveStaffParishSwitcherContext
  staffEmail: string
  canViewAuditLog: boolean
}

function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase()
}

export async function loadDashboardShellContext(): Promise<DashboardShellContext> {
  const supabase = await createSupabaseServerClient()
  const [parishSwitcher, userResult] = await Promise.all([
    loadActiveStaffParishSwitcherContext(),
    supabase.auth.getUser(),
  ])
  const staffEmail = normalizeEmail(userResult.data.user?.email)

  if (!parishSwitcher.ok || userResult.error || !staffEmail) {
    return {
      parishSwitcher,
      staffEmail: '',
      canViewAuditLog: false,
    }
  }

  try {
    const canViewAuditLog = await staffIsAdminForParish(
      createSupabaseServiceRoleClient(),
      {
        parishId: parishSwitcher.activeParishId,
        email: staffEmail,
      }
    )

    return { parishSwitcher, staffEmail, canViewAuditLog }
  } catch (error: unknown) {
    logServerError('[dashboard-shell] selected-parish admin lookup failed', error, {
      route: '/dashboard/layout',
      hasActiveParish: true,
    })
    return { parishSwitcher, staffEmail, canViewAuditLog: false }
  }
}

export const dashboardShellContextTestInternals = {
  normalizeEmail,
}
