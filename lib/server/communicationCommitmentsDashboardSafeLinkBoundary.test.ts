import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('communication commitments dashboard safe link boundary', () => {
  it('keeps the dashboard card on sanitized DTO-provided request links', () => {
    const component = readRepoFile('app/dashboard/DashboardCommunicationCommitments.tsx')
    const commitments = readRepoFile('lib/communicationCommitments.ts')

    expect(component).toContain('href={row.detailHref}')
    expect(component).not.toContain('/dashboard/requests/${')
    expect(component).not.toContain('encodeURIComponent(row.requestId)')

    expect(commitments).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(commitments).toContain('encodeURIComponent(requestId)')
    expect(commitments).toContain('requestDetailHref(requestId, anchor)')
  })

  it('documents the communication follow-up card as read-only link hardening', () => {
    const doc = readRepoFile('docs/DAILY_OWNERSHIP_FOLLOW_UP_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Communication Commitment dashboard card')
    expect(doc).toContain('does not send communications')
    expect(safeHrefDoc).toContain('communication commitment card links')
    expect(buildStatus).toContain('Communication Commitments Dashboard Safe Link Boundary')
    expect(roadmap).toContain('Communication Commitments dashboard safe link boundary')
    expect(sourceOfTruth).toContain('Communication Commitments dashboard safe link boundary')
  })
})
