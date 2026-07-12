import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(path: string) {
  return readFileSync(join(root, path), 'utf8')
}

describe('non-production incident tabletop drill evidence template', () => {
  const evidencePath = 'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_20260705_APPROVED_SYNTHETIC_TARGET.md'

  it('is label-only evidence template work and keeps the tabletop unexecuted', () => {
    const doc = read(evidencePath)

    for (const expected of [
      'Status: Prepared as a label-only evidence template for a future approved non-production tabletop drill.',
      'No tabletop drill was executed while preparing this template.',
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
      'Current incident tabletop decision: `EVIDENCE TEMPLATE PREPARED; TABLETOP DRILL NOT APPROVED OR EXECUTED`',
      'Completion marker: `NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EVIDENCE_TEMPLATE_20260705_APPROVED_SYNTHETIC_TARGET`',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('links the execution packet, worksheet, drill plan, runbook, evidence template, and communication templates', () => {
    const doc = read(evidencePath)

    for (const expected of [
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_EXECUTION_APPROVAL_PACKET_20260705.md',
      'docs/INCIDENT_TABLETOP_OWNER_SIGNOFF_WORKSHEET_20260705.md',
      'docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md',
      'docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md',
      'docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md',
      'docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md',
      'docs/TRUST_CENTER_PUBLIC_CLAIMS_BOUNDARY_MATRIX_20260705.md',
      'docs/TRUST_CENTER_CLAIMS_OWNER_REVIEW_WORKSHEET_20260705.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('requires approval and owner labels before future execution', () => {
    const doc = read(evidencePath)

    for (const expected of [
      '| Approval phrase present? | `PENDING - DO NOT RUN` |',
      '| Approval phrase | `PENDING - APPROVAL REQUIRED` |',
      '| Approved non-production target label | `PENDING - LABEL ONLY` |',
      '| Drill executed? | `No - template prepared only` |',
      '| Production involved? | `No` |',
      '| Public trust-center decision | `NO-GO` |',
      '| Incident commander | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Technical lead | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Evidence owner | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Customer communications owner | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Legal/data owner | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Product owner | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Security reviewer | `PENDING - LABEL ONLY` | `PENDING` |',
      '| Support owner | `PENDING - LABEL ONLY` | `PENDING` |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('captures both synthetic tabletop scenarios with safe pass/fail fields', () => {
    const doc = read(evidencePath)

    for (const expected of [
      '## Scenario 1 - Synthetic Family Portal And Request Document Exposure',
      '| Scenario label | `Synthetic family portal and request document exposure drill` |',
      '| Synthetic family portal token label | `PENDING - HASH/STATUS LABEL ONLY; NO PLAINTEXT TOKEN` |',
      '| Signed URL behavior discussion outcome | `PENDING - DISCUSSION ONLY; NO SIGNED URL CREATED` |',
      '| Direct storage privacy discussion outcome | `PENDING - DISCUSSION ONLY; NO STORAGE ACCESSED` |',
      '| Communication draft decision | `PENDING - DRAFT ONLY; DO NOT SEND` |',
      '## Scenario 2 - Synthetic Cross-Parish Active-Parish Or RLS Exposure',
      '| Scenario label | `Synthetic cross-parish active parish or RLS exposure drill` |',
      '| Membership-aware RLS discussion outcome | `PENDING - DISCUSSION ONLY; NO RLS CHANGE` |',
      '| Containment or rollback decision | `PENDING - DISCUSSION ONLY; NO RUNTIME CHANGE` |',
      '| Overall result | `PENDING - PASS, PASS WITH FOLLOW-UP, FAIL, or BLOCKED` |',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('defines redaction, stop-condition, final-result, and public-claim boundaries', () => {
    const doc = read(evidencePath)

    for (const expected of [
      'Evidence uses labels, pass/fail outcomes, and redacted summaries only.',
      'No real parishioner names, family names, staff private details, private document contents',
      'Screenshots, if separately approved, are redacted before being referenced.',
      'Communications are draft-only and not sent.',
      'Public trust-center publishing remains `NO-GO`.',
      '| Production selected or suspected | `PENDING` | `PENDING` |',
      '| Real parishioner/private data appears | `PENDING` | `PENDING` |',
      '| Credential, secret, database URL, storage path, signed URL, raw export, or raw metadata needed | `PENDING` | `PENDING` |',
      '| Public trust-center decision | `NO-GO` |',
      'It does not mean the drill happened, and it does not allow Vinea to make public security or trust-center claims yet.',
    ]) {
      expect(doc).toContain(expected)
    }
  })

  it('keeps roadmap, build status, and SSoT current for the evidence template', () => {
    const buildStatus = read('docs/VINEA_BUILD_STATUS.md')
    const roadmap = read('docs/VINEA_ROADMAP.md')
    const ssot = read('docs/VINEA_SINGLE_SOURCE_OF_TRUTH.md')

    expect(buildStatus).toContain('Non-Production Incident Tabletop Drill Evidence Template Prepared')
    expect(roadmap).toContain('non-production incident tabletop drill evidence template')
    expect(ssot).toContain('non-production incident tabletop drill evidence template')
  })

  it('does not include obvious secret, raw-data, signed-url, token, or fake evidence markers', () => {
    const doc = read(evidencePath)

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
