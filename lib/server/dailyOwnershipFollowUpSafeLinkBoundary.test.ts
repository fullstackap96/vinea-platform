import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('daily ownership and follow-up safe link boundary', () => {
  it('keeps ownership health, ops brief, and communication commitments on the shared dashboard href utility', () => {
    const ownership = readRepoFile('lib/ownershipHealth.ts')
    const opsBrief = readRepoFile('lib/parishOpsBrief.ts')
    const commitments = readRepoFile('lib/communicationCommitments.ts')

    expect(ownership).toContain("import { safeDashboardHref } from '@/lib/safeDashboardHref'")
    expect(ownership).toContain('safeDashboardHref(')
    expect(opsBrief).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(opsBrief).toContain('safeDashboardHrefOrFallback(row.detailHref')
    expect(commitments).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(commitments).toContain('encodeURIComponent(requestId)')
    expect(commitments).toContain('requestDetailHref(requestId, anchor)')
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/DAILY_OWNERSHIP_FOLLOW_UP_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Daily Ownership Follow-Up Safe Link Boundary')
    expect(roadmap).toContain('Daily Ownership Follow-Up safe link boundary')
    expect(sourceOfTruth).toContain('Daily Ownership Follow-Up safe link boundary')
  })
})
