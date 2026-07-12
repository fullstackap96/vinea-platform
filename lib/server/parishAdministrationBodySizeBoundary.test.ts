import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function handler(relativePath: string, method: 'POST' | 'PATCH', occurrence = 1): string {
  const route = source(relativePath)
  const anchor = `export async function ${method}`
  let start = -1
  let searchFrom = 0
  for (let index = 0; index < occurrence; index += 1) {
    start = route.indexOf(anchor, searchFrom)
    expect(start).toBeGreaterThanOrEqual(0)
    searchFrom = start + anchor.length
  }

  const nextHandler = route.indexOf('\nexport async function ', searchFrom)
  return route.slice(start, nextHandler < 0 ? undefined : nextHandler)
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)
  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('parish administration body size boundary', () => {
  it('bounds parish settings after auth and before parish resolution or writes', () => {
    const route = handler('app/api/parish/settings/route.ts', 'PATCH')

    expect(source('app/api/parish/settings/route.ts')).toContain('const MAX_BODY_BYTES = 128 * 1024')
    expect(route).toContain('Parish settings update is too large.')
    expect(route).not.toContain('request.json()')
    expectBefore(route, 'const staffAuth = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'resolveStaffWriteParishContext(')
    expectBefore(route, 'resolveStaffWriteParishContext(', ".from('parishes')")
    expectBefore(route, ".from('parishes')", 'await writeAuditEvent({')
  })

  it('bounds workflow-step updates before parish/template reads, updates, or audit', () => {
    const route = handler('app/api/parish/workflow-templates/route.ts', 'PATCH')

    expect(source('app/api/parish/workflow-templates/route.ts')).toContain('const MAX_BODY_BYTES = 64 * 1024')
    expect(route).toContain('Workflow step update is too large.')
    expect(route).not.toContain('request.json()')
    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'resolveStaffWriteParishContext(')
    expectBefore(route, 'resolveStaffWriteParishContext(', ".from('workflow_template_steps')")
    expectBefore(route, ".from('workflow_templates')", ".update({")
    expectBefore(route, ".update({", 'await writeAuditEvent({')
  })

  it.each(['POST', 'PATCH'] as const)(
    'bounds staff access %s commands before admin checks, reads, writes, or audit',
    (method) => {
      const route = handler('app/api/parish/staff-users/route.ts', method)

      expect(source('app/api/parish/staff-users/route.ts')).toContain('const MAX_BODY_BYTES = 16 * 1024')
      expect(route).toContain('Staff access update is too large.')
      expect(route).not.toContain('request.json()')
      expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
      expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
      expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'resolveStaffWriteParishContext(')
      expectBefore(route, 'resolveStaffWriteParishContext(', 'staffIsAdminForParish(')
      expectBefore(route, 'staffIsAdminForParish(', ".from('staff_users')")
      expectBefore(route, ".from('staff_users')", 'await writeAuditEvent({')
    },
  )

  it('documents the scoped admin mutation boundary and unchanged gates', () => {
    const doc = source('docs/PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'PARISH_ADMINISTRATION_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      'Parish settings: `128 KiB`',
      'Workflow-template step updates: `64 KiB`',
      'Staff-access create/update commands: `16 KiB`',
      'Staff authentication remains before bounded parsing',
      'Rejected bodies do not create a service-role client',
      'Rejected bodies do not read or mutate parish, workflow-template, or staff-access rows',
      'Rejected bodies do not write audit events',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
