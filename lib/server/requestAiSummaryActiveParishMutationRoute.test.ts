import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('request AI summary active parish mutation route', () => {
  it('updates AI summary only after staff auth and active parish request ownership', () => {
    const source = read('app/api/requests/[id]/ai-summary/route.ts')

    expect(source).toContain('export async function PATCH')
    expect(source).toContain('params: Promise<{ id: string }>')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('loadStaffScopedRequestDetailAccess(admin, requestId')
    expect(source).toContain('staffSupabase: staff.supabase')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(source).toContain("typeof aiSummary !== 'string'")
    expect(source).toContain(".from('requests')")
    expect(source).toContain('ai_summary: aiSummary')
    expect(source).toContain(".eq('id', access.requestId)")
    expect(source).toContain('data: updatedRequest')
    expect(source).toContain(".select('id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('!updatedRequest?.id')
    expect(source).toContain('Could not update AI summary.')
    expect(source).not.toContain(".select('*')")
    expect(source).not.toContain('.insert(')
    expect(source).not.toContain('.upsert(')
    expect(source).not.toContain('.delete(')
    expect(source.indexOf('!updatedRequest?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
  })

  it('keeps Request Detail AI summary persistence off browser-side Supabase mutations', () => {
    const source = read('app/dashboard/requests/[id]/page.tsx')
    const helperBlock = source.slice(
      source.indexOf('async function saveAiSummaryToRequest'),
      source.indexOf('async function saveReplyDraftToRequest')
    )
    const summaryBlock = source.slice(
      source.indexOf('async function generateSummary'),
      source.indexOf('async function saveAiSummaryToRequest')
    )

    expect(helperBlock).toContain("fetch(`/api/requests/${routeId}/ai-summary`")
    expect(helperBlock).toContain("method: 'PATCH'")
    expect(helperBlock).toContain("requestDetailClientApiErrorMessage('saveAiSummary'")
    expect(helperBlock).toContain("requestDetailClientFailureMessage('saveAiSummary')")
    expect(summaryBlock).toContain('await saveAiSummaryToRequest(summaryText)')
    expect(summaryBlock).not.toContain(".from('requests')")
    expect(summaryBlock).not.toContain('ai_summary:')
  })

  it('allows only curated API messages for the AI summary save route', () => {
    const source = read('lib/requestDetailClientMessages.ts')

    expect(source).toContain("| 'saveAiSummary'")
    expect(source).toContain('saveAiSummary: new Set')
    expect(source).toContain('Invalid AI summary update.')
    expect(source).toContain('Could not update AI summary.')
  })

  it('documents the production-safe mutation boundary', () => {
    const doc = read('docs/REQUEST_AI_SUMMARY_ACTIVE_PARISH_MUTATION_ROUTE_20260708.md')

    expect(doc).toContain('`app/api/requests/[id]/ai-summary/route.ts`')
    expect(doc).toContain('active parish')
    expect(doc).toContain('request ownership')
    expect(doc).toContain('AI summary')
    expect(doc).toContain('does not call OpenAI')
  })
})
