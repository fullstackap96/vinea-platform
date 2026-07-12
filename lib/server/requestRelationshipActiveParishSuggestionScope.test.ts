import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('request relationship active parish suggestion scope', () => {
  it('keeps request person-link lookups scoped to the selected request parish', () => {
    const source = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx'
    )
    const route = readRepoFile(
      'app/api/requests/[id]/relationship-suggestions/route.ts'
    )
    const page = readRepoFile('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain('requestParishId: string | null | undefined')
    expect(source).toContain('const resolvedRequestParishId =')
    expect(source).toContain("if (!resolvedRequestParishId)")
    expect(source).toContain('/relationship-suggestions')
    expect(source).toContain("credentials: 'include'")
    expect(source).not.toContain("from '@/lib/supabase'")
    expect(source).not.toContain('supabase.')
    expect(route).toContain('loadStaffScopedRequestDetailAccess')
    expect(route).toContain('activeParishId')
    expect(route).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(route).toContain(".eq('id', personId)")
    expect(route).toContain(".eq('parish_id', access.parishId)")
    expect(route).toContain(".eq('parishioner_id', parishionerId)")
    expect(page).toContain('requestParishId={request?.parish_id != null ? String(request.parish_id) : null}')
  })

  it('keeps request relationship suggestions scoped to the selected request parish', () => {
    const source = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestRelationshipSuggestions.tsx'
    )
    const route = readRepoFile(
      'app/api/requests/[id]/relationship-suggestions/route.ts'
    )
    const page = readRepoFile('app/dashboard/requests/[id]/page.tsx')

    expect(source).toContain('requestParishId: string | null | undefined')
    expect(source).toContain('const resolvedRequestParishId =')
    expect(source).toContain("if (!resolvedRequestParishId)")
    expect(source).toContain('/relationship-suggestions')
    expect(source).toContain("credentials: 'include'")
    expect(source).not.toContain("from '@/lib/supabase'")
    expect(source).not.toContain('supabase.')
    expect(route).toContain(".from('people')")
    expect(route).toContain(".from('household_members')")
    expect(route.split(".eq('parish_id', access.parishId)").length - 1).toBeGreaterThanOrEqual(3)
    expect(route).toContain('matchPeopleForRequest')
    expect(route).toContain('suggestHouseholdsForPerson')
    expect(page).toContain('requestParishId={request?.parish_id != null ? String(request.parish_id) : null}')
  })

  it('documents the production-safe boundary in current state docs', () => {
    const doc = readRepoFile('docs/REQUEST_RELATIONSHIP_ACTIVE_PARISH_SUGGESTION_SCOPE_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Request Relationship Active Parish Suggestion Scope')
    expect(doc).toContain('selected request parish')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('Request Relationship Active Parish Suggestion Scope')
    expect(roadmap).toContain('Request Relationship Active Parish Suggestion Scope')
    expect(sourceOfTruth).toContain('Request Relationship Active Parish Suggestion Scope')
  })
})
