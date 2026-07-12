import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('global search safe link boundary', () => {
  it('keeps formatted global search result links on the shared dashboard href utility', () => {
    const source = readRepoFile('lib/globalSearch/formatGlobalSearchResults.ts')

    expect(source).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(source).toContain('function resultHref(')
    expect(source).toContain('safeDashboardHrefOrFallback(')
    expect(source).toContain('encodeURIComponent(normalizedId)')
    expect(source).toContain("resultHref('/dashboard/requests', request.id)")
    expect(source).toContain("resultHref('/dashboard/people', person.id)")
    expect(source).toContain("resultHref('/dashboard/households', household.id)")
    expect(source).toContain("resultHref('/dashboard/records', record.id)")
    expect(source).not.toContain('href: `/dashboard/requests/${request.id}`')
    expect(source).not.toContain('href: `/dashboard/people/${person.id}`')
    expect(source).not.toContain('href: `/dashboard/households/${household.id}`')
    expect(source).not.toContain('href: `/dashboard/records/${record.id}`')
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/GLOBAL_SEARCH_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Global Search')
    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not change operational RLS')
    expect(buildStatus).toContain('Global Search Safe Link Boundary')
    expect(roadmap).toContain('Global Search safe link boundary')
    expect(sourceOfTruth).toContain('Global Search safe link boundary')
  })
})
