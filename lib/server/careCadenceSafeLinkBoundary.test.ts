import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('care cadence safe link boundary', () => {
  it('keeps care cadence request links on the shared request workflow href helper', () => {
    const helper = readRepoFile('lib/careCadence.ts')
    const workflowHref = readRepoFile('lib/requestWorkflowV2.ts')
    const component = readRepoFile('app/dashboard/DashboardCareCadence.tsx')

    expect(helper).toContain(
      "import { requestWorkflowDetailHref } from '@/lib/requestWorkflowV2'",
    )
    expect(helper).toContain('detailHref: requestWorkflowDetailHref(requestId, anchor)')
    expect(workflowHref).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
    )
    expect(workflowHref).toContain('safeDashboardHrefOrFallback(')
    expect(component).toContain('href={row.detailHref}')
    expect(component).not.toContain('`/dashboard/requests/${')
  })

  it('documents the care cadence surface in the shared safe href utility record', () => {
    const doc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Care Cadence')
    expect(doc).toContain('request detail handoffs')
    expect(buildStatus).toContain('Care Cadence Safe Link Boundary')
    expect(roadmap).toContain('Care Cadence safe link boundary')
    expect(sourceOfTruth).toContain('Care Cadence safe link boundary')
  })
})
