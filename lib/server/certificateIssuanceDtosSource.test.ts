import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('certificate issuance DTO source and docs', () => {
  it('keeps certificate issuance logging non-runtime, staff-reviewed, and mutation-free', () => {
    const source = readRepoFile('lib/certificateIssuanceDtos.ts')

    for (const expected of [
      'certificate_issuance_logging_v1',
      'certificate_issuance_reviewed',
      'ready_for_staff_review',
      'generated_for_review',
      'issued_to_requester',
      'voided_or_replaced',
      'staffReviewRequired: true',
      'canonicalDecisionMade: false',
      'sacramentalEligibilityDecided: false',
      'certificateGeneratedAutomatically: false',
      'mutatesSacramentalRecord: false',
      'correctionOrNotationBoundary',
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

  it('documents issuance, correction/notation, audit, and request-continuity boundaries', () => {
    const plan = readRepoFile('docs/CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702.md')
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'non-runtime DTO foundation only',
      'Certificate issued to requester.',
      '`canonicalDecisionMade: false`',
      '`sacramentalEligibilityDecided: false`',
      '`certificateGeneratedAutomatically: false`',
      '`mutatesSacramentalRecord: false`',
      'Certificate issuance logging is not a correction or notation workflow.',
      'When `request_id` is missing, the DTO does not pretend continuity exists.',
      'This slice does not:',
      'Generate certificates.',
      'Add migrations.',
      'Change operational RLS.',
      'Mutate sacramental records.',
      'Decide sacramental eligibility.',
      'Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702`',
    ]) {
      expect(plan).toContain(expected)
    }

    expect(buildStatus).toContain('Certificate Issuance Logging DTO Foundation Implemented')
    expect(roadmap).toContain('Certificate Issuance Logging DTO Foundation')
    expect(sourceOfTruth).toContain('Certificate Issuance Logging DTO Foundation')
  })
})
