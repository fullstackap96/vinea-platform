import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard follow-up queue safe link boundary', () => {
  it('keeps follow-up queue request links on the shared request detail helper', () => {
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const navigation = readRepoFile('lib/dashboardRequestNavigation.ts')

    expect(dashboard).toContain(
      "import { dashboardRequestOpenLabel, requestDetailHref } from '@/lib/dashboardRequestNavigation'"
    )
    expect(dashboard).toContain('const detailHref = requestDetailHref(id)')
    expect(dashboard).toContain('href={detailHref}')
    expect(dashboard).not.toContain('const requestDetailHref = `/dashboard/requests/${encodeURIComponent(id)}`')

    expect(navigation).toContain(
      "import { safeDashboardHref, safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(navigation).toContain('safeDashboardHrefOrFallback(')
    expect(navigation).toContain('encodeURIComponent(id)')
  })

  it('documents the follow-up queue as read-only request navigation hardening', () => {
    const doc = readRepoFile('docs/DASHBOARD_REQUEST_NAVIGATION_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Follow-Up Queue request links')
    expect(doc).toContain('does not mutate records')
    expect(safeHrefDoc).toContain('follow-up queue request links')
    expect(buildStatus).toContain('Dashboard Follow-Up Queue Safe Link Boundary')
    expect(roadmap).toContain('Dashboard Follow-Up Queue safe link boundary')
    expect(sourceOfTruth).toContain('Dashboard Follow-Up Queue safe link boundary')
  })
})
