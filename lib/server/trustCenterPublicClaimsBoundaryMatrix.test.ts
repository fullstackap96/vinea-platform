import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('trust center public claims boundary matrix', () => {
  it('keeps the trust-center claims matrix non-runtime and public publishing no-go', () => {
    const doc = read('docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md')

    for (const expected of [
      'Status: Prepared as a non-runtime trust-center readiness slice.',
      'Production was not accessed',
      'production flags were not enabled',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'exports were not run',
      'AI was not called',
      'no secrets were exposed',
      'Current public trust-center decision: `NO-GO`',
      'Completion marker: `TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the required evidence packages across trust-center readiness areas', () => {
    const doc = read('docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md')

    for (const expected of [
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
      'docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md',
      'docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md',
      'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md',
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines claim boundaries for the major gated production-sensitive areas', () => {
    const doc = read('docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md')

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
      'Public claim allowed?',
      '`LIMITED_INTERNAL`',
      '`NO`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('blocks public overclaims and requires evidence-backed review', () => {
    const doc = read('docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md')

    for (const expected of [
      'Forbidden Public Claims',
      'Vinea is SOC 2 certified',
      'Vinea has completed production backup and restore drills.',
      'Vinea has production RPO/RTO guarantees.',
      'Vinea production is fully diocesan RLS-ready.',
      'Vinea production exports are generally available.',
      'Vinea production monitoring is live and staffed.',
      'Vinea AI is fully permission-scoped in production',
      'Vinea public intake routing is production-enabled',
      'Vinea retention and deletion automation is approved and implemented.',
      'Vinea incident response has completed production-grade tabletop drills.',
      'Do not convert a readiness packet into a public promise.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the claims boundary matrix', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Trust Center Public Claims Boundary Matrix Prepared')
    expect(roadmap).toContain('Trust center public claims boundary matrix')
    expect(ssot).toContain('Trust center public claims boundary matrix')
  })

  it('does not include obvious secret, token, raw export, or fake evidence markers', () => {
    const doc = read('docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md')

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
