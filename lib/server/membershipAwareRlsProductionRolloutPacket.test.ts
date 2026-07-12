import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md'
)

describe('membership-aware RLS production rollout packet', () => {
  it('is explicitly a runbook only and does not approve production', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a production runbook only.',
      'Production was not touched while preparing this packet',
      'no migrations were applied',
      'runtime behavior was not changed',
      'This packet is not production approval.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('contains named sign-off placeholders and required environment safety checks', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '| Product owner | `PENDING` |',
      '| Technical owner | `PENDING` |',
      '| QA owner | `PENDING` |',
      '| Security/data owner | `PENDING` |',
      '| Rollback owner | `PENDING` |',
      '$env:PRODUCTION_SUPABASE_DB_URL',
      '$env:VINEA_PRODUCTION_BASE_URL',
      '$env:PGSSLMODE = "require"',
      'Refusing rollout: database host is not a Supabase host.',
      'Refusing rollout: production app URL must be HTTPS.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('contains exact forward and rollback command references', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md',
      'psql "$env:PRODUCTION_SUPABASE_DB_URL"',
      '-v ON_ERROR_STOP=1',
      '-f "supabase/migrations/20260626170000_membership_aware_operational_rls.sql"',
      '-f "docs/sql/membership_aware_operational_rls_rollback_draft.sql"',
      'Invoke-RestMethod -Uri "$env:VINEA_PRODUCTION_BASE_URL/api/health"',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires active-parish-cookie, document, family portal, monitoring, and rollback checks', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Active-Parish-Cookie Request Detail And Document Smoke',
      'vinea_active_parish_id',
      'Direct storage access remains private.',
      'Family Portal Safety Smoke',
      'Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` is complete',
      'Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` has an evidence owner',
      'Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md` has final decision `GO` before touching production.',
      'does not expose `token_hash`',
      'internal notes, staff-only notes, AI notes, audit logs, token hashes, or private parish data',
      'Monitoring Expectations',
      'Rollback Decision Criteria',
      '/api/health` is not `ok: true` or `checks.schema: true`',
      'Unauthorized cross-parish data becomes visible.',
      'Rollback pass criteria',
    ]) {
      expect(packet).toContain(expected)
    }
  })
})
