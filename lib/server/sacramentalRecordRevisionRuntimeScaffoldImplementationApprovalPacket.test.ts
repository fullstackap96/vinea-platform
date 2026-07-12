import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

const packetPath =
  'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702.md'

describe('sacramental record revision runtime scaffold implementation approval packet', () => {
  it('is approval-only and keeps runtime implementation, production workflows, and register mutation unapproved', () => {
    const packet = readRepoFile(packetPath)

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future non-production implementation step only.',
      'SACRAMENTAL RECORD REVISION RUNTIME SCAFFOLD IMPLEMENTATION NOT APPROVED',
      'PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO',
      'AUTOMATIC REGISTER MUTATION REMAINS NO-GO',
      'does not wire runtime routes',
      'apply migrations',
      'change operational RLS',
      'mutate sacramental records',
      'enable production flags',
      'generate certificates automatically',
      'enter canonical notations',
      'make pastoral decisions',
      'make canonical or sacramental eligibility decisions',
      'make public trust claims',
      'Completion marker: `SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_IMPLEMENTATION_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links required prerequisites, exact implementation files, runtime flags, and source preflight', () => {
    const packet = readRepoFile(packetPath)

    for (const expected of [
      '`docs/SACRAMENTAL_RECORD_REVISION_DTO_PLAN_20260702.md`',
      '`docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md`',
      '`docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`',
      '`docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_PREFLIGHT_PLAN_20260702.md`',
      '`lib/server/sacramentalRecordRevisionRuntimePreflight.ts`',
      '`lib/server/sacramentalRecordRevisionRuntimePreflight.test.ts`',
      '`lib/server/sacramentalRecordRevisionRuntimeGate.ts`',
      '`lib/server/sacramentalRecordRevisionAudit.ts`',
      '`lib/server/sacramentalRecordRevisionScaffold.ts`',
      '`app/api/records/[id]/revision-review/route.ts`',
      '`app/dashboard/records/[id]/page.tsx`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION`',
      'validateFutureSacramentalRecordRevisionRuntimeSource()',
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
      'generic-denial-only for blocked contexts',
      'staff authentication',
      'active-parish and membership scope',
      'sacramental record ownership',
      'request-to-record ownership',
      'safe audit metadata before writes',
      'The source-level preflight must also require complete marker sets for each gate.',
      'A future scaffold must not pass by including only one partial marker',
      '`feature_id`: `sacramental_record_revision_v1`',
      '`event_action`: `sacramental_record_correction_reviewed` or `sacramental_record_notation_reviewed`',
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
      'Change book, page, line, minister, place, person, sacrament date, or notes.',
      'Enter canonical notation text.',
      'Generate a certificate.',
      'Mark a request complete.',
      'Decide sacramental eligibility.',
      'Decide pastoral readiness.',
      'Expose revision metadata to family portal users.',
      'Production correction workflow.',
      'Production notation workflow.',
      'Automatic register mutation.',
      'Canonical notation entry.',
      'Pastoral readiness decisions.',
      'Public trust-center claims.',
      'SACRAMENTAL RECORD REVISION NON-PRODUCTION SCAFFOLD IMPLEMENTED; PRODUCTION CORRECTION AND NOTATION WORKFLOWS DISABLED; AUTOMATIC REGISTER MUTATION DISABLED; CANONICAL AND PASTORAL DECISIONS NO-GO',
      'Approve non-production implementation of the sacramental record correction/notation runtime scaffold only.',
      'After implementation, production correction and notation workflows remain NO-GO.',
    ]) {
      expect(packet).toContain(expected)
    }

    expect(buildStatus).toContain(
      'Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet Prepared'
    )
    expect(roadmap).toContain(
      'Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet'
    )
    expect(sourceOfTruth).toContain(
      'Sacramental Record Correction And Notation Runtime Scaffold Implementation Approval Packet'
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
