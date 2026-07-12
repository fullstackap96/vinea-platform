import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

const packetPath =
  'docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'

describe('certificate issuance logging runtime scaffold implementation approval packet', () => {
  it('is approval-only and keeps runtime implementation, production logging, and automation unapproved', () => {
    const packet = readRepoFile(packetPath)

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future non-production implementation step only.',
      'CERTIFICATE ISSUANCE LOGGING RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED',
      'PRODUCTION CERTIFICATE ISSUANCE LOGGING REMAINS NO-GO',
      'AUTOMATIC CERTIFICATE GENERATION REMAINS NO-GO',
      'CORRECTION AND NOTATION WORKFLOWS REMAIN SEPARATELY GATED',
      'does not wire runtime routes',
      'apply migrations',
      'change operational RLS',
      'mutate sacramental records',
      'enable production flags',
      'generate certificates automatically',
      'create PDFs automatically',
      'make pastoral decisions',
      'make canonical or sacramental eligibility decisions',
      'make public trust claims',
      'Completion marker: `CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links required prerequisites, exact implementation files, runtime flags, and source preflight', () => {
    const packet = readRepoFile(packetPath)

    for (const expected of [
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_DTO_PLAN_20260702.md`',
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_IMPLEMENTATION_APPROVAL_PACKET_20260702.md`',
      '`docs/CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_PREFLIGHT_PLAN_20260702.md`',
      '`lib/server/certificateIssuanceLoggingRuntimePreflight.ts`',
      '`lib/server/certificateIssuanceLoggingRuntimePreflight.test.ts`',
      '`lib/server/certificateIssuanceLoggingGate.ts`',
      '`lib/server/certificateIssuanceLoggingAudit.ts`',
      '`lib/server/certificateIssuanceLoggingScaffold.ts`',
      '`app/api/records/[id]/certificate-issuance-review/route.ts`',
      '`app/dashboard/records/[id]/page.tsx`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME=ENABLED`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ACK=APPROVED_CERTIFICATE_ISSUANCE_LOGGING_QA`',
      '`VINEA_CERTIFICATE_ISSUANCE_LOGGING_RUNTIME_ENV=NON_PRODUCTION`',
      'validateFutureCertificateIssuanceLoggingRuntimeSource()',
      'Production flags are not approved by this packet.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires staff review, active parish membership scope, request ownership, safe audit metadata, QA fixtures, and rollback', () => {
    const packet = readRepoFile(packetPath)

    for (const expected of [
      'staff-reviewed',
      'staff-only',
      'non-production gated',
      'active-parish scoped',
      'membership scoped',
      'request-to-record continuity aware',
      'safe-audit-metadata-first',
      'generic-denial-only for blocked contexts',
      'blocked from automatic certificate generation',
      'staff authentication',
      'active-parish and membership scope',
      'sacramental record ownership',
      'request-to-record ownership',
      'safe audit metadata before writes',
      '`feature_id`: `certificate_issuance_logging_v1`',
      '`event_action`: `certificate_issuance_reviewed`',
      'Required QA Fixtures',
      'Required Manual Smoke Tests',
      'Rollback:',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents no-go boundaries, exact future approval language, docs updates, and no secrets', () => {
    const packet = readRepoFile(packetPath)
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Update `public.sacramental_records`.',
      'Generate a certificate automatically.',
      'Create a certificate PDF automatically.',
      'Mark a request complete.',
      'Decide whether a certificate may canonically or pastorally be issued.',
      'Decide sacramental eligibility.',
      'Enter canonical notation text.',
      'Implement correction or notation workflows.',
      'Expose issuance metadata to family portal users.',
      'Production certificate issuance logging.',
      'Automatic certificate generation.',
      'Automatic certificate PDF creation.',
      'Sacramental record correction.',
      'Canonical notation.',
      'Public trust-center claims.',
      'CERTIFICATE ISSUANCE LOGGING NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CERTIFICATE ISSUANCE LOGGING DISABLED; AUTOMATIC CERTIFICATE GENERATION DISABLED; CORRECTION AND NOTATION WORKFLOWS NO-GO',
      'Approve non-production implementation of the certificate issuance logging runtime scaffold only.',
      'After implementation, production certificate issuance logging remains NO-GO.',
    ]) {
      expect(packet).toContain(expected)
    }

    expect(buildStatus).toContain(
      'Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet Prepared'
    )
    expect(roadmap).toContain(
      'Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet'
    )
    expect(sourceOfTruth).toContain(
      'Certificate Issuance Logging Runtime Scaffold Implementation Approval Packet'
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
      expect(packet).not.toContain(forbidden)
    }
  })
})
