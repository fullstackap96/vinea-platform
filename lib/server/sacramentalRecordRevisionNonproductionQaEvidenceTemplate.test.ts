import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

const templatePath =
  'docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md'

describe('sacramental record revision non-production QA evidence template', () => {
  it('is template-only and keeps QA, runtime scaffolding, production workflows, and register mutation unapproved', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      'Status: Prepared as a non-production QA evidence template only.',
      'SACRAMENTAL RECORD REVISION NON-PRODUCTION QA NOT EXECUTED',
      'RUNTIME SCAFFOLD NOT IMPLEMENTED',
      'PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO',
      'AUTOMATIC REGISTER MUTATION REMAINS NO-GO',
      'does not approve runtime implementation',
      'migrations',
      'operational RLS changes',
      'sacramental record mutation',
      'production flags',
      'automatic certificate generation',
      'canonical notation entry',
      'pastoral decisions',
      'canonical or sacramental eligibility decisions',
      'public trust claims',
      'Completion marker: `SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('captures the exact non-production flags, fixture labels, owner labels, and related materials', () => {
    const template = readRepoFile(templatePath)

    for (const expected of [
      '`docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md`',
      '`docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md`',
      '`lib/sacramentalRecordRevisionDtos.ts`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION`',
      'Safe staff user fixture label',
      'Active parish fixture label',
      'Denied parish fixture label',
      'Same-parish correction review fixture',
      'Same-parish notation review fixture',
      'Linked request fixture',
      'Missing request link fixture',
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
      'Correction Review',
      'Notation Review',
      'Cross-Parish Denial',
      'Family And Unauthenticated Denial',
      'Safe Audit Metadata Checks',
      'Rollback Verification',
      'Forbidden Mutation Checks',
      'Production NO-GO Criteria',
      'Final Sign-Off',
      'Unresolved Risks',
      'Current outcome: `[PENDING - QA NOT EXECUTED]`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('documents forbidden behavior, privacy boundaries, and docs updates without secrets', () => {
    const template = readRepoFile(templatePath)
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'No migrations are applied and operational RLS is not changed',
      'No `public.sacramental_records` update occurs',
      'No book, page, line, minister, place, person, sacrament date, or notes are changed',
      'No canonical notation is entered',
      'No certificate is generated automatically',
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

    expect(buildStatus).toContain(
      'Sacramental Record Correction And Notation Non-Production QA Evidence Template Prepared'
    )
    expect(roadmap).toContain(
      'Sacramental Record Correction And Notation Non-Production QA Evidence Template'
    )
    expect(sourceOfTruth).toContain(
      'Sacramental Record Correction And Notation Non-Production QA Evidence Template'
    )

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
