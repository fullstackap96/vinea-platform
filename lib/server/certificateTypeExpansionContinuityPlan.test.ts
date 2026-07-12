import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8')
}

const planPath = 'docs/CERTIFICATE_TYPE_EXPANSION_AND_REQUEST_CONTINUITY_PLAN_20260702.md'

describe('certificate type expansion and request continuity plan', () => {
  it('is non-runtime planning only and keeps live certificate workflows unapproved', () => {
    const plan = readRepoFile(planPath)

    for (const expected of [
      'Status: Prepared as non-runtime planning only.',
      'CERTIFICATE TYPE EXPANSION AND REQUEST CONTINUITY PLAN PREPARED',
      'BROADER CERTIFICATE GENERATION NOT IMPLEMENTED',
      'CERTIFICATE ISSUANCE LOGGING RUNTIME NOT APPROVED',
      'PRODUCTION CERTIFICATE WORKFLOWS REMAIN NO-GO',
      'does not wire routes',
      'apply migrations',
      'change operational RLS',
      'mutate sacramental records',
      'enable production flags',
      'generate certificates automatically',
      'make canonical or sacramental eligibility decisions',
      'make public trust claims',
      'Completion marker: `CERTIFICATE_TYPE_EXPANSION_AND_REQUEST_CONTINUITY_PLAN_20260702`',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('covers broader certificate types and request-to-record continuity states', () => {
    const plan = readRepoFile(planPath)

    for (const expected of [
      'Baptism certificate',
      'Confirmation certificate',
      'First Communion certificate',
      'Marriage certificate',
      'OCIA initiation or reception certificate',
      'Sacramental record extract or status letter',
      'linked_request_verified',
      'record_without_request_manual_review',
      'request_without_record_blocked',
      'cross_parish_mismatch_denied',
      'legacy_record_manual_review',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('keeps generation, issuance logging, corrections, eligibility decisions, and family-facing state separate', () => {
    const plan = readRepoFile(planPath)

    for (const expected of [
      'Certificate generation',
      'Certificate issuance logging',
      'Correction and notation',
      'Canonical or sacramental eligibility',
      'Family-facing certificate state',
      'Ready for staff review',
      'Do not use "eligible."',
      'Do not use "canonically approved."',
      'Do not use "pastorally approved."',
      'automatic generation blocked flag',
      'correction/notation separate approval flag',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('documents future QA and approval gates and updates core docs without secrets', () => {
    const plan = readRepoFile(planPath)
    const buildStatus = readRepoFile('docs/VINEA_BUILD_STATUS.md')
    const roadmap = readRepoFile('docs/VINEA_ROADMAP.md')
    const sourceOfTruth = readRepoFile('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    for (const expected of [
      'Future QA Gates',
      'Future Approval Gates',
      'Product owner approval',
      'Parish/canonical record owner approval',
      'Security/data owner approval',
      'QA owner approval',
      'Support owner approval',
      'no automatic certificate generation',
      'no sacramental record fields are mutated',
      'no correction or notation workflow is invoked',
      'no canonical, sacramental eligibility, or pastoral decision is made',
    ]) {
      expect(plan).toContain(expected)
    }

    expect(buildStatus).toContain('Certificate Type Expansion And Request Continuity Plan Prepared')
    expect(roadmap).toContain('Certificate Type Expansion And Request Continuity Plan')
    expect(sourceOfTruth).toContain('Certificate Type Expansion And Request Continuity Plan')

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
      expect(plan).not.toContain(forbidden)
    }
  })
})
