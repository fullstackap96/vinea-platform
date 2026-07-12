import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'run-parishes-rls-shared-qa-promotion.mjs')

function readScript() {
  return readFileSync(scriptPath, 'utf8')
}

describe('parishes RLS shared QA promotion runner', () => {
  it('requires the approved shared QA URL and explicit confirmation', () => {
    const script = readScript()

    for (const expected of [
      'SHARED_QA_SUPABASE_DB_URL',
      'VINEA_PARISHES_RLS_SHARED_QA_CONFIRM',
      'PARISHES_RLS_SHARED_QA_PROMOTION',
      'gnfomgsuottcuueasfvi',
      'db\\.gnfomgsuottcuueasfvi\\.supabase\\.co',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('blocks non-shared-QA targets and the reusable disposable project', () => {
    const script = readScript()

    for (const expected of [
      'kikqtorplsswepqitjys',
      'Refusing to run: target host is not approved shared QA project ref',
      'Refusing to run against blocked project ref',
      'database host must be the approved shared QA direct database host',
      'productionTouched: false',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('applies only the parishes RLS migration and verifies the policy state', () => {
    const script = readScript()

    for (const expected of [
      '20260630170000_enable_parishes_rls.sql',
      'parishes_select_authorized_staff',
      'is_authorized_for_parish',
      "policy.roles.includes('service_role')",
      'hasServiceRoleBypass',
      'remainingRlsDisabledTablesAfter',
      "status = evidence.verification.passed ? 'completed' : 'completed_with_validation_failures'",
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('does not contain obvious credential material', () => {
    const script = readScript()

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
    ]) {
      expect(script).not.toContain(forbidden)
    }
  })
})
