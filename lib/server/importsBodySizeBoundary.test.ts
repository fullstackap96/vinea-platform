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

describe('imports body size boundary', () => {
  it('bounds import POST after authentication and before parsing, parish scope, or database work', () => {
    const route = source('app/api/imports/route.ts')
    const post = route.slice(route.indexOf('export async function POST'))

    expect(route).toContain('const MAX_BODY_BYTES = 4 * 1024 * 1024')
    expect(post).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(post).toContain('Import request is too large. Split the spreadsheet into smaller batches.')
    expect(post).not.toContain('request.json()')

    expectBefore(post, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'const rows = parseMappedRows(body.rows)')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'resolveImportWriteParishId(')
    expectBefore(post, 'const parsedBody = await readBoundedJsonBody', 'resolveImportReadParishId(')
    expectBefore(post, 'resolveImportWriteParishId(', 'await loadExistingRows(')
  })

  it('preserves the supported 1,000-row and 2,000-character cell normalization', () => {
    const route = source('app/api/imports/route.ts')

    expect(route).toContain('return value.slice(0, 1000).map((row, index) => {')
    expect(route).toContain('next[key] = text(val, 2000)')
    expect(route).toContain('if (commit)')
    expect(route).toContain('return NextResponse.json({ ok: true, preview })')
  })

  it('documents preview/commit safety and no-work behavior after rejection', () => {
    const doc = source('docs/IMPORTS_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'IMPORTS_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`4 MiB`',
      'Existing maximum rows per request: `1,000`',
      'Existing normalized maximum per cell value: `2,000 characters`',
      'Staff authentication remains before bounded parsing',
      'Rejected bodies do not resolve active-parish read or write scope',
      'Rejected bodies do not load existing rows, create previews, insert records, record batches, or write audit events',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
