import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('sacramental record revision DTO source and docs', () => {
  it('keeps correction and notation DTOs non-runtime, staff-reviewed, and mutation-free', () => {
    const source = readRepoFile('lib/sacramentalRecordRevisionDtos.ts')

    for (const expected of [
      'sacramental_record_revision_v1',
      'sacramental_record_correction_reviewed',
      'sacramental_record_notation_reviewed',
      'draft_for_staff_review',
      'ready_for_authorized_review',
      'approved_for_manual_entry',
      'entered_by_authorized_staff',
      'voided_or_superseded',
      'staffReviewRequired: true',
      'authorizedRecordReviewRequired: true',
      'productOwnerApprovalRequiredForRuntime: true',
      'canonicalDecisionMade: false',
      'pastoralDecisionMade: false',
      'sacramentalEligibilityDecided: false',
      'mutatesSacramentalRecord: false',
      'generatesCertificateAutomatically: false',
      'runtimePersistenceApproved: false',
      'approvalBoundary',
      'requestContinuity',
    ]) {
      expect(source).toContain(expected)
    }

    for (const forbidden of [
      '.from(',
      '.insert(',
      '.update(',
      '.delete(',
      'fetch(',
      'buildBaptismCertificatePdf',
      'createSignedUrl',
      'NextResponse',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('documents correction, notation, audit, active-parish, rollback, and production no-go boundaries', () => {
    const plan = readRepoFile('docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'non-runtime DTO foundation only',
      'sacramental_record_correction_reviewed',
      'sacramental_record_notation_reviewed',
      '`canonicalDecisionMade: false`',
      '`pastoralDecisionMade: false`',
      '`sacramentalEligibilityDecided: false`',
      '`mutatesSacramentalRecord: false`',
      '`generatesCertificateAutomatically: false`',
      '`runtimePersistenceApproved: false`',
      'Active parish cookie or selected parish context.',
      'Staff membership in the active parish.',
      'Existing operational RLS must remain in place',
      'This DTO foundation has no runtime state and therefore requires no database rollback.',
      'This slice does not:',
      'Add migrations.',
      'Change operational RLS.',
      'Mutate sacramental records.',
      'Correct registers.',
      'Add canonical notations.',
      'Generate certificates.',
      'Decide sacramental eligibility.',
      'Make public trust claims.',
      'Completion marker: `SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702`',
    ]) {
      expect(plan).toContain(expected)
    }

    expect(buildStatus).toContain('Sacramental Record Correction And Notation DTO Foundation Implemented')
    expect(roadmap).toContain('Sacramental Record Correction And Notation DTO Foundation')
    expect(sourceOfTruth).toContain('Sacramental Record Correction And Notation DTO Foundation')
  })
})
