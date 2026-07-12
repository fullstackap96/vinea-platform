import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const gatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md'
)

describe('membership-aware RLS production readiness gate', () => {
  it('records the gate as production planning only without applying migrations', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'Production was not touched',
      'Current recommendation: `Production Packet Prepared; Do Not Apply Production Yet`',
      'Production application approved: `No`',
      'New migration applied in this step: `No`',
      'Runtime public intake routing changed: `No`',
      'Operational RLS changed in this step: `No`',
      'Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`',
      'Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`',
      'Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`',
      'Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`',
      'Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('includes shared QA and active-parish-cookie route smoke evidence', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'Shared QA project: `gnfomgsuottcuueasfvi`',
      'Shared QA final policy state: membership-aware operational RLS active.',
      'Shared QA `/api/health`: `ok: true`, `checks.schema: true`.',
      'Fixed active-parish-cookie evidence:',
      'Active parish cookie name: `vinea_active_parish_id`',
      'Live shared QA result: route smoke passed with `activeParishCookieUsed: true`.',
      'Request detail access API result: HTTP `200`, `ok: true`.',
      'Shared QA direct storage privacy: anon direct storage download denied with `404`.',
    ]) {
      expect(gate).toContain(expected)
    }
  })

  it('lists production blockers, packet requirements, and no-go conditions', () => {
    const gate = readFileSync(gatePath, 'utf8')

    for (const expected of [
      'Named technical owner sign-off is still required.',
      'Named QA owner sign-off is still required.',
      'Named security/data owner sign-off is still required.',
      'Product-owner production approval is still required',
      'A production rollback owner must be named',
      'Production-safe staff credentials and production-safe test records must be identified in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` before execution.',
      'The production rollout evidence template must have an evidence owner and storage location ready before execution.',
      'The production final approval readiness record must be updated from `NO-GO` to `GO` only after all blockers are resolved.',
      'Exact migration file: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`',
      'Exact rollback file: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`',
      'Forward migration output.',
      'Monitoring observations, cleanup/deactivation result, rollback decision, and final outcome.',
      'Final approval readiness decision: `GO`, `NO-GO`, or `HOLD`.',
      'The active-parish-cookie route smoke is not included in the evidence package.',
      'The production rollout evidence template owner/storage location is not ready.',
      'The production final approval readiness record is still `NO-GO`.',
      'Public intake runtime routing or other unrelated feature work is bundled',
    ]) {
      expect(gate).toContain(expected)
    }
  })
})
