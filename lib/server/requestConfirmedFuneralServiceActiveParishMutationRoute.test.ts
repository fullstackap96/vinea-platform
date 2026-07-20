import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request confirmed funeral service active parish mutation route', () => {
  it('updates only confirmed funeral service after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/confirmed-funeral-service/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('optionalDateTime')
    expect(source).toContain("error: 'Invalid confirmed funeral service update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? '') !== 'funeral'")
    expect(source).toContain(".from('funeral_request_details')")
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('confirmed_service_at: confirmedServiceAt')
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).toContain('data: updatedDetail')
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedDetail?.request_id')
    expect(source).toContain('Could not update confirmed funeral service.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')

    expect(source.indexOf('!updatedDetail?.request_id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail confirmed funeral service save and clear off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helper = source.slice(
      source.indexOf('async function runScheduleMutation'),
      source.indexOf('async function saveSuggestedDates'),
    )
    const block = source.slice(
      source.indexOf('async function saveConfirmedFuneralService'),
      source.indexOf('async function saveWeddingDetails'),
    )

    expect(block.match(/await runScheduleMutation\(\{/g)).toHaveLength(2)
    expect(block).toContain("action: 'saveFuneralService'")
    expect(block).toContain("action: 'clearFuneralService'")
    expect(block.match(/endpoint: `\/api\/requests\/\$\{routeId\}\/confirmed-funeral-service`/g)).toHaveLength(2)
    expect(helper).toContain("method: 'PATCH'")
    expect(helper).toContain('requestDetailClientApiErrorMessage(action, data?.error)')
    expect(block).not.toContain(".from('funeral_request_details')")
    expect(block).not.toContain('confirmed_service_at:')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_CONFIRMED_FUNERAL_SERVICE_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/confirmed-funeral-service/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('confirmed funeral service')
    expect(doc).toContain('does not touch Google Calendar data')
  })
})
