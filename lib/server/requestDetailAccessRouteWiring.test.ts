import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const safeLoggingDocPath = 'docs/REQUEST_DETAIL_ACCESS_SAFE_ERROR_LOGGING_20260706.md'

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request detail access active parish authorization wiring', () => {
  it('wires active parish cookie and staff Supabase client into the detail access route', () => {
    const source = read('app/api/requests/[id]/detail-access/route.ts')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain('activeParishRequestDetailAccessOptions(request, staff.supabase)')
    expect(source).toContain('loadStaffScopedRequestDetailAccess')
  })

  it('logs unexpected verification failures safely without returning raw exception text', () => {
    const source = read('app/api/requests/[id]/detail-access/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-detail-access] verification failed'")
    expect(source).toContain("route: '/api/requests/[id]/detail-access'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(')
    expect(source).toContain("error: 'Could not verify request access.'")
    expect(source).not.toContain('const message = error instanceof Error ? error.message')
    expect(source).not.toContain('error: message')
  })

  it('moves the request detail page guard away from browser-side primary parish lookup', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain("fetch(`/api/requests/${routeId}/detail-access`")
    expect(source).not.toContain("import { fetchPrimaryParishId }")
    expect(source).not.toContain('fetchPrimaryParishId(supabase)')
    expect(source).not.toContain('parishes (primary parish id, request detail)')
  })

  it('documents the request detail access safe error logging boundary', () => {
    const doc = read(safeLoggingDocPath)

    expect(doc).toContain('# Request Detail Access Safe Error Logging - 2026-07-06')
    expect(doc).toContain('`app/api/requests/[id]/detail-access/route.ts`')
    expect(doc).toContain('`logServerError`')
    expect(doc).toContain('Preserved active-parish-aware request detail authorization')
    expect(doc).toContain('does not change request detail authorization')
    expect(doc).toContain('Full-suite verification')
  })
})
