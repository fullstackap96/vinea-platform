import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(process.cwd(), 'docs', 'INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md')
const drillPlanPath = join(process.cwd(), 'docs', 'NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('incident response evidence template and tabletop drill plan', () => {
  it('keeps both docs non-production and non-runtime', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const drillPlan = readFileSync(drillPlanPath, 'utf8')

    for (const doc of [evidence, drillPlan]) {
      for (const expected of [
        'Production was not accessed',
        'no migrations were applied',
        'runtime behavior was not changed',
        'operational RLS was not changed',
      ]) {
        expect(doc).toContain(expected)
      }
    }

    expect(evidence).toContain('Status: Template prepared only. No incident drill was executed while preparing this template.')
    expect(drillPlan).toContain('Status: Plan prepared only. No tabletop drill was executed while preparing this plan.')
  })

  it('captures incident evidence without secrets or unnecessary private data', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '## Incident Identity',
      '## Scenario Classification',
      'Family portal token exposure.',
      'Request document signed URL exposure.',
      'Cross-parish request/detail visibility.',
      'Active parish context/cookie scope failure.',
      'Membership-aware RLS allow/deny failure.',
      '## Evidence Inventory',
      'Do not paste secrets, plaintext family portal tokens, private document contents, production credentials, or unnecessary parishioner data into this record.',
      'Family portal token metadata',
      'Hash/status/expiration only; no plaintext token',
      '## Recovery Verification',
      'No internal notes, AI notes, audit logs, token hashes, or private parish data exposed',
      '## Completion Gate',
      'Evidence template prepared; no incident or tabletop drill executed',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('defines non-production drills for family portal/document and cross-parish/RLS scenarios', () => {
    const drillPlan = readFileSync(drillPlanPath, 'utf8')

    for (const expected of [
      '## Drill 1 - Family Portal And Document Exposure',
      'Synthetic request document with harmless content.',
      'Family portal safety check explicitly verifies no internal notes, AI notes, audit logs, token hashes, or private parish data are exposed.',
      'Request document access and signed URL behavior are checked.',
      'Direct storage privacy is checked.',
      '## Drill 2 - Cross-Parish Active Parish Or RLS Exposure',
      'Two synthetic parishes.',
      'Active parish cookie/context test notes.',
      'Cross-parish allow/deny cases are documented for requests, documents, notes, communications, workflow steps, people, households, sacramental records, and mass intentions if present in the test environment.',
      'Membership-aware RLS behavior is discussed without applying production RLS changes.',
      'Final drill result: `PASS`, `PASS WITH FOLLOW-UP`, or `FAIL`.',
    ]) {
      expect(drillPlan).toContain(expected)
    }
  })

  it('updates the trust-center packet while keeping maturity claims blocked', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Incident response evidence template: `docs/INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md`',
      'Non-production incident tabletop drill plan: `docs/NONPRODUCTION_INCIDENT_TABLETOP_DRILL_PLAN_20260627.md`',
      '| Incident response | Runbook, evidence template, tabletop drill plan, and customer communication templates exist, but named owners, legal approval, and drill evidence are pending | `RUNBOOK AND COMMUNICATION PACKAGE PREPARED` | Assign owners, review templates, and execute tabletop drills |',
      'Current status: `RUNBOOK AND COMMUNICATION PACKAGE PREPARED, INCIDENT DRILL AND NAMED OWNERS PENDING`',
      'Do not claim incident response maturity until named owners, customer communication template approval, evidence handling, and non-production drill evidence are complete.',
      'Incident response owner/channel/process is documented.',
      'Prepare AI safety and permission-scoped retrieval policy and non-runtime registry.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
