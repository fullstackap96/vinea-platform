import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request detail core active parish read route', () => {
  it('returns safe request and parishioner fields only after active parish authorization', () => {
    const source = read('app/api/requests/[id]/detail-access/route.ts')

    expect(source).toContain('loadStaffScopedRequestDetailAccess')
    expect(source).toContain('activeParishRequestDetailAccessOptions(request, staff.supabase)')
    expect(source).toContain(".from('requests')")
    expect(source).toContain(".from('parishioners')")
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain(".eq('parish_id', access.parishId)")
    expect(source).toContain('const requestDto = parseRequestDetailRequest({')
    expect(source).toContain('parseRequestDetailParishioner(parishionerRow)')
    expect(source).toContain('request: requestDto')
    expect(source).toContain('parishioner: parishionerDto')
    expect(source).not.toContain(".select('*')")
    expect(source).toContain("'google_calendar_event_html_link'")
    expect(source).toContain(".select('id, full_name, email, phone, parish_id')")
  })

  it('keeps the initial Request Detail load away from browser-side core table reads', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const loadRequestBlock = source.slice(
      source.indexOf('  async function loadRequest()'),
      source.indexOf('  async function toggleChecklistItem')
    )

    expect(loadRequestBlock).toContain("fetch(`/api/requests/${routeId}/detail-access`")
    expect(loadRequestBlock).toContain('const requestData = accessData.request')
    expect(loadRequestBlock).toContain('const parishionerData = accessData.parishioner')
    expect(loadRequestBlock).not.toContain(".from('requests')")
    expect(loadRequestBlock).not.toContain(".from('parishioners')")
    expect(loadRequestBlock).not.toContain(".select('*')")
  })

  it('documents the production-safe read-only boundary', () => {
    const doc = read('docs/REQUEST_DETAIL_CORE_ACTIVE_PARISH_READ_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/detail-access/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('server-owned field allowlists')
    expect(doc).toContain('read-only')
    expect(doc).toContain('apply migrations, or change operational RLS')
  })
})
