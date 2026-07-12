import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('dashboard today view safe link boundary', () => {
  it('uses upstream sanitized request handoff links instead of rebuilding URLs locally', () => {
    const todayView = readRepoFile('app/dashboard/DashboardTodayView.tsx')
    const careCadence = readRepoFile('lib/careCadence.ts')
    const communicationCommitments = readRepoFile('lib/communicationCommitments.ts')
    const staffCommandCenter = readRepoFile('lib/staffCommandCenter.ts')
    const workflowHref = readRepoFile('lib/requestWorkflowV2.ts')

    expect(todayView).toContain('href: blocked.detailHref')
    expect(todayView).toContain('href: waiting.detailHref')
    expect(todayView).toContain('href: careItem.detailHref')
    expect(todayView).toContain('href: replyItem.detailHref')
    expect(todayView).toContain('href={card.item.href}')
    expect(todayView).not.toContain('`/dashboard/requests/${')
    expect(careCadence).toContain('detailHref: requestWorkflowDetailHref(requestId, anchor)')
    expect(communicationCommitments).toContain('requestDetailHref(requestId, anchor)')
    expect(staffCommandCenter).toContain(
      'detailHref: requestWorkflowDetailHref(requestId, workflow.sectionAnchor)',
    )
    expect(workflowHref).toContain(
      "import { safeDashboardHrefOrFallback } from '@/lib/safeDashboardHref'",
    )
    expect(workflowHref).toContain('safeDashboardHrefOrFallback(')
  })

  it('documents the Today View surface in the shared safe href utility record', () => {
    const doc = readRepoFile('docs/SAFE_DASHBOARD_HREF_UTILITY_20260708.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('Today View')
    expect(doc).toContain('today-view request handoffs')
    expect(buildStatus).toContain('Dashboard Today View Safe Link Boundary')
    expect(roadmap).toContain('Dashboard Today View safe link boundary')
    expect(sourceOfTruth).toContain('Dashboard Today View safe link boundary')
  })
})
