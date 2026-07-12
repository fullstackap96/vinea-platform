import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request communications active parish read route', () => {
  it('loads communication history only after active-parish-aware request detail authorization', () => {
    const source = read('app/api/requests/[id]/communications/route.ts')

    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('loadStaffScopedRequestDetailAccess')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain(".from('request_communications')")
    expect(source).toContain(".select('id, contacted_at, method, notes, created_at')")
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain(".eq('request_id', requestId)")
  })

  it('logs unexpected communication load failures safely without returning raw exception text', () => {
    const source = read('app/api/requests/[id]/communications/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-communications] load failed'")
    expect(source).toContain("route: '/api/requests/[id]/communications'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(activeParishId)')
    expect(source).toContain("error: 'Could not load request communication history.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: String(')
  })

  it('moves initial communication history loading away from browser-side Supabase reads', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain("fetch(`/api/requests/${routeId}/communications`")
    expect(source).toContain(
      "requestDetailClientApiErrorMessage('loadCommunications', communicationsData?.error)"
    )
    expect(source).toContain("requestDetailClientFailureMessage('loadCommunications')")
    expect(source).not.toContain(".from('request_communications')\n      .select('*')")
  })

  it('documents the read-only active parish communication history boundary', () => {
    const doc = read('docs/REQUEST_COMMUNICATIONS_ACTIVE_PARISH_READ_ROUTE_20260708.md')

    expect(doc).toContain('# Request Communications Active Parish Read Route - 2026-07-08')
    expect(doc).toContain('`app/api/requests/[id]/communications/route.ts`')
    expect(doc).toContain('`loadStaffScopedRequestDetailAccess`')
    expect(doc).toContain('server-owned communication history allowlist')
    expect(doc).toContain('read-only')
    expect(doc).toContain('does not mutate communications')
  })
})
