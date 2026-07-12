import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request notes active parish read route', () => {
  it('loads internal request notes only after active-parish-aware request detail authorization', () => {
    const source = read('app/api/requests/[id]/notes/route.ts')

    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('loadStaffScopedRequestDetailAccess')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain(".from('request_notes')")
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).not.toContain(".eq('request_id', requestId)")
  })

  it('logs unexpected note load failures safely without returning raw exception text', () => {
    const source = read('app/api/requests/[id]/notes/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-notes] load failed'")
    expect(source).toContain("route: '/api/requests/[id]/notes'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(activeParishId)')
    expect(source).toContain("error: 'Could not load request notes.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: String(')
  })

  it('moves the request detail page note history read away from browser-side Supabase access', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain("fetch(`/api/requests/${routeId}/notes`")
    expect(source).toContain("requestDetailClientApiErrorMessage('loadRequestNotes', notesData?.error)")
    expect(source).toContain("requestDetailClientFailureMessage('loadRequestNotes')")
    expect(source).not.toContain(".from('request_notes')")
  })

  it('documents the read-only active parish scope boundary', () => {
    const doc = read('docs/REQUEST_NOTES_ACTIVE_PARISH_READ_ROUTE_20260708.md')

    expect(doc).toContain('# Request Notes Active Parish Read Route - 2026-07-08')
    expect(doc).toContain('`app/api/requests/[id]/notes/route.ts`')
    expect(doc).toContain('`loadStaffScopedRequestDetailAccess`')
    expect(doc).toContain('authorized `access.requestId`')
    expect(doc).toContain('read-only')
    expect(doc).toContain('does not mutate notes')
  })
})
