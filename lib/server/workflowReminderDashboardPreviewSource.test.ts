import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Workflow reminder dashboard preview source wiring', () => {
  it('renders a read-only dashboard preview from non-runtime reminder DTOs', () => {
    const dashboard = readRepoFile('app/dashboard/DashboardPageCore.tsx')
    const component = readRepoFile('app/dashboard/DashboardWorkflowReminderPreview.tsx')

    expect(dashboard).toContain("import { DashboardWorkflowReminderPreview }")
    expect(dashboard).toContain("import { buildWorkflowReminderCandidates }")
    expect(dashboard).toContain('const workflowReminderPreview = useMemo')
    expect(dashboard).toContain('<DashboardWorkflowReminderPreview')
    expect(dashboard.indexOf('<DashboardParishHealthScore')).toBeLessThan(
      dashboard.indexOf('<DashboardWorkflowReminderPreview')
    )
    expect(dashboard.indexOf('<DashboardWorkflowReminderPreview')).toBeLessThan(
      dashboard.indexOf('<DashboardTodayView')
    )

    expect(component).toContain('Staff-reviewed reminder preview')
    expect(component).toContain('Nothing here sends')
    expect(component).toContain('No automated sending. No record changes. Dashboard preview only.')
    expect(component).toContain('Review safely')
    expect(component).not.toContain('fetch(')
    expect(component).not.toContain('supabase')
    expect(component).not.toContain('POST')
  })

  it('documents the safe dashboard-only status and remaining automation gates', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Workflow Reminders V1 Dashboard Preview Implemented')
    expect(buildStatus).toContain('read-only dashboard preview')
    expect(buildStatus).toContain('No communications were sent')
    expect(buildStatus).toContain('no automation was enabled')
    expect(roadmap).toContain('Workflow Reminders V1 Dashboard Preview')
    expect(roadmap).toContain('Runtime reminder engine remains future work')
    expect(sourceOfTruth).toContain('Workflow Reminders V1 Dashboard Preview')
    expect(sourceOfTruth).toContain('dashboard-only')
  })
})
