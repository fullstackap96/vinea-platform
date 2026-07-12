import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const policyPath = join(process.cwd(), 'docs', 'DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md')
const trustCenterPath = join(process.cwd(), 'docs', 'TRUST_CENTER_READINESS_PACKET_20260627.md')

describe('data retention and deletion policy proposal', () => {
  it('is explicitly proposal-only and avoids production/runtime changes', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Status: Proposal prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'This is not yet an approved customer-facing policy, not legal advice, and not a data-deletion automation plan.',
      'Current retention/deletion readiness: `PROPOSAL PREPARED, APPROVAL AND AUTOMATION NOT COMPLETE`',
      'Current outcome: `Retention/deletion policy proposal prepared; approval and automation pending`',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('covers the required parish data categories and canonical exceptions', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Parish operational requests',
      'Internal notes',
      'Communication history',
      'Audit logs',
      'Documents',
      'Family portal tokens',
      'AI outputs',
      '## Parish Offboarding Proposal',
      'Sacramental/canonical records',
      '## Canonical And Sacramental Exceptions',
      'Vinea should not automatically delete:',
      'Sacramental records.',
      'Certificate issuance logs.',
      'Use correction, notation, superseded-state, or restricted-visibility workflows instead of hard deletion.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('defines approval gates and blocks automated deletion overclaims', () => {
    const policy = readFileSync(policyPath, 'utf8')

    for (const expected of [
      'Do not implement automated deletion until these gates are complete:',
      'Product owner approves retention periods.',
      'Legal/data owner approves privacy and contractual requirements.',
      'Parish/canonical record owner approves sacramental/canonical exceptions.',
      'Security/data owner approves audit and deletion evidence requirements.',
      'Do not claim:',
      'Vinea has approved retention automation.',
      'Vinea can delete sacramental/canonical records on demand.',
      'Vinea has legal approval for this policy.',
    ]) {
      expect(policy).toContain(expected)
    }
  })

  it('updates the trust-center packet while keeping public claims blocked', () => {
    const trustCenter = readFileSync(trustCenterPath, 'utf8')

    for (const expected of [
      'Data retention and deletion policy proposal: `docs/DATA_RETENTION_DELETION_POLICY_PROPOSAL_20260627.md`',
      '| Data retention | Data retention and deletion policy proposal exists, but approval and automation are not complete | `PROPOSAL PREPARED` | Product/legal/canonical review and implementation design |',
      'Current status: `PROPOSAL PREPARED, APPROVAL AND AUTOMATION NOT COMPLETE`',
      'Do not implement automated deletion until product owner, legal/data owner, and parish/canonical record requirements are aligned.',
      'Data retention policy is approved.',
      'Prepare incident response runbook for parish data access incidents.',
    ]) {
      expect(trustCenter).toContain(expected)
    }
  })
})
