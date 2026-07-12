import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('Daily Office Handoff saved-view dashboard browser QA checklist', () => {
  it('defines label-only non-production browser QA without running the QA', () => {
    const checklist = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md',
    )

    for (const expected of [
      'DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_PREPARED_20260708',
      'PREPARED - SAFE NON-PRODUCTION BROWSER QA CHECKLIST',
      'does not execute browser QA',
      'does not access production',
      'does not mutate records',
      'does not persist saved views',
      'does not send communications',
      'does not call AI',
      'does not run exports',
      'does not access storage',
      'does not create signed URLs',
      'does not generate certificates',
      'does not make public trust claims',
      '[FILL: safe non-production app target label only]',
      '[FILL: safe authenticated staff session label only]',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('covers placement, active parish switching, safe links, empty states, and forbidden controls', () => {
    const checklist = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md',
    )

    for (const expected of [
      '`/api/health` returns HTTP 200 and `checks.schema: true`',
      'Saved-view presets appear after the Daily Office Handoff Digest and before Parish Health Score',
      'Front desk opening view, Sacramental records handoff view, and Administrator closeout view are visible',
      'Card shows read-only/staff-reviewed/no-automation language',
      'switching to parish B updates the visible parish context',
      'switching back to parish A restores parish A context',
      'Preset links open only existing staff-reviewed queues',
      'Cue links open only existing queue/detail paths',
      'shows a calm empty state',
      'do not imply canonical, pastoral, eligibility, certificate-generation, or register-mutation decisions',
      'save controls',
      'send or email controls',
      'export or download controls',
      'AI controls',
      'storage, file, or signed URL controls',
      'certificate generation controls',
      'duplicate merge controls',
      'automation controls',
      'forms or mutation controls',
      'raw metadata, raw IDs, secrets',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('keeps rollback as UI removal only and requires future evidence before pilot-ready wording', () => {
    const checklist = readRepoFile(
      'docs/DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_BROWSER_QA_CHECKLIST_20260708.md',
    )
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Rollback for this slice is code removal only',
      'Remove the `DashboardDailyOfficeHandoffSavedViews` import',
      'requires no database, storage, migration, export, AI, email, certificate, or cleanup action',
      'Product owner review needed before pilot-ready wording: `YES`',
      'Production-sensitive gates remain closed: `YES`',
      'Public trust claims approved: `NO`',
      'Use language like this only after the browser run actually passes',
    ]) {
      expect(checklist).toContain(expected)
    }

    expect(buildStatus).toContain('Daily Office Handoff Saved-View Dashboard Browser QA Checklist Prepared')
    expect(roadmap).toContain('Daily Office Handoff saved-view dashboard browser QA checklist')
    expect(sourceOfTruth).toContain('Daily Office Handoff saved-view dashboard browser QA checklist')
  })
})
