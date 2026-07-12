import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md'
)

describe('membership-aware RLS production sign-off template', () => {
  it('is explicitly a pending template and does not approve production', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Status: Template prepared only.',
      'Production is not approved.',
      'Production was not touched while preparing this template',
      'no migrations were applied',
      'runtime behavior was not changed',
      'Current outcome: `Template prepared; all production approvals pending`',
      'Current recommendation: `Do not apply production RLS`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('links rollout, rollback, shared QA, active-cookie, and validation evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md',
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md',
      'Shared QA migration, rollback rehearsal, workflow, document, family portal, and active-parish-cookie smoke evidence',
      'vinea_active_parish_id',
      'route smoke passed with request detail API HTTP `200`',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires named approvals and production-safe test requirements', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '| Product owner | `PENDING` |',
      '| Technical owner | `PENDING` |',
      '| QA owner | `PENDING` |',
      '| Security/data owner | `PENDING` |',
      '| Rollback owner | `PENDING` |',
      '| Monitoring owner | `PENDING` |',
      '| Support owner | `PENDING` |',
      '| Evidence storage owner | `PENDING` |',
      'Production-safe staff user for sign-in and dashboard smoke.',
      'Production-safe active parish selection for that staff user.',
      'Production-safe request for request detail smoke.',
      'Production-safe family portal token plan.',
      'Production rollout evidence owner and storage location.',
      'Monitoring owner and channel.',
      'Support owner and escalation path.',
      'Evidence storage owner and redaction plan.',
      'Monitoring owner or channel for `/api/health`',
      'Any `Hold` or `Reject` blocks production execution.',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('keeps final production execution blocked until explicit approval', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'Every named approval row is complete.',
      'No decision is `Hold` or `Reject`.',
      'Production-safe staff credentials and test records are identified.',
      'Production rollout evidence template is ready to be filled during the rollout window.',
      'Rollback owner is present.',
      'Monitoring owner and channel are ready.',
      'Support owner and escalation path are ready.',
      'Evidence storage owner and location are ready.',
      'Final test, lint, and build pass on the production-intended commit.',
      'Product owner gives a separate explicit prompt approving production application.',
    ]) {
      expect(template).toContain(expected)
    }
  })
})
