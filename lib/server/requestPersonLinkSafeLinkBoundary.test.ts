import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('request person link safe link boundary', () => {
  it('keeps request person link server actions behind active-parish request ownership checks', () => {
    const source = readRepoFile('app/dashboard/requests/actions.ts')
    const accessCalls = source.match(/loadRequestActionAccess\(supabase, id\)/g) ?? []

    expect(source).toContain("loadStaffScopedRequestDetailAccess")
    expect(source).toContain('async function loadRequestActionAccess')
    expect(source).toContain('activeParishId')
    expect(source).toContain('allowPrimaryParishFallback: !activeParishId')
    expect(accessCalls).toHaveLength(2)
    expect(source).toContain("return { ok: false, error: 'Request not found.' }")
    expect(source).toContain(".eq('parish_id', parishId)")
    expect(source).toContain(".eq('parish_id', access.parishId)")
    expect(source).toContain('parish_id: access.parishId')
    expect(source).not.toContain('resolveStaffWriteParishContext')
  })

  it('keeps the request-detail linked-person profile link on the shared entity href helper', () => {
    const source = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestPersonLinkSection.tsx'
    )
    const helper = readRepoFile('lib/dashboardEntityNavigation.ts')

    expect(source).toContain("import { personDetailHref } from '@/lib/dashboardEntityNavigation'")
    expect(source).toContain('href={personDetailHref(linkedPerson.id)}')
    expect(source).not.toContain('href={`/dashboard/people/${linkedPerson.id}`')

    expect(helper).toContain('export function personDetailHref(personId: unknown): string')
    expect(helper).toContain('safeDashboardHrefOrFallback(')
    expect(helper).toContain('encodeURIComponent(id)')
    expect(helper).toContain('PEOPLE_LIST_FALLBACK_HREF')
  })

  it('documents the read-only production safety boundary', () => {
    const doc = readRepoFile('docs/REQUEST_PERSON_LINK_SAFE_LINK_BOUNDARY_20260708.md')
    const actionScopeDoc = readRepoFile(
      'docs/REQUEST_PERSON_LINK_ACTIVE_PARISH_SERVER_ACTIONS_20260708.md'
    )
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Request Person Link Safe Link Boundary')
    expect(doc).toContain('linked-person profile link')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(actionScopeDoc).toContain('Request Person Link Active Parish Server Actions')
    expect(actionScopeDoc).toContain('loadStaffScopedRequestDetailAccess')
    expect(actionScopeDoc).toContain('verified request parish')
    expect(safeHrefDoc).toContain('Request linked-person profile links')
    expect(buildStatus).toContain('Request Person Link Safe Link Boundary')
    expect(buildStatus).toContain('Request Person Link Active Parish Server Actions')
    expect(roadmap).toContain('Request Person Link safe link boundary')
    expect(roadmap).toContain('Request Person Link Active Parish Server Actions')
    expect(sourceOfTruth).toContain('Request Person Link safe link boundary')
    expect(sourceOfTruth).toContain('Request Person Link Active Parish Server Actions')
  })
})
