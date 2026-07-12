import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function source(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8')
}

function patchHandler(relativePath: string): string {
  const route = source(relativePath)
  const start = route.indexOf('export async function PATCH')
  expect(start).toBeGreaterThanOrEqual(0)
  return route.slice(start)
}

function expectBefore(value: string, earlier: string, later: string): void {
  const earlierIndex = value.indexOf(earlier)
  const laterIndex = value.indexOf(later)
  expect(earlierIndex, `Missing earlier anchor: ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Missing later anchor: ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('request workflow metadata body size boundary', () => {
  it('bounds checklist updates after authentication and before scoped reads or writes', () => {
    const route = patchHandler(
      'app/api/requests/[id]/checklist-items/[itemId]/route.ts',
    )

    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain('Checklist update is too large.')
    expect(route).toContain('{ status: parsedBody.reason === \'too_large\' ? 413 : 400 }')
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', ".from('checklist_items')")
    expectBefore(route, 'const access = await loadStaffScopedRequestDetailAccess', '.update({ is_complete: isComplete })')
  })

  it('bounds document reviews before request/document reads, audit, or updates', () => {
    const route = patchHandler(
      'app/api/requests/[id]/documents/[documentId]/route.ts',
    )

    expect(route).toContain('const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(route).toContain('Document review is too large.')
    expect(route).toContain('{ status: parsedBody.reason === \'too_large\' ? 413 : 400 }')
    expect(route).not.toContain('request.json()')

    expectBefore(route, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const admin = createSupabaseServiceRoleClient()')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'loadStaffScopedRequestDocumentAccess(')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'const document = await loadDocument(')
    expectBefore(route, 'const parsedBody = await readBoundedJsonBody', 'await writeAuditEvent({')
    expectBefore(route, 'const document = await loadDocument(', ".from('request_documents')")
    expectBefore(route, ".from('request_documents')", 'await writeAuditEvent({')
  })

  it('documents the bounded, staff-reviewed, active-parish boundary', () => {
    const doc = source('docs/REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_20260709.md')

    for (const required of [
      'REQUEST_WORKFLOW_METADATA_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709',
      '`32 KiB`',
      'Staff authentication remains before bounded parsing',
      'Active-parish request ownership remains before operational reads and writes',
      'Rejected bodies do not read or update checklist items or request documents',
      'Rejected bodies do not write audit events or access storage',
    ]) {
      expect(doc).toContain(required)
    }
  })
})
