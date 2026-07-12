import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request staff notes active parish mutation route', () => {
  it('updates staff notes only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/staff-notes/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("typeof staffNotes !== 'string'")
    expect(source).toContain(".from('requests')")
    expect(source).toContain('.update({ staff_notes: staffNotes })')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain('data: updatedRequest')
    expect(source).toContain(".select('id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedRequest?.id')
    expect(source).toContain('Could not update staff notes.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
    expect(source.indexOf('!updatedRequest?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail staff notes save off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('async function saveStaffNotes'),
      source.indexOf(' async function saveSuggestedDates')
    )

    expect(block).toContain("fetch(`/api/requests/${routeId}/staff-notes`")
    expect(block).toContain("method: 'PATCH'")
    expect(block).toContain("requestDetailClientApiErrorMessage('updateStaffNotes'")
    expect(block).toContain("requestDetailClientFailureMessage('updateStaffNotes')")
    expect(block).not.toContain(".from('requests')")
    expect(block).not.toContain('.update({ staff_notes: staffNotes })')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_STAFF_NOTES_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/staff-notes/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('staff notes')
    expect(doc).toContain('does not apply migrations or change operational RLS')
  })
})
