import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request suggested dates active parish mutation route', () => {
  it('updates only suggested date fields after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/suggested-dates/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('optionalDateTime')
    expect(source).toContain("error: 'Invalid suggested dates update.'")
    expect(source).toContain(".from('requests')")
    expect(source).toContain('suggested_date_1: suggestedDate1')
    expect(source).toContain('suggested_date_2: suggestedDate2')
    expect(source).toContain('suggested_date_3: suggestedDate3')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain('data: updatedRequest')
    expect(source).toContain(".select('id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedRequest?.id')
    expect(source).toContain('Could not update suggested dates.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
    expect(source.indexOf('!updatedRequest?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail suggested date save off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helper = source.slice(
      source.indexOf('async function runScheduleMutation'),
      source.indexOf('async function saveSuggestedDates'),
    )
    const block = source.slice(
      source.indexOf(' async function saveSuggestedDates'),
      source.indexOf('async function saveConfirmedBaptismDate'),
    )

    expect(block).toContain('await runScheduleMutation({')
    expect(block).toContain("action: 'saveSuggestedDates'")
    expect(block).toContain("endpoint: `/api/requests/${routeId}/suggested-dates`")
    expect(helper).toContain("method: 'PATCH'")
    expect(helper).toContain('requestDetailClientApiErrorMessage(action, data?.error)')
    expect(block).not.toContain(".from('requests')")
    expect(block).not.toContain('suggested_date_1:')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_SUGGESTED_DATES_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/suggested-dates/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('suggested dates')
    expect(doc).toContain('does not apply migrations or change operational RLS')
  })
})
