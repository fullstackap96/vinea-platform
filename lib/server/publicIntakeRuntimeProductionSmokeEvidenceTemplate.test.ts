import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const templatePath = join(
  root,
  'docs',
  'PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md'
)
const checklistPath = join(
  root,
  'docs',
  'PUBLIC_INTAKE_RUNTIME_PRODUCTION_ENABLEMENT_CHECKLIST.md'
)

describe('public intake runtime production smoke-test evidence template', () => {
  it('keeps the template blank, production-approved, and non-migrating', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      'Status: Blank evidence template.',
      'Product-owner approval phrase recorded: `Yes / No`',
      'Approve Production Runtime Public Intake Routing',
      'Production environment confirmed: `Yes / No`',
      'No migrations applied during this smoke test: `Yes / No`',
      'Operational RLS unchanged during this smoke test: `Yes / No`',
      'No raw public tokens copied into this evidence document: `Yes / No`',
      'No token hashes copied into this evidence document: `Yes / No`',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('captures flag-off baseline and flag-on slug token domain smoke tests', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      '## Flag-Off Baseline',
      '`VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME` absent or disabled',
      '`VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK` absent or invalid',
      'Baptism',
      'Wedding',
      'Funeral',
      'OCIA',
      'Join Parish',
      '## Flag-On Switch-On Record',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME=ENABLED',
      'VINEA_PUBLIC_INTAKE_ROUTING_RUNTIME_ACK=APPROVED_PUBLIC_INTAKE_ROUTING_RUNTIME',
      '## Flag-On Slug Smoke Test',
      '## Flag-On Token Smoke Test',
      '## Flag-On Verified Domain Smoke Test',
      '## Generic Error Smoke Tests',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('requires DNS TLS evidence, audit metadata capture, monitoring, rollback, and sign-off', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const required of [
      '## DNS And TLS Evidence Attachments',
      'Fresh DNS TXT lookup attached',
      'Host resolves to production',
      'HTTPS/TLS valid',
      '## Audit Metadata Capture',
      'publicIntakeRouteSource',
      'publicIntakeRoutingRuntimeEnabled',
      'Forbidden values to check:',
      '## Monitoring Observations',
      '`404` count:',
      '`410` count:',
      '`429` count:',
      '`500` count:',
      '## Rollback Verification',
      'Token signal ignored after rollback',
      'Domain signal ignored after rollback',
      'Slug signal ignored after rollback',
      'No database rollback required',
      '## Sign-Off',
      '## Final Decision',
    ]) {
      expect(template).toContain(required)
    }
  })

  it('is linked from the production enablement checklist', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    expect(checklist).toContain(
      'docs/PUBLIC_INTAKE_RUNTIME_PRODUCTION_SMOKE_TEST_EVIDENCE_TEMPLATE.md'
    )
  })
})
