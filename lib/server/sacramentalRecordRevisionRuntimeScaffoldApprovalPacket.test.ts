import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

describe('sacramental record revision runtime scaffold approval packet', () => {
  it('is approval-only and keeps runtime scaffolding, production workflows, and register mutation unapproved', () => {
    const packet = readRepoFile(
      'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Status: Prepared as a product-owner approval packet for a future non-production implementation step only.',
      'SACRAMENTAL RECORD REVISION RUNTIME SCAFFOLD NOT APPROVED',
      'PRODUCTION CORRECTION AND NOTATION WORKFLOWS REMAIN NO-GO',
      'AUTOMATIC REGISTER MUTATION REMAINS NO-GO',
      'does not apply migrations',
      'change operational RLS',
      'mutate sacramental records',
      'enable production flags',
      'generate certificates automatically',
      'enter canonical notations',
      'make pastoral decisions',
      'make canonical or sacramental eligibility decisions',
      'make public trust claims',
      'Completion marker: `SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact implementation files, non-production gates, and event/action names', () => {
    const packet = readRepoFile(
      'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      '`lib/server/sacramentalRecordRevisionRuntimeGate.ts`',
      '`lib/server/sacramentalRecordRevisionAudit.ts`',
      '`lib/server/sacramentalRecordRevisionScaffold.ts`',
      '`lib/server/sacramentalRecordRevisionPreflight.test.ts`',
      '`app/api/records/[id]/revision-review/route.ts`',
      '`app/dashboard/records/[id]/page.tsx`',
      '`docs/SACRAMENTAL_RECORD_REVISION_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260702.md`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME=ENABLED`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ACK=APPROVED_SACRAMENTAL_RECORD_REVISION_QA`',
      '`VINEA_SACRAMENTAL_RECORD_REVISION_RUNTIME_ENV=NON_PRODUCTION`',
      '`public.sacramental_record_events`',
      '`sacramental_record_correction_reviewed`',
      '`sacramental_record_notation_reviewed`',
      'Production flags are not approved by this packet.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires active parish scope, membership scope, request continuity, safe audit metadata, QA fixtures, and rollback', () => {
    const packet = readRepoFile(
      'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md'
    )

    for (const expected of [
      'Staff-reviewed.',
      'Staff-only.',
      'Active-parish scoped.',
      'Membership scoped.',
      'Safe-audit-metadata-first.',
      'Staff authentication.',
      'Active parish cookie or selected parish context.',
      'Staff membership in the active parish.',
      'Sacramental record ownership by the selected active parish.',
      'Linked request ownership by the same parish when `request_id` is present.',
      '`feature_id`: `sacramental_record_revision_v1`',
      '`event_action`: `sacramental_record_correction_reviewed` or `sacramental_record_notation_reviewed`',
      'source DTO reference',
      'blocked reason for denied paths',
      'The source-level preflight must require complete marker sets for each gate.',
      'A future scaffold must not pass by including only one partial marker',
      'Request-To-Record QA Fixtures',
      'Required Manual Smoke Tests',
      'Rollback:',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents exclusions, no-go boundaries, future approval language, and docs updates without secrets', () => {
    const packet = readRepoFile(
      'docs/SACRAMENTAL_RECORD_REVISION_RUNTIME_SCAFFOLD_APPROVAL_PACKET_20260702.md'
    )
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Update `public.sacramental_records`.',
      'Change book, page, line, minister, place, person, sacrament date, or notes.',
      'Enter a canonical notation.',
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
    ]) {
      expect(packet).toContain(expected)
    }

    expect(buildStatus).toContain('Sacramental Record Correction And Notation Runtime Scaffold Approval Packet Prepared')
    expect(roadmap).toContain('Sacramental Record Correction And Notation Runtime Scaffold Approval Packet')
    expect(sourceOfTruth).toContain('Sacramental Record Correction And Notation Runtime Scaffold Approval Packet')

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
