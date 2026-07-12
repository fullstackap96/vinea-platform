import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const recordPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md'
)

describe('membership-aware RLS production final approval readiness record', () => {
  it('is explicitly a non-executing readiness record with current NO-GO recommendation', () => {
    const record = readFileSync(recordPath, 'utf8')

    for (const expected of [
      'Status: Final approval readiness record prepared only.',
      'Production was not accessed',
      'no migrations were applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Current decision: `NO-GO`',
      'This record is the single go/no-go summary for the future production decision.',
      'This record is the single go/no-go summary for the future production decision. It does not approve production execution.',
      'Current recommendation: `NO-GO - do not apply production RLS`',
    ]) {
      expect(record).toContain(expected)
    }
  })

  it('ties together the production approval packet and evidence sources', () => {
    const record = readFileSync(recordPath, 'utf8')

    for (const expected of [
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md',
      'docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md',
      'docs/VINEA_BUILD_STATUS.md',
    ]) {
      expect(record).toContain(expected)
    }
  })

  it('summarizes completed evidence and pending blockers', () => {
    const record = readFileSync(recordPath, 'utf8')

    for (const expected of [
      '| Disposable forward/rollback validation |',
      '| Shared QA promotion and rollback rehearsal |',
      '| Shared QA authenticated workflow smoke |',
      '| Shared QA document/family portal safety smoke |',
      '| Fixed active-parish-cookie request/detail document smoke |',
      '| Production smoke fixture worksheet |',
      '`PREPARED BUT INCOMPLETE`',
      'Blocks approval until fixtures are selected',
      '| Production smoke-test data checklist |',
      '| Named production sign-offs |',
      '| Owner/sign-off capture packet |',
      '| Final go/no-go review checklist |',
      'Blocks approval until every production artifact cross-checks cleanly',
      '| Production rollout evidence owner/storage |',
      '| Final automated checks on production-intended commit |',
      'Decision impact: `BLOCKS PRODUCTION APPROVAL`',
      'Decision impact: `SUPPORTS FUTURE APPROVAL`',
    ]) {
      expect(record).toContain(expected)
    }
  })

  it('requires exact go criteria, no-go criteria, and remaining blockers before approval can change', () => {
    const record = readFileSync(recordPath, 'utf8')

    for (const expected of [
      'Production-safe smoke-test data checklist is completed.',
      'Production-safe smoke fixture worksheet is completed.',
      'Smoke fixture worksheet status is `COMPLETE`.',
      'Final go/no-go review checklist is completed.',
      'Final go/no-go review checklist decision is `GO_READY_FOR_PRODUCT_OWNER_APPROVAL`.',
      'Product owner sign-off is recorded.',
      'Technical owner sign-off is recorded.',
      'QA owner sign-off is recorded.',
      'Security/data owner sign-off is recorded.',
      'Rollback owner sign-off is recorded.',
      'Monitoring owner is assigned.',
      'Support owner is assigned.',
      'Production rollout evidence owner is assigned.',
      'Production rollout evidence storage location is assigned.',
      'Final tests, lint, and build pass on the exact production-intended commit.',
      'Customer/support communication note approvers and support owner are named.',
      'Customer/support communication note owner and approvers are assigned.',
      'Monitoring owner and channel are assigned.',
      'Support owner and escalation path are assigned.',
      'Product owner provides a separate explicit production approval prompt.',
      'The final decision may change to `GO` only when all criteria below are true:',
      'The final decision must remain `NO-GO` if any of these are true:',
      'Public intake runtime routing remains out of scope.',
    ]) {
      expect(record).toContain(expected)
    }
  })
})
