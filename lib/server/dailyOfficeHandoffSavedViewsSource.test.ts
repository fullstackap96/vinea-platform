import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Office Handoff saved-view preset DTO source boundaries', () => {
  it('keeps the saved-view preset DTO planning-only and read-only', () => {
    const source = readRepoFile('lib/dailyOfficeHandoffSavedViews.ts')

    for (const expected of [
      'planning_only_not_persisted',
      'staffReviewed: true',
      'activeParishScoped: true',
      'Front desk opening view',
      'Sacramental records handoff view',
      'Administrator closeout view',
      'already active-parish-scoped Daily Office Handoff Digest',
      'do not persist user preferences',
      'Staff choose whether to use a handoff view',
      'not sacramental, canonical',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      'createClient(',
      'fetch(',
      '.insert(',
      '.update(',
      '.delete(',
      'upsert(',
      'createSignedUrl',
      'OpenAI',
      'resend',
      '/api/exports',
      '/api/ai',
      '/api/email',
      'localStorage',
      'sessionStorage',
      'cookies()',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('documents saved-view planning without claiming runtime behavior', () => {
    const doc = readRepoFile('docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_PRESETS_DTO_20260705.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_PRESETS_DTO_IMPLEMENTED_20260705',
      'read-only planning DTO',
      'Planning-only: no saved views are persisted.',
      'already scoped Daily Office Handoff Digest',
      'No runtime wiring',
      'not sacramental, canonical',
      'Production-sensitive features remain NO-GO',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Office Handoff Saved-View Presets DTO Implemented')
    expect(roadmap).toContain('Daily Office Handoff saved-view presets')
    expect(sourceOfTruth).toContain('Daily Office Handoff saved-view presets')
  })
})
