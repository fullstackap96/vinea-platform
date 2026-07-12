import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_EVIDENCE_20260630_COMPLETED.md',
)

describe('export audit review non-production drill completed evidence', () => {
  it('records a completed non-production drill while preserving production boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed as a live non-production export audit review drill',
      'Production was not accessed',
      'production export flags were not enabled',
      'staff-facing production export UI was not added',
      'migrations were not applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated beyond approved safe export audit metadata',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL PASSED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_EVIDENCE_20260630_COMPLETED`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('captures flag-off, flag-on, denial, audit, and rollback evidence', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Flag-off request-list baseline',
      'HTTP `404`, `export_unavailable`',
      'Same-parish request-list export',
      'HTTP `200`, approved header, 38 rows including header',
      'Same-parish document-manifest export',
      'HTTP `200`, approved header, 174 rows including header',
      'Request-list blocked-field attempt',
      'Document-manifest signed-link field attempt',
      'Document-manifest storage-location field attempt',
      'Request-list forged active parish cookie',
      'Document-manifest forged active parish cookie',
      'Same-parish success event count: `2`',
      'Cross-parish denial event count: `2 audit events; HTTP denials verified`',
      'Blocked-field denial event count: `3 audit events; HTTP denials verified`',
      'Family/unauthenticated denial event count: `2 audit events; HTTP denials verified`',
      'Post-rollback downloaded event count: `0`',
      'Post-rollback denied event count: `0`',
      '"finalOutcome": "pass"',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records denied-audit-event coverage without treating production exports as approved', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Denied audit metadata | Safe denied audit metadata exists for denial paths | 7 denied events | Pass',
      'Denied export audit events present: `pass`',
      'Denied export audit events were present for blocked-field, forged active-parish, and unauthenticated/family-substitute denial paths.',
      'Production exports remain `NO-GO`',
      'Product owner sign-off required before production export progression: `yes`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('excludes secrets, raw exports, and sensitive document material', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Raw exports stored: `NO`',
      'CSV/file contents excluded: `pass`',
      'Tokens and signed URLs excluded: `pass`',
      'Original filenames and storage paths excluded: `pass`',
      'Notes, communications, AI material, and sacramental/canonical details excluded: `pass`',
      'Credentials and connection strings excluded: `pass`',
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
})
