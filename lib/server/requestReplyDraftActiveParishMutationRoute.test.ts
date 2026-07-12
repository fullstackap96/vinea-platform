import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request reply draft active parish mutation route', () => {
  it('updates reply draft only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/reply-draft/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("typeof replyDraft !== 'string'")
    expect(source).toContain(".from('requests')")
    expect(source).toContain('reply_draft: replyDraft')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain('data: updatedRequest')
    expect(source).toContain(".select('id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedRequest?.id')
    expect(source).toContain('Could not update reply draft.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
    expect(source.indexOf('!updatedRequest?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps Request Detail reply draft saves off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helperBlock = source.slice(
      source.indexOf('async function saveReplyDraftToRequest'),
      source.indexOf('async function generateReplyDraft')
    )
    const draftBlock = source.slice(
      source.indexOf('async function generateReplyDraft'),
      source.indexOf('async function saveStaffNotes')
    )

    expect(helperBlock).toContain("fetch(`/api/requests/${routeId}/reply-draft`")
    expect(helperBlock).toContain("method: 'PATCH'")
    expect(helperBlock).toContain("requestDetailClientApiErrorMessage('saveReplyDraft'")
    expect(draftBlock).toContain('await saveReplyDraftToRequest(parsed.body)')
    expect(draftBlock).toContain('await saveReplyDraftToRequest(replyText)')
    expect(draftBlock).toContain('await saveReplyDraftToRequest(body)')
    expect(draftBlock).not.toContain(".from('requests')")
    expect(draftBlock).not.toContain('reply_draft:')
  })

  it('keeps Daily Work Hub follow-up draft persistence on the scoped request route', () => {
    const source = read('app/dashboard/DashboardPageCore.tsx')
    const draftBlock = source.slice(
      source.indexOf('async function runDraftFollowUpCore'),
      source.indexOf('async function runMarkFollowUpAsContactedCore'),
    )

    expect(draftBlock).toContain("fetch(`/api/requests/${encodeURIComponent(id)}/reply-draft`")
    expect(draftBlock).toContain("method: 'PATCH'")
    expect(draftBlock).toContain("credentials: 'include'")
    expect(draftBlock).toContain('replyDraft: replyText')
    expect(draftBlock).toContain("dashboardClientFailureMessage('saveFollowUpDraft')")
    expect(draftBlock).not.toContain(".from('requests')")
    expect(draftBlock).not.toContain('.update({ reply_draft:')
    expect(draftBlock).not.toContain(".eq('id', id)")
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_REPLY_DRAFT_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/reply-draft/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('reply draft')
    expect(doc).toContain('does not call AI or send communications')
  })
})
