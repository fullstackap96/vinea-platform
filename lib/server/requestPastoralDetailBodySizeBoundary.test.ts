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

describe('request pastoral detail body size boundary', () => {
  it.each([
    ['funeral-details', 'Funeral details are too large.', "from('funeral_request_details').upsert"],
    ['wedding-details', 'Wedding details are too large.', "from('wedding_request_details').upsert"],
  ])('bounds %s after auth and before request access or upsert', (routeName, error, upsert) => {
    const route = source(`app/api/requests/[id]/${routeName}/route.ts`)

    expect(route).toContain('const MAX_BODY_BYTES = 128 * 1024')
    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain(error)
    expect(route).toContain('{ status: 413 }')
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const access = await loadStaffScopedRequestDetailAccess', upsert)
  })

  it('documents unchanged pastoral field and confirmed-date behavior', () => {
    const doc = source('docs/REQUEST_PASTORAL_DETAIL_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'REQUEST_PASTORAL_DETAIL_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`128 KiB`',
      'Staff authentication remains before bounded parsing',
      'Active-parish ownership and Funeral/Wedding request-type checks remain before upserts',
      'Existing confirmed service or ceremony timestamps remain preserved during detail saves',
      'does not make canonical, sacramental, pastoral, or eligibility decisions',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
