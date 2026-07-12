import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)
  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('audit events body size boundary', () => {
  it('bounds POST after staff auth and before parish/request reads or audit writes', () => {
    const routeSource = source('app/api/audit-events/route.ts')
    const post = routeSource.slice(routeSource.indexOf('export async function POST'))

    expect(routeSource).toContain('const MAX_BODY_BYTES = 64 * 1024')
    expect(post).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(post).toContain('Audit event is too large.')
    expect(post).toContain("{ status: parsedBody.reason === 'too_large' ? 413 : 400 }")
    expect(post).not.toContain('request.json()')

    expectBefore(post, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'resolveAuditEventsWriteParishId({')
    expectBefore(post, 'resolveAuditEventsWriteParishId({', 'await writeAuditEvent({')
  })

  it('preserves target validation and requires exact-parish admin checks for non-request writes', () => {
    const routeSource = source('app/api/audit-events/route.ts')
    const post = routeSource.slice(routeSource.indexOf('export async function POST'))

    expect(post).toContain("if (targetType !== 'request')")
    expect(post).toContain('canWriteParishAuditEvent = await staffIsAdminForParish(admin, {')
    expect(post).toContain('parishId: parishContext.parishId')
    expect(post).not.toContain("staff.staff.role !== 'admin'")
    expect(post).toContain('Missing action, target type, or target id.')
    expect(post).toContain('resolveAuditEventsWriteParishId({')
    expect(post).toContain('actorEmail: staff.staff.email')
    expectBefore(
      post,
      'resolveAuditEventsWriteParishId({',
      'canWriteParishAuditEvent = await staffIsAdminForParish(admin, {'
    )
    expectBefore(
      post,
      'canWriteParishAuditEvent = await staffIsAdminForParish(admin, {',
      'await writeAuditEvent({'
    )
  })

  it('documents generic rejection and unchanged authorization behavior', () => {
    const doc = source('docs/AUDIT_EVENTS_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'AUDIT_EVENTS_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`64 KiB`',
      'Staff authentication remains before bounded parsing',
      'Request-target parish attribution and active-parish matching remain unchanged',
      'Rejected bodies do not create a service-role client',
      'Rejected bodies do not resolve request parish ownership or write audit events',
      'does not change which audit actions or target types staff may submit',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
