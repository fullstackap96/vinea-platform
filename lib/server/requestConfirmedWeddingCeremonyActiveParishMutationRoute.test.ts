import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request confirmed wedding ceremony active parish mutation route', () => {
  it('updates only confirmed wedding ceremony after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/confirmed-wedding-ceremony/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('optionalDateTime')
    expect(source).toContain("error: 'Invalid confirmed wedding ceremony update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? '') !== 'wedding'")
    expect(source).toContain(".from('wedding_request_details')")
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('confirmed_ceremony_at: confirmedCeremonyAt')
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).toContain('data: updatedDetail')
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedDetail?.request_id')
    expect(source).toContain('Could not update confirmed wedding ceremony.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')

    expect(source.indexOf('!updatedDetail?.request_id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail confirmed wedding ceremony save and clear off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const block = source.slice(
      source.indexOf('async function saveConfirmedWeddingCeremony'),
      source.indexOf('async function saveConfirmedOciaSession')
    )

    expect(block).toContain("fetch(`/api/requests/${routeId}/confirmed-wedding-ceremony`")
    expect(block).toContain("method: 'PATCH'")
    expect(block).toContain("requestDetailClientApiErrorMessage('saveWeddingCeremony'")
    expect(block).toContain("requestDetailClientApiErrorMessage('clearWeddingCeremony'")
    expect(block).toContain("requestDetailClientFailureMessage('saveWeddingCeremony')")
    expect(block).toContain("requestDetailClientFailureMessage('clearWeddingCeremony')")
    expect(block).not.toContain(".from('wedding_request_details')")
    expect(block).not.toContain('confirmed_ceremony_at:')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read(
      'docs/REQUEST_CONFIRMED_WEDDING_CEREMONY_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md'
    )

    expect(doc).toContain('`app/api/requests/[id]/confirmed-wedding-ceremony/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request detail access loader')
    expect(doc).toContain('confirmed wedding ceremony')
    expect(doc).toContain('does not touch Google Calendar data')
  })
})
