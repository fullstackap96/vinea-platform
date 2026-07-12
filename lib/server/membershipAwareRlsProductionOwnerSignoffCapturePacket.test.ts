import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md'
)
const readinessRecordPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md'
)
const signoffTemplatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md'
)

describe('membership-aware RLS production owner/sign-off capture packet', () => {
  it('is explicitly non-executing and does not approve production RLS', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Capture packet prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'This packet does not approve:',
      'Production migration execution.',
      'Production database access.',
      'Runtime public intake routing.',
      'Operational RLS changes.',
      'Current outcome: `Owner/sign-off capture packet prepared; production RLS remains blocked`',
      'Current recommendation: `Do not apply production RLS until every owner, sign-off, evidence location, smoke-test fixture, monitoring channel, rollback path, and explicit product-owner approval is complete`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the required evidence package and migration references', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('captures every required owner and backup/contact path', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '## Named Owner Capture',
      '| Responsibility | Required named person | Backup person | Contact path | Required evidence reviewed | Status |',
      '| Product owner |',
      '| Technical owner |',
      '| QA owner |',
      '| Security/data owner |',
      '| Rollback owner |',
      '| Monitoring owner |',
      '| Support owner |',
      '| Evidence storage owner |',
      'Rollback owner and monitoring owner are reachable during the entire rollout window.',
      'Support owner knows the escalation paths and forbidden content rules.',
      'Evidence storage owner confirms where rollout evidence will live and how secrets/private data will be redacted.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('captures role-specific attestations and approval decisions', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '## Role-Specific Approval Record',
      'Allowed decisions:',
      'Approve production rollout',
      'Approve with named conditions',
      'Any `Hold` or `Reject` is a hard `NO-GO`.',
      '## Required Owner Attestations',
      'Product owner attests:',
      'Technical owner attests:',
      'QA owner attests:',
      'Security/data owner attests:',
      'Rollback owner attests:',
      'Monitoring owner attests:',
      'Support owner attests:',
      'Evidence storage owner attests:',
      'They can run `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.',
      'The monitoring channel is active and visible to product, technical, QA, security/data, rollback, and support owners.',
      'They reviewed `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md`.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines exact go/no-go fields and hard stops', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '## Go / No-Go Decision Fields',
      'Production-safe smoke-test data checklist complete',
      'Every named owner assigned',
      'Rollback owner reachable during rollout window',
      'Monitoring owner and channel ready',
      'Support owner and support escalation path ready',
      'Evidence storage owner and location ready',
      'Final automated checks passed on production-intended commit',
      'Pre-apply `/api/health` healthy',
      'Public intake runtime routing confirmed out of scope',
      'Product owner explicit production approval prompt provided',
      'GO_PRODUCTION_RLS_ROLLOUT',
      'NO_GO_MISSING_OWNER',
      'NO_GO_MISSING_SMOKE_DATA',
      'NO_GO_MISSING_SIGNOFF',
      'NO_GO_HEALTH_CHECK',
      'NO_GO_UNRELATED_SCOPE',
      'HOLD_FOR_PRODUCT_OWNER_DECISION',
      'Current decision: `NO_GO_MISSING_OWNER`',
      '## Hard Stop Conditions',
      'Any required owner is unnamed.',
      'Support owner is unavailable.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('is linked from the production readiness and sign-off docs', () => {
    const readinessRecord = readFileSync(readinessRecordPath, 'utf8')
    const signoffTemplate = readFileSync(signoffTemplatePath, 'utf8')

    for (const doc of [readinessRecord, signoffTemplate]) {
      expect(doc).toContain(
        'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md'
      )
    }

    for (const expected of [
      'Monitoring owner is assigned.',
      'Support owner is assigned.',
      'Monitoring owner and channel are assigned.',
      'Support owner and escalation path are assigned.',
      'Current decision: `NO-GO`',
      'Current recommendation: `NO-GO - do not apply production RLS`',
    ]) {
      expect(readinessRecord).toContain(expected)
    }
  })
})
