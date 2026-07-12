import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

const templatePath =
  'docs/CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md'

describe('certificate issuance logging non-production QA evidence template', () => {
  it('is template-only and keeps QA, runtime scaffolding, production logging, and certificate automation unapproved', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'Status: Prepared as a non-production QA evidence template only.',
      'CERTIFICATE ISSUANCE LOGGING NON-PRODUCTION QA NOT EXECUTED',
      'RUNTIME SCAFFOLD NOT IMPLEMENTED',
      'PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO',
      'AUTOMATIC CERTIFICATE GENERATION REMAINS NO-GO',
      'does not approve runtime implementation',
      'migrations',
      'operational RLS changes',
      'sacramental record mutation',
      'production flags',
      'automatic certificate generation',
      'automatic certificate PDF creation',
      'correction or notation workflows',
      'pastoral decisions',
      'canonical or sacramental eligibility decisions',
      'public trust claims',
      'Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures the exact non-production flags, fixture labels, owner labels, and related materials', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702.md`',
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md`',
      '`lib/certificateIssuanceDtos.ts`',
      '`lib/server/certificateIssuanceLoggingRuntimePreflight.ts`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION`',
      'Safe staff user fixture label',
      'Active parish fixture label',
      'Denied parish fixture label',
      'Same-parish linked-request record fixture',
      'Same-parish no-request-link record fixture',
      'Ready-for-review issuance fixture',
      'Generated-for-review issuance fixture',
      'Issued-to-requester issuance fixture',
      'Voided-or-replaced issuance fixture',
      'Family portal or unauthenticated denial method',
      'Monitoring owner/channel',
      'Rollback owner',
      'Evidence storage owner',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('covers all required QA gates and evidence sections', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'Gate 0: Flag-Off Baseline',
      'Gate 1: Flag-On Non-Production Scaffold Checks',
      'Active-Parish And Membership Scope',
      'Request-To-Record Continuity',
      'Issuance Status Review',
      'Cross-Parish Denial',
      'Family And Unauthenticated Denial',
      'Safe Audit Metadata Checks',
      'Rollback Verification',
      'Forbidden Mutation And Generation Checks',
      'Production NO-GO Criteria',
      'Final Sign-Off',
      'Unresolved Risks',
      'Current outcome: `[PENDING - QA NOT EXECUTED]`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('documents forbidden behavior, privacy boundaries, docs updates, and no secrets', () => {
    const template = readRepoFile(templatePath)
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'No migrations are applied and operational RLS is not changed',
      'No `public.sacramental_records` update occurs',
      'No book, page, line, minister, place, person, sacrament date, or notes are changed',
      'No certificate is generated automatically',
      'No certificate PDF is created automatically',
      'No canonical notation is entered',
      'No correction or notation workflow is implemented or invoked',
      'No request is marked complete',
      'No email or SMS is sent',
      'No Google Calendar, AI, export, storage, signed URL, public intake, or document-file behavior is invoked',
      'No public trust claims are made',
      'No raw notes',
      'raw record values',
      'storage paths',
      'signed URLs',
      'token material',
      'No canonical, sacramental eligibility, or pastoral decision is made',
    ]) {
      expect(template).toContain(expected)
    }

    expect(buildStatus).toContain('Certificate Issuance Logging Non-Production QA Evidence Template Prepared')
    expect(roadmap).toContain('Certificate Issuance Logging Non-Production QA Evidence Template')
    expect(sourceOfTruth).toContain('Certificate Issuance Logging Non-Production QA Evidence Template')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })
})
