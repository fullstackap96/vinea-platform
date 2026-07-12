import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('non-production incident tabletop drill execution approval packet', () => {
  it('is approval-packet only and keeps the tabletop unexecuted', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      'Status: Prepared as a non-runtime, non-secret approval packet only.',
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
      'communications were not sent',
      'no tabletop drill was executed',
      'public trust-center copy was not published',
      'Current public trust-center decision: `NO-GO`',
      'Current incident tabletop decision: `EXECUTION APPROVAL PACKET PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`',
      'Completion marker: `NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the worksheet, runbook, evidence template, communication templates, and tabletop plan', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      'docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md',
      'docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_FILLED_EXAMPLE_20260705.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines required non-secret inputs and future approval phrase', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      '| Approval phrase | Exact phrase from product owner | `APPROVED_NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION` |',
      '| Drill target label | Non-production environment label only | `Approved local/shared-QA synthetic tabletop target` |',
      '| Incident commander label | Person or role label only | `Vinea incident commander` |',
      '| Technical lead label | Person or role label only | `Vinea technical lead` |',
      '| Evidence owner label | Person or role label only | `Vinea evidence owner` |',
      '| Customer communications owner label | Person or role label only | `Vinea customer communications owner` |',
      '| Legal/data owner label | Person or role label only | `Vinea legal/data owner` |',
      '| Product owner label | Person or role label only | `Vinea product owner` |',
      '| Security reviewer label | Person or role label only | `Vinea security reviewer` |',
      '| Support owner label | Person or role label only | `Vinea support owner` |',
      '| Evidence file name | Repo-owned evidence markdown path, no secrets | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md` |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('limits future scope to synthetic family portal/document and cross-parish scenarios', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      '`Synthetic family portal and request document exposure drill`',
      'Family portal token exposure concern.',
      'Signed URL behavior discussion without creating signed URLs.',
      'Direct storage privacy discussion without accessing storage.',
      '`Synthetic cross-parish active parish or RLS exposure drill`',
      'Active parish context/cookie concern.',
      'Membership-aware RLS allow/deny discussion.',
      'Containment and rollback decision discussion without changing RLS or runtime behavior.',
      'Customer communication draft only.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines pass/fail gates, stop conditions, evidence requirements, and no-public-claim boundary', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      '| Approval phrase | Exact approval phrase is present | Missing or altered approval phrase |',
      '| Environment | Target is explicitly non-production and synthetic | Production target, real parish data, or ambiguous target |',
      '| Communication | Communications remain draft-only | Any customer, parish, diocese, staff, or family communication is sent |',
      '| Runtime safety | No migrations, RLS changes, runtime changes, record mutations, exports, AI calls, storage access, signed URLs, Google Calendar access, or production flags occur |',
      '| Trust-center boundary | Final evidence says public trust-center claims remain `NO-GO` |',
      'Production is selected or suspected.',
      'Evidence cannot be stored with safe redaction.',
      'The discussion starts producing public trust-center claims.',
      'Public trust-center decision: `NO-GO`.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('includes exact future approval language but does not approve execution now', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

    for (const expected of [
      '## Exact Future Approval Language',
      'Approve execution of the non-production incident tabletop drill only.',
      'I confirm the approval phrase is APPROVED_NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION.',
      'Communications must be draft-only and not sent.',
      'Do not access production, enable production flags, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, expose raw exports or raw metadata, send communications, expose secrets, or make public trust claims.',
      'This packet is the permission slip for a future fake incident drill.',
      'It does not run the drill or prove incident-response readiness yet.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the packet', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Non-Production Incident Tabletop Drill Execution Approval Packet Prepared')
    expect(roadmap).toContain('non-production incident tabletop drill execution approval packet')
    expect(ssot).toContain('non-production incident tabletop drill execution approval packet')
  })

  it('does not include obvious secret, raw-data, signed-url, token, or fake evidence markers', () => {
    const doc = read('docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md')

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
