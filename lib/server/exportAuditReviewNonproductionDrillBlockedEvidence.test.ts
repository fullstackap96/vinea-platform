import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_EVIDENCE_20260630_BLOCKED.md',
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit review non-production drill blocked evidence', () => {
  it('records a blocked drill without production access or runtime changes', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before drill execution.',
      'Production was not accessed',
      'production export flags were not enabled',
      'staff-facing production export UI was not added',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'export routes were not called',
      'audit metadata was not written',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL BLOCKED; DRILL NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_BLOCKED_20260630`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('names the available variables by name only and lists missing fixture labels', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Non-production app target variable present by name: `NON_PRODUCTION_APP_URL`',
      'Safe staff email variable present by name: `QA_STAFF_EMAIL`',
      'Safe staff password variable present by name: `QA_STAFF_PASSWORD`',
      '`SAFE_EXPORT_QA_STAFF`',
      '`SAFE_EXPORT_PARISH_A`',
      '`SAFE_EXPORT_SAME_PARISH_REQUEST`',
      '`SAFE_EXPORT_CROSS_PARISH_DENIED_REQUEST`',
      '`SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF`',
      '`SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A`',
      '`SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`',
      '`SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`',
      '`SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`',
      '`ROLLBACK_OWNER_NAME`',
      'Drill target explicitly confirmed with route fixture labels in this prompt: `NO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('confirms all export drill execution steps were intentionally not run', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Flag-off export route baseline.',
      'Non-production export runtime flag enablement.',
      '`request_list_basic` same-parish success.',
      '`request_list_basic` cross-parish denial.',
      '`request_list_basic` blocked-field denial.',
      '`request_list_basic` family portal or unauthenticated denial.',
      '`request_document_manifest` same-parish manifest success.',
      '`request_document_manifest` cross-parish denial.',
      '`request_document_manifest` blocked-field denial.',
      '`request_document_manifest` family portal or unauthenticated denial.',
      'Audit-event review.',
      'Rollback verification after flag disablement.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include secret-shaped material or raw evidence material', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Do not provide passwords',
      'database URLs',
      'service-role keys',
      'API keys',
      'Google OAuth tokens',
      'family portal token values',
      'signed URLs',
      'storage paths',
      'original filenames',
      'raw CSV contents',
      'raw manifests',
      'notes',
      'communications',
      'AI prompts',
      'AI outputs',
      'sacramental/canonical details',
    ]) {
      expect(evidence).toContain(expected)
    }

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb_secret_',
      'eyJ',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })

  it('is linked from the trust-center readiness packet as blocked evidence', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit review non-production drill blocked evidence: `docs/EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_EVIDENCE_20260630_BLOCKED.md`',
      'The blocked drill evidence records that the drill was not executed because required non-secret fixture labels and rollback/monitoring ownership were unavailable',
      'These export audit review documents do not enable production exports, add runtime monitoring, or approve staff-facing export UI.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
