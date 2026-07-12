import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('request workflow detail href safe link boundary', () => {
  it('keeps shared request workflow detail links on the dashboard-only href utility', () => {
    const workflow = readRepoFile('lib/requestWorkflowV2.ts')
    const carePlans = readRepoFile('lib/carePlans.ts')

    expect(workflow).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'"
    )
    expect(workflow).toContain('REQUEST_WORKFLOW_DETAIL_FALLBACK_HREF')
    expect(workflow).toContain('safeDashboardHrefOrFallback(')
    expect(workflow).toContain('encodeURIComponent(normalizedRequestId)')
    expect(carePlans).toContain("import { requestWorkflowDetailHref } from '@/lib/requestWorkflowV2'")
    expect(carePlans).toContain("requestWorkflowDetailHref(requestId, 'next-follow-up')")
    expect(carePlans).not.toContain("`/dashboard/requests/${encodeURIComponent(requestId)}#next-follow-up`")
  })

  it('documents read-only production safety and current-state references', () => {
    const doc = readRepoFile('docs/REQUEST_WORKFLOW_DETAIL_HREF_SAFE_LINK_BOUNDARY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('requestWorkflowDetailHref')
    expect(doc).toContain('dashboard-internal')
    expect(doc).toContain('does not mutate records')
    expect(doc).toContain('does not send communications')
    expect(buildStatus).toContain('Request Workflow Detail Href Safe Link Boundary')
    expect(roadmap).toContain('Request Workflow Detail Href safe link boundary')
    expect(sourceOfTruth).toContain('Request Workflow Detail Href safe link boundary')
  })
})
