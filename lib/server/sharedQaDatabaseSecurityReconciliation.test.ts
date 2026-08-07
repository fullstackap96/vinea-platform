import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = process.cwd()
const candidatePath = resolve(
  repoRoot,
  'docs/sql/shared_qa_function_privilege_hardening_candidate.sql',
)
const evidencePath = resolve(
  repoRoot,
  'docs/SHARED_QA_DATABASE_SECURITY_RECONCILIATION_20260807.md',
)
const candidate = readFileSync(candidatePath, 'utf8')
const evidence = readFileSync(evidencePath, 'utf8')

const authenticatedHelpers = [
  'public.current_staff_parish_ids()',
  'public.current_staff_primary_parish_id()',
  'public.is_authorized_for_parish(uuid)',
  'public.is_authorized_staff()',
  'public.primary_parish_id()',
  'public.request_belongs_to_primary_parish(uuid)',
  'public.request_belongs_to_staff_parish(uuid)',
]

const triggerOnlyFunctions = [
  'public.household_members_before_write()',
  'public.parishioners_set_parish_id_before_insert()',
  'public.people_households_before_write()',
  'public.sacramental_record_events_after_write()',
  'public.sacramental_records_before_write()',
  'public.sync_parish_membership_from_staff_user()',
  'public.vinea_validate_schedule_not_past()',
  'public.workflow_templates_touch_updated_at()',
]

const serviceRoleFunctions = [
  'public.check_public_intake_rate_limit(text, integer, integer)',
  'public.create_request_workflow_steps_from_active_template(uuid)',
  'public.current_staff_parish_ids()',
  'public.is_authorized_for_parish(uuid)',
]

describe('shared-QA database security reconciliation candidate', () => {
  it('stays non-applied and outside the migration folder', () => {
    expect(candidatePath.replaceAll('\\', '/')).toContain('/docs/sql/')
    expect(candidatePath.replaceAll('\\', '/')).not.toContain('/supabase/migrations/')
    expect(candidate).toContain('NON-APPLIED SECURITY CANDIDATE')
    expect(candidate).toContain('must not be run')
    expect(evidence).toContain(
      'DISPOSABLE VALIDATION PASSED; SHARED-QA APPLICATION NO-GO',
    )
  })

  it('removes browser execution before granting the minimum staff surface', () => {
    for (const signature of [...authenticatedHelpers, ...triggerOnlyFunctions]) {
      expect(candidate).toContain(
        `REVOKE EXECUTE ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated, service_role;`,
      )
    }

    for (const signature of authenticatedHelpers) {
      expect(candidate).toContain(
        `GRANT EXECUTE ON FUNCTION ${signature} TO authenticated;`,
      )
    }

    for (const signature of triggerOnlyFunctions) {
      expect(candidate).not.toContain(
        `GRANT EXECUTE ON FUNCTION ${signature} TO authenticated;`,
      )
    }

    expect(candidate).not.toMatch(/GRANT\s+EXECUTE[\s\S]*\sTO\s+anon\s*;/i)
  })

  it('keeps the exact server-owned service-role surface', () => {
    for (const signature of [
      'public.check_public_intake_rate_limit(text, integer, integer)',
      'public.create_request_workflow_steps_from_active_template(uuid)',
    ]) {
      expect(candidate).toContain(
        `REVOKE EXECUTE ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated, service_role;`,
      )
      expect(candidate).not.toContain(
        `GRANT EXECUTE ON FUNCTION ${signature} TO authenticated;`,
      )
    }

    for (const signature of serviceRoleFunctions) {
      expect(candidate).toContain(
        `GRANT EXECUTE ON FUNCTION ${signature} TO service_role;`,
      )
    }

    expect(candidate.match(/TO service_role;/g)).toHaveLength(serviceRoleFunctions.length)
  })

  it('fixes only the mutable trigger search path and leaves RLS untouched', () => {
    expect(candidate).toContain(
      "ALTER FUNCTION public.vinea_validate_schedule_not_past()\n  SET search_path = '';",
    )
    expect(candidate).not.toMatch(/CREATE\s+POLICY|ALTER\s+POLICY/i)
    expect(candidate).not.toMatch(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i)
    expect(candidate).not.toMatch(/INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM/i)
  })

  it('keeps advisor classification, drift, validation, and no-go boundaries explicit', () => {
    for (const table of [
      'audit_logs',
      'parish_google_integrations',
      'rate_limit_buckets',
      'request_portal_tokens',
    ]) {
      expect(evidence).toContain(table)
    }

    for (const migration of [
      '20260625193000_public_intake_parish_routing.sql',
      '20260626170000_membership_aware_operational_rls.sql',
      '20260630170000_enable_parishes_rls.sql',
    ]) {
      expect(evidence).toContain(migration)
    }

    expect(evidence).toContain('Do not replay any target migration')
    expect(evidence).toContain('approved disposable target')
    expect(evidence).toContain('Leaked-password protection is disabled')
    expect(evidence).toContain('remain `NO-GO`')
  })
})
