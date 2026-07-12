import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('certificate issuance logging implementation approval packet', () => {
  it('is approval-only and keeps runtime implementation and production logging unapproved', () => {
    const packet = readRepoFile(
      'docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future non-production implementation step only.',
      'CERTIFICATE ISSUANCE LOGGING IMPLEMENTATION NOT APPROVED',
      'PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO',
      'does not generate certificates automatically',
      'create PDFs',
      'add production flags',
      'apply migrations',
      'change operational RLS',
      'mutate sacramental records',
      'correct registers',
      'add canonical notations',
      'decide sacramental or pastoral eligibility',
      'make public trust claims',
      'Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact implementation files, event naming, and non-production gates', () => {
    const packet = readRepoFile(
      'docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      '`lib/server/certificateIssuanceLoggingGate.ts`',
      '`lib/server/certificateIssuanceLoggingAudit.ts`',
      '`lib/server/certificateIssuanceLoggingService.ts`',
      '`lib/server/certificateIssuanceLoggingPreflight.test.ts`',
      '`app/api/records/[id]/certificate/route.ts`',
      '`app/dashboard/records/[id]/page.tsx`',
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION`',
      '`public.sacramental_record_events`',
      '`certificate_issuance_reviewed`',
      '`certificate_generated`',
      'Production flags are not approved by this packet.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires active parish membership scope, request continuity, safe audit metadata, and rollback', () => {
    const packet = readRepoFile(
      'docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Staff-reviewed.',
      'Staff-only.',
      'Active-parish scoped.',
      'Membership scoped.',
      'Append-only for issuance events.',
      'Staff authentication.',
      'Active parish cookie or selected parish context.',
      'Staff membership in the active parish.',
      'Sacramental record ownership by the selected active parish.',
      'Linked request ownership by the same parish when `request_id` is present.',
      '`feature_id`: `certificate_issuance_logging_v1`',
      '`event_action`: `certificate_issuance_reviewed`',
      'source DTO reference',
      'blocked reason for denied paths',
      'When `sacramental_records.request_id` is present:',
      'When `sacramental_records.request_id` is missing:',
      'Required QA Fixtures',
      'Required Manual Smoke Tests',
      'Rollback:',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents correction/notation exclusions, future no-go boundaries, and docs updates without secrets', () => {
    const packet = readRepoFile(
      'docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'
    )
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Certificate issuance logging is not a correction or notation workflow.',
      'Change book, page, line, minister, place, person, sacrament date, or notes.',
      'Add canonical notations.',
      'Correct sacramental register values.',
      'Decide whether a person is eligible for a sacrament.',
      'Production certificate issuance logging.',
      'Automatic certificate generation.',
      'Family-facing certificate status.',
      'Sacramental record correction.',
      'Canonical notation.',
      'Register locking.',
      'Sacramental or canonical eligibility decisions.',
      'CERTIFICATE ISSUANCE LOGGING NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CERTIFICATE ISSUANCE LOGGING DISABLED; AUTOMATIC CERTIFICATE GENERATION DISABLED; CORRECTION AND NOTATION WORKFLOWS NO-GO',
    ]) {
      expect(packet).toContain(expected)
    }

    expect(buildStatus).toContain('Certificate Issuance Logging Implementation Approval Packet Prepared')
    expect(roadmap).toContain('Certificate Issuance Logging Implementation Approval Packet')
    expect(sourceOfTruth).toContain('Certificate Issuance Logging Implementation Approval Packet')

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
      expect(packet).not.toContain(forbidden)
    }
  })
})
