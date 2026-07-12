import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request confirmed baptism date active parish mutation route', () => {
  it('updates only confirmed baptism date after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/confirmed-baptism-date/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('optionalDateTime')
    expect(source).toContain("error: 'Invalid confirmed baptism date update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? 'baptism') !== 'baptism'")
    expect(source).toContain(".from('requests')")
    expect(source).toContain('confirmed_baptism_date: confirmedBaptismDate')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain('data: updatedRequest')
    expect(source).toContain(".select('id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedRequest?.id')
    expect(source).toContain('Could not update confirmed baptism date.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')

    expect(source.indexOf('!updatedRequest?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail confirmed baptism date save and clear off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('async function saveConfirmedBaptismDate'),
      source.indexOf('async function saveFuneralDetails')
    )

    expect(block).toContain("fetch(`/api/requests/${routeId}/confirmed-baptism-date`")
    expect(block).toContain("method: 'PATCH'")
    expect(block).toContain("requestDetailClientApiErrorMessage('saveConfirmedDate'")
    expect(block).toContain("requestDetailClientApiErrorMessage('clearConfirmedDate'")
    expect(block).toContain("requestDetailClientFailureMessage('saveConfirmedDate')")
    expect(block).toContain("requestDetailClientFailureMessage('clearConfirmedDate')")
    expect(block).not.toContain(".from('requests')")
    expect(block).not.toContain('confirmed_baptism_date:')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_CONFIRMED_BAPTISM_DATE_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/confirmed-baptism-date/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('confirmed baptism date')
    expect(doc).toContain('does not apply migrations or change operational RLS')
  })
})
