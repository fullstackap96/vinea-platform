import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md'
)

describe('request_document_manifest export non-production QA evidence', () => {
  it('records completed non-production route-level QA without production or data-risk changes', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed as non-production route-level QA for `request_document_manifest`.',
      'Production was not accessed',
      'production flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated beyond the approved safe audit metadata path',
      'no secrets were exposed',
      'Current decision: `REQUEST_DOCUMENT_MANIFEST NON-PRODUCTION ROUTE-LEVEL QA PASSED, PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('covers the requested manifest export QA gates and exact non-production flags', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '`VINEA_EXPORT_RUNTIME=ENABLED`',
      '`VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`',
      '`VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`',
      'Flag-off blocking',
      'Same-parish manifest success',
      'Cross-parish denial',
      'Blocked-field denial',
      'Family portal denial',
      'Safe audit metadata before query/delivery',
      'CSV field exclusions',
      'No signed URL/storage/file API usage',
      'Source-level route preflight',
      'Rollback',
      'disable or unset the export runtime flags',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps sensitive document data, storage handles, and secrets out of the evidence packet', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Staff passwords.',
      'Supabase service role keys.',
      'Supabase anon keys.',
      'Google OAuth access or refresh tokens.',
      'OpenAI API keys.',
      'Family portal tokens or token hashes.',
      'Public intake token hashes.',
      'Signed URL material.',
      'Storage bucket names.',
      'Storage object paths.',
      'Direct storage paths.',
      'Original filenames.',
      'Uploaded file contents.',
      'File previews.',
      'Internal notes or staff-only document comments.',
      'Communication bodies.',
      'Raw AI prompts, generated outputs, provider payloads, or token material.',
      'Sacramental/canonical record details.',
      'Google Calendar payloads.',
      'Audit-log payloads beyond the approved safe export audit metadata.',
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
      'createSignedUrl(',
    ]) {
      expect(evidence).not.toContain(forbidden)
    }
  })
})
