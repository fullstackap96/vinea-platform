import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('dashboard shell server context source', () => {
  it('renders identity and selected-parish admin capability from the server layout', () => {
    const layout = read('app/dashboard/layout.tsx')
    const client = read('app/dashboard/DashboardLayoutClient.tsx')
    const loader = read('lib/server/loadDashboardShellContext.ts')

    expect(layout).toContain('loadDashboardShellContext()')
    expect(layout).toContain('staffEmail={staffEmail}')
    expect(layout).toContain('canViewAuditLog={canViewAuditLog}')
    expect(loader).toContain('Promise.all([')
    expect(loader).toContain('supabase.auth.getUser()')
    expect(loader).toContain('parishId: parishSwitcher.activeParishId')
    expect(loader).toContain('staffIsAdminForParish')

    expect(client).not.toContain('useEffect')
    expect(client).not.toContain('supabase.auth.getUser()')
    expect(client).not.toContain('supabase.auth.onAuthStateChange')
    expect(client).not.toContain("fetch('/api/parish/staff-users'")
    expect(client).toContain("supabase.auth.signOut({ scope: 'local' })")
  })

  it('requires exact selected-parish admin status for full audit-log access', () => {
    const route = read('app/api/audit-events/route.ts')

    expect(route).toContain('staffIsAdminForParish(admin')
    expect(route).toContain('parishId,')
    expect(route).toContain('email: staff.staff.email')
    expect(route).toContain('if ((!targetType || !targetId) && !canViewAll)')
    expect(route).toContain("if (targetType !== 'request')")
    expect(route).toContain('parishId: parishContext.parishId')
    expect(route).toContain('canViewAll,')
    expect(route).not.toContain("staff.staff.role !== 'admin'")
    expect(route).not.toContain("canViewAll: staff.staff.role === 'admin'")
  })
})
