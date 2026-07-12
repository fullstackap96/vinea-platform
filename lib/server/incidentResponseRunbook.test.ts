import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const runbookPath = join(process.cwd(), 'docs', 'INCIDENT_RESPONSE_RUNBOOK_20260627.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('incident response runbook', () => {
  it('is explicitly readiness-only and avoids production/runtime changes', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      'Status: Prepared as an incident response readiness runbook only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'This is not evidence that Vinea has completed a production incident drill',
      'Current incident response readiness: `RUNBOOK PREPARED, INCIDENT DRILL AND NAMED OWNERS PENDING`',
      'Current outcome: `Incident response runbook prepared; named owners and drill evidence pending`',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('covers severity levels, responsibilities, evidence, containment, recovery, and communication', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      '## Severity Levels',
      '`SEV-1 Critical`',
      'Escalate severity when sacramental records, minors, pastoral notes, family portal data, documents, or multi-parish boundaries are involved.',
      '## Incident Roles',
      '| Incident commander | Owns severity, timeline, decisions, and coordination | `PENDING` |',
      '## Evidence And Audit-Log Preservation',
      'Relevant audit events and timestamps.',
      'Do not:',
      'Delete audit logs.',
      '## Containment Playbook',
      'Disable a feature flag.',
      '## Recovery Playbook',
      '## Customer Communication',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('defines production approval gates and postmortem requirements', () => {
    const runbook = readFileSync(runbookPath, 'utf8')

    for (const expected of [
      '## Production Approval Gates',
      '| Production migration, RLS rollback, or database policy change | Incident commander, technical lead, security reviewer, and product owner |',
      'All production commands, migrations, rollbacks, and feature-flag changes must be copied into the incident record with secrets redacted.',
      '## Postmortem',
      'Every `SEV-1` and `SEV-2` incident requires a postmortem.',
      'Postmortems should be blameless but specific.',
      'Trust-center claim impact.',
    ]) {
      expect(runbook).toContain(expected)
    }
  })

  it('updates the trust-center packet while blocking incident-response overclaims', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Incident response runbook: `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`',
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
