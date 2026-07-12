import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Parish Health Score source wiring', () => {
  it('renders the health score from existing dashboard signals after the daily overview', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain("import { DashboardParishHealthScore }")
    expect(source).toContain("import { buildParishHealthScore }")
    expect(source).toContain('const parishHealthScore = useMemo')
    expect(source.indexOf('<DashboardDailyWorkHubOverview')).toBeLessThan(
      source.indexOf('<DashboardParishHealthScore')
    )
    expect(source).toContain('staffCommandCenter')
    expect(source).toContain('parishOpsBrief')
    expect(source).toContain('communicationCommitments')
  })

  it('keeps signal coverage and safety boundaries explicit in the score component and status docs', () => {
    const component = readRepoFile('app/dashboard/DashboardParishHealthScore.tsx')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const ssot = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(component).toContain('Signal coverage')
    expect(component).toContain('Explainable operations health')
    expect(component).toContain('recordsContinuityEmptyState')
    expect(readRepoFile('lib/requestRecordContinuityEmptyState.ts')).toContain(
      'No records currently need request-link review'
    )
    expect(readRepoFile('lib/parishHealthScore.ts')).toContain(
      'No sacramental records in the selected parish currently need request-to-record continuity review.'
    )
    expect(readRepoFile('lib/parishHealthScore.ts')).toContain(
      'no selected-parish record rows need request-link review'
    )
    expect(buildStatus).toContain('Parish Health Score V1 Implemented')
    expect(buildStatus).toContain('Daily Operating Signal Inputs Implemented')
    expect(buildStatus).toContain('Dashboard Continuity Empty-State Cue Implemented')
    expect(buildStatus).toContain('No records currently need request-link review')
    expect(buildStatus).toContain('does not link records, generate certificates, send reminders')
    expect(roadmap).toContain('the 2026-07-02 Parish Health Score V1')
    expect(roadmap).toContain('Dashboard Continuity Empty-State Cue')
    expect(ssot).toContain('Parish Health Score continuity-clear empty-state cue')
    expect(ssot).toContain('does not link records, generate certificates, send reminders')
  })
})
