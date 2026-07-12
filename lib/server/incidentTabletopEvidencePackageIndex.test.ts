import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('incident tabletop evidence package index', () => {
  const indexPath = 'docs/INCIDENT_TABLETOP_EVIDENCE_PACKAGE_INDEX_20260705.md'

  it('is a non-runtime index and keeps tabletop execution blocked', () => {
    const doc = read(indexPath)

    for (const expected of [
      'Status: Prepared as a non-runtime, non-secret trust-center readiness index only.',
      'No tabletop drill was executed while preparing this index.',
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
      'public trust-center copy was not published',
      'Current public trust-center decision: `NO-GO`',
      'Current incident tabletop decision: `EVIDENCE PACKAGE INDEX PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`',
      'Completion marker: `INCIDENT_TABLETOP_EVIDENCE_PACKAGE_INDEX_20260705`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the full tabletop evidence package', () => {
    const doc = read(indexPath)

    for (const expected of [
      'docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md',
      'docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines review order and approval dependencies before any future drill', () => {
    const doc = read(indexPath)

    for (const expected of [
      '## Review Order Before Any Future Drill',
      'Confirm the owner/sign-off worksheet has non-secret owner labels.',
      'Confirm the execution approval packet still matches the intended safe non-production target.',
      'Confirm the evidence template is blank and label-only before use.',
      'Confirm the tabletop plan covers only synthetic family portal/document exposure and synthetic cross-parish active-parish/RLS exposure.',
      'Confirm the product owner provides the exact approval phrase before any drill execution.',
      '| Owner readiness | `docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md` | Owner labels reviewed with no `TBD` blockers |',
      '| Execution approval | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md` | Exact approval phrase provided |',
      '| Evidence capture | `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md` | Label-only evidence file filled during approved drill |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('captures remaining no-go boundaries and forbidden evidence classes', () => {
    const doc = read(indexPath)

    for (const expected of [
      '| Tabletop drill execution | `NO-GO` | Product owner has not provided exact approval phrase for execution |',
      '| Production access | `NO-GO` | This package is non-production only |',
      '| Production flags | `NO-GO` | No production runtime behavior is in scope |',
      '| Migrations or operational RLS changes | `NO-GO` | The tabletop package is discussion/evidence only |',
      '| Google Calendar, exports, AI, storage, or signed URLs | `NO-GO` | These systems are explicitly out of scope |',
      '| Customer communication sends | `NO-GO` | Communication review is draft-only |',
      '| Public trust-center publishing | `NO-GO` | No actual tabletop drill evidence exists yet |',
      'Raw IDs.',
      'Storage paths.',
      'Signed URL values.',
      'Raw exports.',
      'Raw audit metadata.',
      'AI prompts or outputs.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('limits wording to internal prepared-package language and blocks public claims', () => {
    const doc = read(indexPath)

    for (const expected of [
      'Vinea has prepared a non-production incident tabletop drill package with owner labels, approval gates, redaction rules, a future evidence template, synthetic scenarios, and public-claim boundaries. The tabletop drill has not been run.',
      'Do not say:',
      'Vinea has completed an incident tabletop drill.',
      'Vinea has production incident-response evidence.',
      'Vinea is ready to publish incident-response trust-center claims.',
      'Vinea has legal-approved customer notification workflows.',
      'Vinea has formal compliance certification.',
      'Until that approval is provided, keep the tabletop drill and public trust-center claims `NO-GO`.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the evidence package index', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Incident Tabletop Evidence Package Index Prepared')
    expect(roadmap).toContain('incident tabletop evidence package index')
    expect(ssot).toContain('incident tabletop evidence package index')
  })

  it('does not include obvious secret, raw-data, signed-url, token, or fake evidence markers', () => {
    const doc = read(indexPath)

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
