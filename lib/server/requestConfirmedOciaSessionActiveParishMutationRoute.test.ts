import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request confirmed OCIA session active parish mutation route', () => {
  it('ensures and updates only confirmed OCIA session after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/confirmed-ocia-session/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('optionalDateTime')
    expect(source).toContain("error: 'Invalid confirmed OCIA session update.'")
    expect(source).toContain(".select('id, request_type')")
    expect(source).toContain("String(requestRow?.request_type ?? '') !== 'ocia'")
    expect(source).toContain('ensureOciaRequestDetailsIfMissing(admin, access.requestId)')
    expect(source).toContain("error: 'Could not prepare the OCIA intake record.'")
    expect(source).toContain(".from('ocia_request_details')")
    expect(source).toContain('confirmed_session_at: confirmedSessionAt')
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).toContain('data: updatedDetail')
    expect(source).toContain(".select('request_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedDetail?.request_id')
    expect(source).toContain('Could not update confirmed OCIA session.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.delete(')
    expect(source).not.toContain('.upsert(')

    expect(source.indexOf('!updatedDetail?.request_id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps the Request Detail confirmed OCIA session save and clear off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helper = source.slice(
      source.indexOf('async function runScheduleMutation'),
      source.indexOf('async function saveSuggestedDates'),
    )
    const block = source.slice(
      source.indexOf('async function saveConfirmedOciaSession'),
      source.indexOf('async function logCommunication'),
    )

    expect(block.match(/await runScheduleMutation\(\{/g)).toHaveLength(2)
    expect(block).toContain("action: 'saveOciaSession'")
    expect(block).toContain("action: 'clearOciaSession'")
    expect(block.match(/endpoint: `\/api\/requests\/\$\{routeId\}\/confirmed-ocia-session`/g)).toHaveLength(2)
    expect(helper).toContain("method: 'PATCH'")
    expect(helper).toContain('requestDetailClientApiErrorMessage(action, data?.error)')
    expect(block).not.toContain('ensureOciaRequestDetailsIfMissing(supabase')
    expect(block).not.toContain(".from('ocia_request_details')")
    expect(block).not.toContain('confirmed_session_at:')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_CONFIRMED_OCIA_SESSION_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/confirmed-ocia-session/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('create-if-missing behavior')
    expect(doc).toContain('confirmed OCIA session')
    expect(doc).toContain('does not touch Google Calendar data')
  })
})
