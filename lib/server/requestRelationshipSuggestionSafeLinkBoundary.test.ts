import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('request relationship suggestion safe link boundary', () => {
  it('routes request-detail relationship suggestion links through shared entity href helpers', () => {
    const component = readRepoFile(
      'app/dashboard/requests/[id]/_components/RequestRelationshipSuggestions.tsx'
    )
    const helper = readRepoFile('lib/dashboardEntityNavigation.ts')

    expect(component).toContain(
      "import { householdDetailHref, personDetailHref } from '@/lib/dashboardEntityNavigation'"
    )
    expect(component).toContain('href={householdDetailHref(household.householdId)}')
    expect(component).toContain('href={personDetailHref(match.personId)}')
    expect(component).not.toContain('href={`/dashboard/households/${household.householdId}`')
    expect(component).not.toContain('href={`/dashboard/people/${match.personId}`')

    expect(helper).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(helper).toContain('encodeURIComponent(id)')
    expect(helper).toContain('PEOPLE_LIST_FALLBACK_HREF')
    expect(helper).toContain('HOUSEHOLDS_LIST_FALLBACK_HREF')
  })

  it('documents the read-only production safety boundary', () => {
    const doc = readRepoFile('docs/REQUEST_RELATIONSHIP_SUGGESTION_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Request Relationship Suggestion Safe Link Boundary')
    expect(doc).toContain('person and household suggestion links')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(safeHrefDoc).toContain('Request relationship suggestion links')
    expect(buildStatus).toContain('Request Relationship Suggestion Safe Link Boundary')
    expect(roadmap).toContain('Request Relationship Suggestion safe link boundary')
    expect(sourceOfTruth).toContain('Request Relationship Suggestion safe link boundary')
  })
})
