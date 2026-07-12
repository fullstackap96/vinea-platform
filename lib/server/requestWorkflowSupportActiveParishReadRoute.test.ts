import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), 'utf8')
}

describe('request workflow support active parish read route', () => {
  it('loads checklist items and workflow steps only after active-parish-aware request detail authorization', () => {
    const source = read('app/api/requests/[id]/workflow-support/route.ts')

    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('loadStaffScopedRequestDetailAccess')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain(".from('checklist_items')")
    expect(source).toContain(".select('id, item_name, is_complete, created_at')")
    expect(source).toContain(".from('request_workflow_steps')")
    expect(source).toContain(
      "'id, phase, title, description, owner_type, required, status, due_date, sort_order, created_at'"
    )
    expect(source).toContain(".eq('request_id', access.requestId)")
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain(".eq('request_id', requestId)")
  })

  it('logs unexpected workflow support failures safely without returning raw exception text', () => {
    const source = read('app/api/requests/[id]/workflow-support/route.ts')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[request-workflow-support] load failed'")
    expect(source).toContain("route: '/api/requests/[id]/workflow-support'")
    expect(source).toContain('hasRequestId: Boolean(requestId)')
    expect(source).toContain('activeParishCookiePresent: Boolean(activeParishId)')
    expect(source).toContain("error: 'Could not load request workflow support.'")
    expect(source).not.toContain('error.message')
    expect(source).not.toContain('error: String(')
  })

  it('moves initial checklist and workflow-step loading away from browser-side Supabase reads', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain("fetch(`/api/requests/${routeId}/workflow-support`")
    expect(source).toMatch(
      /requestDetailClientApiErrorMessage\(\s*'loadWorkflowSupport'/,
    )
    expect(source).toContain("requestDetailClientFailureMessage('loadWorkflowSupport')")
    expect(source).not.toContain(".from('checklist_items')\n      .select('*')")
    expect(source).not.toContain(".from('request_workflow_steps')\n      .select(")
  })

  it('documents the read-only active parish workflow support boundary', () => {
    const doc = read('docs/REQUEST_WORKFLOW_SUPPORT_ACTIVE_PARISH_READ_ROUTE_20260708.md')

    expect(doc).toContain('# Request Workflow Support Active Parish Read Route - 2026-07-08')
    expect(doc).toContain('`app/api/requests/[id]/workflow-support/route.ts`')
    expect(doc).toContain('`loadStaffScopedRequestDetailAccess`')
    expect(doc).toContain('server-owned field allowlists')
    expect(doc).toContain('read-only')
    expect(doc).toContain('does not mutate checklist items or workflow steps')
  })
})
