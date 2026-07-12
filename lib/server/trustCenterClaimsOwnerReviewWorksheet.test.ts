import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('trust center claims owner review worksheet', () => {
  it('is non-runtime and keeps public trust-center publishing no-go', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md')

    for (const expected of [
      'Status: Prepared as a non-runtime, non-secret trust-center readiness worksheet.',
      'Production was not accessed',
      'production flags were not enabled',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'exports were not run',
      'AI was not called',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'public trust-center copy was not published',
      'Current public trust-center decision: `NO-GO`',
      'Completion marker: `TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the claims boundary matrix and supporting readiness evidence', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md')

    for (const expected of [
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
      'docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md',
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines owner labels, approval statuses, missing evidence, and next safe actions', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md')

    for (const expected of [
      'Product owner label',
      'Support owner label',
      'Evidence owner label',
      'Current approval status',
      'Missing evidence',
      'Next safe action',
      '`NO-GO`',
      '`LIMITED_INTERNAL_REVIEW`',
      '`READY_FOR_PRODUCT_OWNER_REVIEW`',
      '`READY_FOR_SECURITY_DATA_REVIEW`',
      '`APPROVED_FOR_PUBLIC_DRAFT_ONLY`',
      '`APPROVED_FOR_PUBLIC_USE`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('covers every trust area from the public claims boundary matrix', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md')

    for (const expected of [
      '| Formal compliance certification |',
      '| Production membership-aware RLS |',
      '| Production monitoring |',
      '| Backup and restore |',
      '| Export controls |',
      '| Public intake routing |',
      '| AI safety |',
      '| Data retention and deletion |',
      '| Incident response |',
      '| Document and family portal safety |',
      '| MFA, SSO, and advanced RBAC |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the worksheet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Trust Center Claims Owner Review Worksheet Prepared')
    expect(roadmap).toContain('Trust center claims owner review worksheet')
    expect(ssot).toContain('Trust center claims owner review worksheet')
  })

  it('does not include obvious secret, raw-data, signed-url, or fake evidence markers', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'signedUrl=',
      'rawExport=',
      'eyJ',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(doc).not.toContain(forbidden)
    }
  })
})
