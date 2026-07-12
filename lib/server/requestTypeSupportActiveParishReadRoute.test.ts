import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request type support active parish read route', () => {
  it('requires staff auth and selected active parish request ownership before support reads', () => {
    const source = read('app/api/requests/[id]/type-support/route.ts')

    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("return NextResponse.json({ ok: false, error: 'Request not found.' }")
  })

  it('uses server-owned field allowlists and the scoped request id for each support table', () => {
    const source = read('app/api/requests/[id]/type-support/route.ts')

    for (const table of [
      'funeral_request_details',
      'wedding_request_details',
      'ocia_request_details',
      'join_parish_request_details',
      'sacramental_records',
    ]) {
      expect(source).toContain(`.from('${table}')`)
    }

    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.eq(\'request_id\', requestId)')
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).toContain("'confirmed_service_at'")
    expect(source).toContain("'confirmed_ceremony_at'")
    expect(source).toContain("'confirmed_session_at'")
    expect(source).toContain(".select('id, person_name, created_at')")
  })

  it('is read-only and logs safe generic failures', () => {
    const source = read('app/api/requests/[id]/type-support/route.ts')

    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.update(')
    expect(source).not.toContain('.delete(')
    expect(source).toContain("logServerError('[request-type-support] load failed'")
    expect(source).toContain("route: '/api/requests/[id]/type-support'")
    expect(source).toContain("error: 'Could not load request type support.'")
  })

  it('wires Request Detail through the route without initial browser-side type support reads', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const loadRequestBlock = source.slice(
      source.indexOf('  async function loadRequest()'),
      source.indexOf('  async function toggleChecklistItem')
    )

    expect(loadRequestBlock).toContain("fetch(`/api/requests/${routeId}/type-support`")
    expect(loadRequestBlock).toMatch(
      /requestDetailClientApiErrorMessage\(\s*'loadRequestTypeSupport'/,
    )
    expect(loadRequestBlock).not.toContain(".from('funeral_request_details')")
    expect(loadRequestBlock).not.toContain(".from('wedding_request_details')")
    expect(loadRequestBlock).not.toContain(".from('ocia_request_details')")
    expect(loadRequestBlock).not.toContain(".from('join_parish_request_details')")
    expect(loadRequestBlock).not.toContain(".from('sacramental_records')")
    expect(loadRequestBlock).not.toContain('ensureOciaRequestDetailsIfMissing(supabase, String(requestData.id))')
  })

  it('documents the production-safe read-only boundary', () => {
    const doc = read('docs/REQUEST_TYPE_SUPPORT_ACTIVE_PARISH_READ_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/type-support/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('read-only')
    expect(doc).toContain('does not insert, update, delete, or upsert')
    expect(doc).toContain('apply migrations, or change operational RLS')
  })
})
