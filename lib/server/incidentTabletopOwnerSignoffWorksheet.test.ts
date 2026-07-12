import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('incident tabletop owner signoff worksheet', () => {
  it('is non-runtime and explicitly does not execute a tabletop drill', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

    for (const expected of [
      'Status: Prepared as a non-runtime, non-secret owner/sign-off worksheet using role labels only.',
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
      'no tabletop drill was executed',
      'public trust-center copy was not published',
      'Current public trust-center decision: `NO-GO`',
      'Current incident response decision: `OWNER SIGN-OFF WORKSHEET PREPARED; TABLETOP DRILL NOT EXECUTED`',
      'Completion marker: `INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the incident response runbook, evidence template, drill plan, and communication templates', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

    for (const expected of [
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md',
      'docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('maps owners, support communication owners, evidence owners, scenarios, statuses, missing evidence, and next actions', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

    for (const expected of [
      'Incident response owner label',
      'Support communication owner label',
      'Evidence owner label',
      'Security/data owner label',
      'Synthetic scenario label',
      'Current approval status',
      'Missing evidence',
      'Next safe action',
      '| Overall tabletop readiness | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `All approved synthetic incident scenarios` | `NO-GO` |',
      '| Family portal/document exposure scenario | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic family portal and request document exposure drill` | `READY_FOR_OWNER_REVIEW` |',
      '| Cross-parish active-parish/RLS scenario | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic cross-parish active parish or RLS exposure drill` | `READY_FOR_OWNER_REVIEW` |',
      '| Customer communication review | `Vinea incident commander` | `Vinea customer communications owner` | `Vinea evidence owner` | `Vinea legal/data owner` | `Synthetic customer communication draft review` | `NO-GO` |',
      '| Evidence handling and storage | `Vinea incident commander` | `Vinea support owner` | `Vinea evidence owner` | `Vinea security/data owner` | `Synthetic evidence capture and redaction review` | `NO-GO` |',
      '| Postmortem and follow-up ownership | `Vinea incident commander` | `Vinea support owner` | `Vinea evidence owner` | `Vinea product owner` | `Synthetic postmortem and follow-up assignment review` | `NO-GO` |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines approval statuses and blocks execution until separately approved', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

    for (const expected of [
      '`NO-GO`',
      '`READY_FOR_OWNER_REVIEW`',
      '`APPROVED_FOR_NONPRODUCTION_DRILL_PLANNING`',
      '`APPROVED_FOR_NONPRODUCTION_DRILL_EXECUTION`',
      '`COMPLETED_NONPRODUCTION_DRILL_REVIEW`',
      'This worksheet starts at `NO-GO`. It does not grant `APPROVED_FOR_NONPRODUCTION_DRILL_EXECUTION`.',
      'Approve non-production incident tabletop drill planning only.',
      'Do not run the drill',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('covers synthetic scenarios and stop conditions without exposing sensitive data', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

    for (const expected of [
      'Synthetic family portal and request document exposure drill',
      'Family portal, request documents, signed URL behavior, direct storage privacy, token deactivation decision, staff-only data exclusion',
      'Synthetic cross-parish active parish or RLS exposure drill',
      'Active parish context, membership-aware RLS discussion, request detail, documents, notes, communications, workflow steps, people, households, sacramental records, Mass intentions',
      'Synthetic customer communication draft review',
      'Synthetic evidence capture and redaction review',
      'Synthetic postmortem and follow-up assignment review',
      'The drill target is production or contains real parishioner/private document data.',
      'Required owner labels are still blank or `TBD`.',
      'Customer communication review would send a message instead of drafting only.',
      'The drill would imply a public trust-center claim.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the worksheet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Incident Tabletop Owner Sign-Off Worksheet Prepared')
    expect(roadmap).toContain('incident tabletop owner/sign-off worksheet')
    expect(ssot).toContain('incident tabletop owner/sign-off worksheet')
  })

  it('does not include obvious secret, raw-data, signed-url, token, or fake evidence markers', () => {
    const doc = read('docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md')

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
