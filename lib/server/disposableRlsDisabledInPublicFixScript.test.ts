import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'fix-disposable-rls-disabled-in-public.mjs')

function readScript() {
  return readFileSync(scriptPath, 'utf8')
}

describe('disposable rls_disabled_in_public fix script', () => {
  it('requires the approved disposable target and explicit confirmation', () => {
    const script = readScript()

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_DISPOSABLE_RLS_FIX_CONFIRM',
      'FIX_KIKQ_RLS_DISABLED_IN_PUBLIC',
      'VINEA_DISPOSABLE_RLS_FIX_EXECUTE',
      'EXECUTE_FIX',
      "const approvedProjectRef = 'kikqtorplsswepqitjys'",
      'Refusing to run: RLS fix is approved only for',
      'gnfomgsuottcuueasfvi',
      'Refusing to run against blocked project ref',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('targets only non-extension-owned public tables with RLS disabled', () => {
    const script = readScript()

    for (const expected of [
      "n.nspname = 'public'",
      "c.relkind in ('r', 'p')",
      'c.relrowsecurity = false',
      "d.deptype = 'e'",
      'not exists',
      'alter table',
      'enable row level security',
      'ensureParishesReadPolicy',
      'parishes_select_authorized_staff',
      'to authenticated, service_role',
      'public.is_authorized_for_parish(id)',
      'remainingRlsDisabledTables',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('supports dry-run evidence before execute mode', () => {
    const script = readScript()

    for (const expected of [
      "status: executeFix ? 'started' : 'dry_run'",
      "advisorIssue: 'rls_disabled_in_public'",
      'before: []',
      'alteredTables: []',
      'parishesPolicyApplied: false',
      'parishesPolicyNames: []',
      'after: []',
      "'dry_run_ready'",
      "'dry_run_needs_fix'",
      "'fixed'",
      "'fix_incomplete'",
      'JSON.stringify(evidence, null, 2)',
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

  it('does not reintroduce deprecated role predicates in the parishes policy', () => {
    const script = readScript()

    expect(script).not.toMatch(/\bauth\.role\s*\(/i)
  })
})
