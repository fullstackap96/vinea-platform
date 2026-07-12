import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatesPath = join(
  process.cwd(),
  'docs',
  'INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md'
)
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')
const evidencePath = join(process.cwd(), 'docs', 'INCIDENT_RESPONSE_EVIDENCE_TEMPLATE_20260627.md')

describe('incident customer communication templates', () => {
  it('is explicitly template-only and avoids production/runtime changes', () => {
    const templates = readFileSync(templatesPath, 'utf8')

    for (const expected of [
      'Status: Templates prepared only.',
      'No customer communication was sent while preparing these templates.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'These templates are not legal advice, not approved breach notification language',
      'Current outcome: `Customer communication templates prepared; legal approval and drill evidence pending`',
    ]) {
      expect(templates).toContain(expected)
    }
  })

  it('includes the required customer-facing templates and coordination notes', () => {
    const templates = readFileSync(templatesPath, 'utf8')

    for (const expected of [
      '## Template 1 - Initial Holding Statement',
      'Subject: Vinea is investigating a possible data access issue',
      '## Template 2 - Confirmed Incident Notice',
      'Subject: Important update about a Vinea data access incident',
      '## Template 3 - No-Impact Notice',
      'Subject: Vinea investigation completed - no data exposure found',
      '## Template 4 - Follow-Up / Resolution Notice',
      'Subject: Follow-up on Vinea data access incident',
      '## Template 5 - Parish / Diocese Coordination Note',
      'Whether communication should come from Vinea, the parish, the diocese, or jointly.',
    ]) {
      expect(templates).toContain(expected)
    }
  })

  it('defines approval gates and blocks unsafe communication content', () => {
    const templates = readFileSync(templatesPath, 'utf8')

    for (const expected of [
      '## Approval Rules',
      '| Confirmed incident notice | Incident commander, legal/data owner, and customer communications owner |',
      'Do not include:',
      'Secrets, credentials, family portal plaintext tokens, signed URLs, or private document contents.',
      'Unverified root-cause claims.',
      'Legal conclusions unless legal/data owner has approved them.',
      '## Internal Review Checklist Before Sending',
      'Message does not overclaim compliance, certification, backup/restore readiness, or production diocesan readiness.',
      'Sent message location is recorded in the incident evidence template.',
    ]) {
      expect(templates).toContain(expected)
    }
  })

  it('updates incident evidence and trust-center docs while blocking maturity overclaims', () => {
    const evidence = readFileSync(evidencePath, 'utf8')
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    expect(evidence).toContain(
      'Use `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md` when drafting customer-facing updates.'
    )

    for (const expected of [
      'Incident customer communication templates: `docs/INCIDENT_CUSTOMER_COMMUNICATION_TEMPLATES_20260627.md`',
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
