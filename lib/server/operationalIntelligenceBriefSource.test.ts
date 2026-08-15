import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('Operational Intelligence Brief source wiring', () => {
  it('renders the read-only operational intelligence brief after reminders on the home dashboard', () => {
    const source = readRepoFile('app/dashboard/DashboardPageCore.tsx')

    expect(source).toContain("import { DashboardOperationalIntelligenceBrief }")
    expect(source).toContain("import { buildOperationalIntelligenceBrief }")
    expect(source).toContain('const operationalIntelligenceBrief = useMemo')
    expect(source.indexOf('<DashboardWorkflowReminderPreview')).toBeLessThan(
      source.indexOf('<DashboardOperationalIntelligenceBrief')
    )
    expect(source.indexOf('<DashboardTodayView')).toBeLessThan(
      source.indexOf('<DashboardOperationalIntelligenceBrief')
    )
  })

  it('keeps operational intelligence read-only and staff-reviewed in source language', () => {
    const helper = readRepoFile('lib/operationalIntelligenceBrief.ts')
    const component = readRepoFile('app/dashboard/DashboardOperationalIntelligenceBrief.tsx')

    expect(helper).toContain('This is read-only guidance')
    expect(helper).toContain('It does not send reminders')
    expect(helper).toContain('make sacramental/canonical decisions')
    expect(helper).toContain('unlinkedSacramentalRecordCount')
    expect(helper).toContain('/dashboard/records?continuity=needs_review')
    expect(helper).toContain('verify request links manually')
    expect(helper).toContain(
      'No sacramental records in the selected parish currently need request-to-record continuity review'
    )
    expect(helper).toContain('no selected-parish sacramental record rows currently need request-link review')
    expect(component).toContain('Staff-reviewed guidance')
    expect(component).toContain('Safe-use boundaries')
    expect(`${helper}\n${component}`).not.toMatch(
      /\.insert\(|\.update\(|\.delete\(|createSignedUrl|OPENAI_API_KEY|VINEA_EXPORT_RUNTIME=ENABLED/
    )
  })

  it('documents the live slice without production-sensitive claims', () => {
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const ssot = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Operational Intelligence Brief Implemented')
    expect(roadmap).toContain('Operational Intelligence Brief')
    expect(ssot).toContain('Operational Intelligence Brief')
    expect(buildStatus).toContain('does not send communications')
    expect(buildStatus).toContain('apply migrations')
    expect(buildStatus).toContain('make sacramental or canonical decisions')
  })
})
