import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request checklist item active parish mutation route', () => {
  it('updates checklist items only after staff auth, active parish scope, and request ownership', () => {
    const source = read('app/api/requests/[id]/checklist-items/[itemId]/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string; itemId: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("typeof isComplete !== 'boolean'")
    expect(source).toContain(".from('checklist_items')")
    expect(source).toContain(".select('id, request_id')")
    expect(source).toContain(".eq('id', itemId)")
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).toContain('.update({ is_complete: isComplete })')
    expect(source).toContain(".select('id, item_name, is_complete, created_at')")
    expect(source).toContain('!updatedItem?.id')
    expect(source).toContain('Could not update checklist item.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
    expect(source.indexOf('!updatedItem?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail checklist toggle off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('  async function toggleChecklistItem'),
      source.indexOf('async function updateRequestStatus')
    )

    expect(block).toContain("fetch(`/api/requests/${routeId}/checklist-items/${itemId}`")
    expect(block).toContain("method: 'PATCH'")
    expect(block).toContain("requestDetailClientApiErrorMessage('updateChecklistItem'")
    expect(block).toContain("requestDetailClientFailureMessage('updateChecklistItem')")
    expect(block).not.toContain(".from('checklist_items')")
    expect(block).not.toContain(".update({ is_complete: !currentValue })")
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_CHECKLIST_ITEM_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/checklist-items/[itemId]/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('checklist item')
    expect(doc).toContain('does not apply migrations or change operational RLS')
  })
})
