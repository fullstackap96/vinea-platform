import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Daily Work Hub overview source wiring', () => {
  it('renders the daily overview before the older detailed home work cards', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain("import { DashboardDailyWorkHubOverview }")
    expect(source).toContain("import { buildDailyWorkHubOverview }")
    expect(source).toContain('const dailyWorkHubOverview = useMemo')
    expect(source).toContain('operatingSignals: dailyOperatingSignals.healthSignals')
    expect(source.indexOf('<DashboardDailyWorkHubOverview')).toBeLessThan(
      source.indexOf('<DashboardTodayView')
    )
  })

  it('renders read-only request-to-record continuity in the Daily Work Hub', () => {
    const card = readRepoFile('app/dashboard/DashboardDailyWorkHubOverview.tsx')
    const model = readRepoFile('lib/dailyWorkHubOverview.ts')

    expect(card).toContain('overview.requestToRecordContinuity')
    expect(card).toContain('drilldownLabel')
    expect(card).toContain('drilldownDetail')
    expect(card).toContain('certificate events')
    expect(model).toContain('Request-to-record continuity')
    expect(model).toContain('/dashboard/records?continuity=needs_review')
    expect(model).toContain('Open records needing staff handoff')
    expect(model).toContain('does not link records or issue certificates')

    for (const forbidden of [
      'insert(',
      'update(',
      'delete(',
      'generateCertificate',
      'createSignedUrl',
      'OPENAI_API_KEY',
    ]) {
      expect(card).not.toContain(forbidden)
      expect(model).not.toContain(forbidden)
    }
  })

  it('documents the safe implementation order and production boundaries', () => {
    const plan = readRepoFile('docs/VINEA_DAILY_OPERATING_SYSTEM_IMPLEMENTATION_PLAN_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')

    expect(plan).toContain('Daily Work Hub polish')
    expect(plan).toContain('Parish Health Score V1')
    expect(plan).toContain('No production feature flags are enabled by this plan')
    expect(plan).toContain('certificate-ready and calendar-conflict detection')
    expect(buildStatus).toContain('Daily Work Hub Overview Implemented')
    expect(buildStatus).toContain('Daily Operating Signal Inputs Implemented')
    expect(buildStatus).toContain('Workflow Reminders V1 Runtime Approval Packet Prepared')
    expect(roadmap).toContain('Daily Work Hub Overview')
    expect(roadmap).toContain('Parish Health Score V1')
    expect(roadmap).toContain('Workflow Reminders V1 Dashboard Preview')
    expect(roadmap).toContain('Daily Operating Signal Inputs')
    expect(roadmap).toContain('Workflow Reminders V1 Runtime Approval Packet')
    expect(roadmap).toContain('Workflow Reminders V1 Disposition DTO Foundation')
    expect(roadmap).toContain('Workflow Reminders V1 Runtime Scaffold Implementation Approval Packet')
    expect(roadmap).toContain('Continue Catholic records depth')
  })
})
