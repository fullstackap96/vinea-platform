import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('trust center claims owner review filled example', () => {
  it('is non-runtime and keeps public trust-center publishing no-go', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md')

    for (const expected of [
      'Status: Prepared as a non-runtime, non-secret filled example using role labels only.',
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
      'Completion marker: `TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the original worksheet, claims matrix, and supporting readiness evidence', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md')

    for (const expected of [
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/PRODUCTION_MONITORING_EVIDENCE_PACKAGE_INDEX_20260705.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
      'docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md',
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md',
      'docs/AI_SAFETY_PERMISSION_SCOPED_RETRIEVAL_POLICY_20260627.md',
      'docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('provides role-label recommendations for every trust area without granting public approval', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md')

    for (const expected of [
      '| Formal compliance certification | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `NO-GO` |',
      '| Production membership-aware RLS | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `READY_FOR_PRODUCT_OWNER_REVIEW` |',
      '| Production monitoring | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| Backup and restore | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| Export controls | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| Public intake routing | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| AI safety | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| Data retention and deletion | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `NO-GO` |',
      '| Incident response | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| Document and family portal safety | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `LIMITED_INTERNAL_REVIEW` |',
      '| MFA, SSO, and advanced RBAC | `Vinea product owner` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `NO-GO` |',
      'This example intentionally does not recommend:',
      '`APPROVED_FOR_PUBLIC_USE`',
      'Those statuses require human review, named owners, and evidence beyond this filled example.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('spells out missing evidence and next safe actions in non-secret language', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md')

    for (const expected of [
      'Keep certification language blocked; prepare compliance roadmap language only',
      'Review the production RLS evidence package and complete owner/fixture sign-off before any production migration request',
      'Complete non-secret monitoring owner readiness, then request only non-production runtime approval if owners approve',
      'Keep wording limited to approved non-production/synthetic evidence and prepare production RPO/RTO review packet',
      'Keep production exports blocked; fill production smoke labels only after explicit product-owner approval',
      'Review production enablement checklist and collect DNS/TLS evidence before any production flag request',
      'Continue non-production safety-chain work and keep customer-facing AI claims blocked',
      'Review policy proposal with named owners before implementation planning',
      'Prepare an owner-reviewed tabletop drill using synthetic scenarios only',
      'Prepare token lifecycle/support playbook and production-safe smoke fixture labels after RLS approval',
      'Keep claims blocked; prepare roadmap and product decision packet only',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the filled example', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Trust Center Claims Owner Review Filled Example Prepared')
    expect(roadmap).toContain('Trust center claims owner review filled example')
    expect(ssot).toContain('Trust center claims owner review filled example')
  })

  it('does not include obvious secret, raw-data, signed-url, or fake evidence markers', () => {
    const doc = read('docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md')

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
