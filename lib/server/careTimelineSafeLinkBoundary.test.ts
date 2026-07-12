import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('care timeline safe link boundary', () => {
  it('keeps care timeline links on the shared dashboard href utility', () => {
    const source = readRepoFile('lib/careTimeline.ts')

    expect(source).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(source).toContain('function requestDetailHref(')
    expect(source).toContain('function recordDetailHref(')
    expect(source).toContain('function householdDetailHref(')
    expect(source).toContain('safeDashboardHrefOrFallback(')
    expect(source).toContain('encodeURIComponent(id)')
    expect(source).not.toContain('href: `/dashboard/requests/${encodeURIComponent(request.id)}`')
    expect(source).not.toContain(
      'href: `/dashboard/requests/${encodeURIComponent(communication.requestId)}#communication-history`'
    )
    expect(source).not.toContain('href: `/dashboard/records/${encodeURIComponent(record.id)}`')
    expect(source).not.toContain(
      'href: `/dashboard/households/${encodeURIComponent(household.householdId)}`'
    )
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/CARE_TIMELINE_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Care Timeline')
    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Care Timeline Safe Link Boundary')
    expect(roadmap).toContain('Care Timeline safe link boundary')
    expect(sourceOfTruth).toContain('Care Timeline safe link boundary')
  })
})
