import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(process.cwd(), 'docs', 'EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('export audit review evidence template', () => {
  it('is evidence-template-only and keeps production exports blocked', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Evidence template prepared only.',
      'Production was not accessed',
      'production export flags were not enabled',
      'no staff-facing production UI was added',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'no secrets were exposed',
      'Current decision state: `EXPORT AUDIT REVIEW EVIDENCE TEMPLATE PREPARED; PRODUCTION EXPORTS REMAIN NO-GO`',
      'Completion marker: `EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links the runbook and captures review identity, approvals, fixtures, and audit-event review', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'This template supports `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md`.',
      'Review Identity',
      'Approval And Boundary Check',
      'Fixture And Scope Summary',
      'Audit Event Review',
      'Expected Allow And Deny Event Summary',
      'Suspicious Pattern Review',
      'Escalation Decision',
      'Rollback Verification',
      'Evidence Storage And Redaction',
      'Final Outcome',
      'Sanitized JSON Evidence Skeleton',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires safe audit metadata and denial/suspicious-pattern evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '`event_type` present',
      'Staff user id present',
      'Active parish id present',
      'Parish ids included',
      'Requested fields safe',
      'Blocked fields handled',
      'Route scope source present',
      'No secret/file material',
      'Same-parish success event count',
      'Cross-parish denial event count',
      'Blocked-field denial event count',
      'Family/unauthenticated denial event count',
      'Unexpected delivery event count',
      'Post-rollback downloaded event count',
      'No export delivery while flags were expected to be off',
      'No cross-parish request included in same-parish export',
      'No parish id outside staff active memberships',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('preserves export boundaries and redaction rules', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Do not paste raw CSV rows, document contents, storage paths, signed URLs, original filenames, portal tokens, token hashes, notes, communications, AI prompts, AI outputs, or credentials.',
      'Raw exports stored: `NO_UNLESS_SEPARATELY_APPROVED`',
      'CSV/file contents excluded',
      'Tokens and signed URLs excluded',
      'Original filenames and storage paths excluded',
      'Notes, communications, AI material, and sacramental/canonical details excluded',
      'Credentials and connection strings excluded',
      '"productionExportsRemainNoGo": true',
      '"secretMaterialExcluded": true',
      '"fileMaterialExcluded": true',
      '"signedUrlMaterialExcluded": true',
      '"storagePathMaterialExcluded": true',
      '"originalFilenameMaterialExcluded": true',
      '"aiMaterialExcluded": true',
      '"sacramentalCanonicalDetailExcluded": true',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('is linked from the trust-center readiness packet without implying production readiness', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Export audit review evidence template: `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`',
      'The export audit review evidence template gives reviewers a non-secret fillable record',
      'These export audit review documents do not enable production exports, add runtime monitoring, or approve staff-facing export UI.',
      'Do not claim production runtime export controls',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, or fake uuid material', () => {
    const template = readFileSync(templatePath, 'utf8')

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
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(template).not.toContain(forbidden)
    }
  })
})
