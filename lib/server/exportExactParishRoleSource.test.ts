import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const routePaths = [
  join(process.cwd(), 'app', 'api', 'exports', 'requests', 'basic', 'route.ts'),
  join(
    process.cwd(),
    'app',
    'api',
    'exports',
    'requests',
    'documents',
    'manifest',
    'route.ts'
  ),
]

describe('export selected-parish role boundary', () => {
  it.each(routePaths)('keeps exact membership role resolution before permission and delivery in %s', (path) => {
    const source = readFileSync(path, 'utf8')

    const gateIndex = source.indexOf('getExportRuntimeGate(process.env)')
    const roleIndex = source.indexOf('loadAuthenticatedStaffRoleForParish(staff.supabase')
    const permissionIndex = source.indexOf('buildExportPermissionEvaluationDto({')
    const auditIndex = source.indexOf("action: 'export.", permissionIndex)
    const queryIndex = source.indexOf('queryExportRows(', permissionIndex)

    expect(gateIndex).toBeGreaterThanOrEqual(0)
    expect(roleIndex).toBeGreaterThan(gateIndex)
    expect(permissionIndex).toBeGreaterThan(roleIndex)
    expect(auditIndex).toBeGreaterThan(permissionIndex)
    expect(queryIndex).toBeGreaterThan(auditIndex)
    expect(source).toContain('parishId: activeParishId')
    expect(source).toContain('email: staff.staff.email')
    expect(source).toContain('staffExportRoles(selectedParishRole)')
    expect(source).toContain("deniedReasonCode: 'selected_parish_role_denied'")
    expect(source).not.toContain('staffExportRoles(staff.staff.role)')
  })
})
