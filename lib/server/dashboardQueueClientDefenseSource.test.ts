import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('dashboard queue client defense-in-depth boundary', () => {
  it('keeps Communications and Intake clients on action-specific allowlists', () => {
    const communications = read(
      'app/dashboard/communications/DashboardCommunicationsPageClient.tsx',
    )
    const intake = read('app/dashboard/intake/DashboardIntakePageClient.tsx')

    expect(communications).toContain(
      "dashboardQueueClientErrorMessage('communicationTouchpoint', result.error)",
    )
    expect(communications).toContain(
      "dashboardQueueClientErrorMessage('communicationFollowUp', result.error)",
    )
    expect(intake).toContain(
      "dashboardQueueClientErrorMessage('intakeRequestTriage', result.error)",
    )
    expect(intake).toContain(
      "dashboardQueueClientErrorMessage('intakeMassIntentionTriage', result.error)",
    )
  })

  it('keeps Daily Work Hub row failures on safe action messages', () => {
    const source = read('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain("dashboardClientErrorMessage('draftFollowUp', result.error)")
    expect(source).toContain(
      "dashboardClientErrorMessage('updateFollowUpContactedSummary', result.error)",
    )
    expect(source).toContain(
      "dashboardClientErrorMessage('markFollowUpContacted', result.error)",
    )
  })

  it('keeps batch failure summaries free of raw request ids and preserves failed selection', () => {
    const source = read('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain(
      'Failed items remain selected for individual review.',
    )
    expect(source).toContain('setSelectedFollowUpIds(new Set(failedIds))')
    expect(source).not.toContain('failures.push(`${id}:')
    expect(source).not.toContain("failures.join(' ')")
  })

  it('documents the client defense and production no-go boundary', () => {
    const doc = read('docs/DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_20260710.md')
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(doc).toContain('DASHBOARD_QUEUE_CLIENT_DEFENSE_IN_DEPTH_IMPLEMENTED_20260710')
    expect(doc).toContain('Production-sensitive features approved by this boundary: `NO`')
    expect(buildStatus).toContain('Dashboard Queue Client Defense In Depth - 2026-07-10')
    expect(roadmap).toContain('Dashboard Queue Client Defense In Depth boundary')
    expect(sourceOfTruth).toContain('Dashboard Queue Client Defense In Depth boundary')
  })
})
