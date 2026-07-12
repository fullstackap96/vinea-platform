import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('role work hub safe link boundary', () => {
  it('keeps role work hub request links on the staff command center href path', () => {
    const roleHub = readRepoFile('lib/dashboardRoleWorkHub.ts')
    const commandCenter = readRepoFile('lib/staffCommandCenter.ts')
    const workflowHref = readRepoFile('lib/requestWorkflowV2.ts')
    const component = readRepoFile('app/dashboard/DashboardRoleWorkHub.tsx')

    expect(roleHub).toContain('detailHref: row.detailHref')
    expect(roleHub).not.toContain('`/dashboard/requests/${')
    expect(commandCenter).toContain(
      "requestWorkflowDetailHref(requestId, workflow.sectionAnchor)",
    )
    expect(workflowHref).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
    )
    expect(workflowHref).toContain('safeDashboardHrefOrFallback(')
    expect(component).toContain('href={item.detailHref}')
    expect(component).not.toContain('`/dashboard/requests/${')
  })

  it('documents the role work hub surface in the shared safe href utility record', () => {
    const doc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Role Work Hub')
    expect(doc).toContain('role-prioritized work handoffs')
    expect(buildStatus).toContain('Role Work Hub Safe Link Boundary')
    expect(roadmap).toContain('Role Work Hub safe link boundary')
    expect(sourceOfTruth).toContain('Role Work Hub safe link boundary')
  })
})
