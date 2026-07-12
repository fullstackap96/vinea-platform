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

describe('duplicate merge body size boundary', () => {
  it.each([
    ['people', "duplicateWriteParishId(staff.supabase", ".from('people')"],
    ['households', "duplicateWriteParishId(staff.supabase", ".from('households')"],
  ])('bounds %s merge commands before parish scope or operational work', (entity, scope, lookup) => {
    const route = source(`app/api/${entity}/duplicates/route.ts`)
    const post = route.slice(route.indexOf('export async function POST'))

    expect(post).toContain('const parsedBody = await readBoundedJsonBody(request, 32 * 1024)')
    expect(post).toContain('Merge request is too large.')
    expect(post).not.toContain('request.json()')
    expectBefore(post, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', scope)
    expectBefore(post, scope, lookup)
    expectBefore(post, lookup, 'await writeAuditEvent({')
  })

  it('documents no merge, delete, repoint, or audit work after rejection', () => {
    const doc = source('docs/DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'DUPLICATE_MERGE_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`32 KiB`',
      'Staff authentication remains before bounded parsing',
      'Rejected bodies do not resolve active-parish write scope',
      'Rejected bodies do not read, update, repoint, or delete People or Household records',
      'Rejected bodies do not write audit events',
      'does not change merge field selection or merge semantics',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
