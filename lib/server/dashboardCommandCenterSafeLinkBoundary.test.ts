import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard command center safe link boundary', () => {
  it('keeps command center request links on sanitized StaffCommandCenter DTO links', () => {
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const commandCenter = readRepoFile('lib/staffCommandCenter.ts')
    const workflow = readRepoFile('lib/requestWorkflowV2.ts')

    expect(dashboard).toContain('function renderCommandCenterRow(row: StaffCommandCenterRow)')
    expect(dashboard).toContain('href={row.detailHref}')
    expect(dashboard).not.toContain('href={`/dashboard/requests/${row.requestId}`')
    expect(dashboard).not.toContain('encodeURIComponent(row.requestId)')

    expect(commandCenter).toContain("import {")
    expect(commandCenter).toContain('requestWorkflowDetailHref,')
    expect(commandCenter).toContain(
      'detailHref: requestWorkflowDetailHref(requestId, workflow.sectionAnchor)'
    )
    expect(workflow).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(workflow).toContain('safeDashboardHrefOrFallback(')
  })

  it('documents the command center request handoff as read-only link hardening', () => {
    const doc = readRepoFile('docs/REQUEST_WORKFLOW_DETAIL_HREF_SAFE_LINK_BOUNDARY_20260708.md')
    const safeHrefDoc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('main dashboard command center request links')
    expect(doc).toContain('does not mutate records')
    expect(safeHrefDoc).toContain('main command center request handoffs')
    expect(buildStatus).toContain('Dashboard Command Center Safe Link Boundary')
    expect(roadmap).toContain('Dashboard Command Center safe link boundary')
    expect(sourceOfTruth).toContain('Dashboard Command Center safe link boundary')
  })
})
